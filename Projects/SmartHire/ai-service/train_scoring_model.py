from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = DATA_DIR / "scoring_training_data.csv"
MODEL_PATH = MODELS_DIR / "scoring_model.pkl"

FEATURE_COLUMNS = [
    "overall_score",
    "technical_skills_score",
    "experience_score",
    "projects_score",
    "education_score",
    "soft_skills_score",
    "certifications_score",
    "cv_completeness_score",
    "missing_required_skills_count",
    "missing_optional_skills_count",
    "ahp_explainable_score",
]


def clamp(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, value))


def generate_synthetic_dataset(rows=2500, seed=42):
    rng = np.random.default_rng(seed)
    records = []

    for _ in range(rows):
        profile_type = rng.choice(
            ["strong", "average", "weak", "incomplete"],
            p=[0.28, 0.34, 0.26, 0.12],
        )

        if profile_type == "strong":
            overall = rng.uniform(68, 100)
            technical = rng.uniform(65, 100)
            experience = rng.uniform(65, 100)
            projects = rng.uniform(55, 100)
            education = rng.uniform(35, 90)
            soft_skills = rng.uniform(0, 95)
            certifications = rng.uniform(0, 85)
            completeness = rng.uniform(75, 100)
        elif profile_type == "average":
            overall = rng.uniform(45, 78)
            technical = rng.uniform(35, 78)
            experience = rng.uniform(35, 78)
            projects = rng.uniform(25, 75)
            education = rng.uniform(25, 85)
            soft_skills = rng.uniform(0, 90)
            certifications = rng.uniform(0, 70)
            completeness = rng.uniform(65, 100)
        elif profile_type == "incomplete":
            overall = rng.uniform(35, 82)
            technical = rng.uniform(25, 85)
            experience = rng.uniform(20, 85)
            projects = rng.uniform(10, 75)
            education = rng.uniform(0, 75)
            soft_skills = rng.uniform(0, 80)
            certifications = rng.uniform(0, 60)
            completeness = rng.uniform(25, 62)
        else:
            overall = rng.uniform(10, 52)
            technical = rng.uniform(0, 50)
            experience = rng.uniform(0, 55)
            projects = rng.uniform(0, 55)
            education = rng.uniform(0, 70)
            soft_skills = rng.uniform(0, 75)
            certifications = rng.uniform(0, 50)
            completeness = rng.uniform(45, 95)

        missing_required = int(
            clamp(round((100 - technical) / 28 + rng.normal(0, 0.9)), 0, 6)
        )
        missing_optional = int(
            clamp(round((100 - technical) / 20 + rng.normal(1, 1.4)), 0, 8)
        )

        ahp_score = clamp(
            technical * 0.32
            + experience * 0.18
            + projects * 0.17
            + education * 0.10
            + soft_skills * 0.13
            + certifications * 0.05
            + completeness * 0.05
            + rng.normal(0, 4)
        )

        final_score = clamp(
            overall * 0.25
            + technical * 0.30
            + experience * 0.16
            + projects * 0.12
            + education * 0.05
            + soft_skills * 0.04
            + certifications * 0.02
            + completeness * 0.06
            - missing_required * 5
            - missing_optional * 1.5
            + rng.normal(0, 3)
        )

        records.append(
            {
                "overall_score": round(overall, 2),
                "technical_skills_score": round(technical, 2),
                "experience_score": round(experience, 2),
                "projects_score": round(projects, 2),
                "education_score": round(education, 2),
                "soft_skills_score": round(soft_skills, 2),
                "certifications_score": round(certifications, 2),
                "cv_completeness_score": round(completeness, 2),
                "missing_required_skills_count": missing_required,
                "missing_optional_skills_count": missing_optional,
                "ahp_explainable_score": round(ahp_score, 2),
                "final_score": round(final_score, 2),
            }
        )

    return pd.DataFrame(records)


def train_model():
    DATA_DIR.mkdir(exist_ok=True)
    MODELS_DIR.mkdir(exist_ok=True)

    dataset = generate_synthetic_dataset()
    dataset.to_csv(DATASET_PATH, index=False)

    x = dataset[FEATURE_COLUMNS]
    y = dataset["final_score"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = LinearRegression()
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    joblib.dump(
        {
            "model": model,
            "features": FEATURE_COLUMNS,
            "metrics": {
                "mae": round(float(mae), 2),
                "r2": round(float(r2), 3),
            },
            "training_rows": len(dataset),
            "model_name": "LinearRegression",
            "version": "smart_hire_scoring_lr_v1",
        },
        MODEL_PATH,
    )

    print(f"Dataset saved to: {DATASET_PATH}")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"MAE: {mae:.2f}")
    print(f"R2: {r2:.3f}")


if __name__ == "__main__":
    train_model()
