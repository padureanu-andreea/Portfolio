from fastapi import FastAPI
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import joblib
import pandas as pd
import re

app = FastAPI(title="SmartHire AI Service")

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
SCORING_MODEL_PATH = Path(__file__).resolve().parent / "models" / "scoring_model.pkl"
scoring_model_bundle = None
scoring_model_mtime = None

SCORING_FEATURES = [
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


def get_scoring_model_bundle():
    global scoring_model_bundle, scoring_model_mtime

    if not SCORING_MODEL_PATH.exists():
        scoring_model_bundle = None
        scoring_model_mtime = None
        return None

    current_mtime = SCORING_MODEL_PATH.stat().st_mtime

    if scoring_model_bundle is None or scoring_model_mtime != current_mtime:
        scoring_model_bundle = joblib.load(SCORING_MODEL_PATH)
        scoring_model_mtime = current_mtime

    return scoring_model_bundle


class CvAnalysisRequest(BaseModel):
    cvText: str
    knownSkills: list[str]


class CvJobScoreRequest(BaseModel):
    cvText: str
    jobDescription: str
    jobSkills: list[dict] = Field(default_factory=list)
    cvSkills: list[dict] = Field(default_factory=list)
    ahpWeights: dict = Field(default_factory=dict)


def split_text(text):
    parts = re.split(r"[\n.;]+", text or "")
    return [part.strip() for part in parts if len(part.strip()) > 3]


def clean_text(text):
    return re.sub(r"\s+", " ", text or "").strip()


def normalize_text(text):
    normalized = (text or "").lower()
    normalized = normalized.replace(".js", "")
    normalized = normalized.replace("react.js", "react")
    normalized = normalized.replace("rest apis", "rest api")
    normalized = normalized.replace("single page applications", "spa")
    normalized = normalized.replace("single page application", "spa")
    normalized = re.sub(r"[^a-z0-9+#]+", " ", normalized)
    return re.sub(r"\s+", " ", normalized).strip()


def extract_section(text, keywords):
    lines = [line.strip() for line in (text or "").splitlines()]
    selected = []
    is_collecting = False

    stop_words = [
        "educatie",
        "education",
        "competente",
        "skills",
        "experienta",
        "experience",
        "proiecte",
        "projects",
        "certificari",
        "certifications",
        "voluntariat",
        "volunteering",
    ]

    for line in lines:
        lower_line = line.lower()

        if any(keyword in lower_line for keyword in keywords):
            is_collecting = True
            selected.append(line)
            continue

        if (
            is_collecting
            and any(word in lower_line for word in stop_words)
            and len(selected) > 0
        ):
            break

        if is_collecting and line:
            selected.append(line)

    return "\n".join(selected[:12])


def estimate_years(fragment):
    fragment_lower = fragment.lower()

    beginner_markers = [
        "basic",
        "beginner",
        "familiar",
        "limited",
        "introductory",
        "notiuni",
        "notiuni de baza",
        "nivel basic",
        "nivel incepator",
        "incepator",
    ]

    if any(marker in fragment_lower for marker in beginner_markers):
        return 0

    matches = re.findall(r"(\d+)\s*(ani|an|years|year)", fragment.lower())

    if not matches:
        return 1

    return max(int(match[0]) for match in matches)


def estimate_level(confidence, years):
    if years >= 5 and confidence >= 0.65:
        return 5

    if years >= 3 and confidence >= 0.55:
        return 4

    if years >= 1 and confidence >= 0.45:
        return 3

    if confidence >= 0.55:
        return 2

    return 1


def find_evidence_for_skill(skill, fragments, cv_text):
    skill_lower = skill.lower()

    for fragment in fragments:
        if skill_lower in fragment.lower():
            return fragment

    return cv_text[:250]


NEGATIVE_EVIDENCE_MARKERS = [
    "absent",
    "no experience",
    "without experience",
    "unknown",
    "not known",
    "not familiar",
    "no direct experience",
    "lipsa",
    "fara experienta",
    "necunoscut",
    "nu cunosc",
    "nu exista experienta",
]


def is_negative_evidence(fragment):
    normalized_fragment = normalize_text(fragment)

    return any(
        marker in normalized_fragment
        for marker in NEGATIVE_EVIDENCE_MARKERS
    )


def has_negative_evidence_for_skill(skill_name, cv_text):
    if not skill_name or not cv_text:
        return False

    skill_terms = get_skill_terms(skill_name)
    skill_terms.append(normalize_text(skill_name))
    skill_terms = list(dict.fromkeys([term for term in skill_terms if term]))

    for fragment in split_text(cv_text):
        normalized_fragment = normalize_text(fragment)

        if (
            is_negative_evidence(fragment)
            and any(term in normalized_fragment for term in skill_terms)
        ):
            return True

    return False


def semantic_similarity(text1, text2):
    if not text1 or not text2:
        return 0

    embeddings = model.encode([text1, text2])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    raw_similarity = float(similarity)

    if raw_similarity < 0.25:
        return 0

    if raw_similarity >= 0.50:
        return 100

    return normalize_score(((raw_similarity - 0.25) / 0.25) * 100)


def calibrated_semantic_score(raw_similarity):
    if raw_similarity < 0.25:
        return 0

    if raw_similarity >= 0.50:
        return 100

    return normalize_score(((raw_similarity - 0.25) / 0.25) * 100)


def semantic_scores_against_reference(texts, reference_text):
    if not reference_text:
        return [0 for _ in texts]

    normalized_texts = [text or "" for text in texts]
    embeddings = model.encode([reference_text, *normalized_texts])
    reference_embedding = embeddings[0]
    text_embeddings = embeddings[1:]
    similarities = cosine_similarity([reference_embedding], text_embeddings)[0]

    return [
        calibrated_semantic_score(float(similarity)) if normalized_texts[index] else 0
        for index, similarity in enumerate(similarities)
    ]


def normalize_score(value):
    if value is None:
        return 0

    value = float(value)

    if value < 0:
        return 0

    if value > 100:
        return 100

    return round(value, 2)


def get_skill_name(skill):
    return str(skill.get("name") or skill.get("nume_competenta") or "").strip()


def get_skill_id(skill):
    return skill.get("id") or skill.get("id_competenta")


def get_skill_terms(skill_name):
    terms = []

    replacements = [
        ("/", ","),
        ("&", ","),
        ("(", ","),
        (")", ","),
    ]

    split_source = skill_name or ""

    for old_value, new_value in replacements:
        split_source = split_source.replace(old_value, new_value)

    for part in split_source.split(","):
        normalized_part = normalize_text(part)

        if normalized_part:
            terms.append(normalized_part)

    return list(dict.fromkeys([term for term in terms if len(term) >= 2]))


def count_matching_terms(terms, text):
    normalized_text = normalize_text(text)
    matched_terms = [
        term
        for term in terms
        if term and term in normalized_text
    ]

    return len(matched_terms)


def build_cv_evidence_text(cv_text, cv_skills):
    skill_names = [
        get_skill_name(skill)
        for skill in cv_skills
        if get_skill_name(skill)
    ]

    return " ".join([cv_text or "", *skill_names])


def build_cv_evidence_fragments(cv_text, cv_skills):
    skill_fragments = []

    for skill in cv_skills:
        skill_name = get_skill_name(skill)

        if skill_name:
            skill_fragments.append(f"Competenta detectata in CV: {skill_name}")

    text_fragments = []

    for line in (cv_text or "").splitlines():
        cleaned_line = clean_text(line)

        if 10 <= len(cleaned_line) <= 500:
            text_fragments.append(cleaned_line)

    for fragment in split_text(cv_text):
        cleaned_fragment = clean_text(fragment)

        if 20 <= len(cleaned_fragment) <= 500:
            text_fragments.append(cleaned_fragment)

    negative_fragments = [
        fragment
        for fragment in text_fragments
        if is_negative_evidence(fragment)
    ]
    positive_fragments = [
        fragment
        for fragment in text_fragments
        if not is_negative_evidence(fragment)
    ]
    unique_fragments = list(
        dict.fromkeys([
            *skill_fragments[:25],
            *negative_fragments,
            *positive_fragments,
        ])
    )

    return unique_fragments[:50]


def calculate_cv_skill_strength(cv_skill):
    years = float(cv_skill.get("years_experience") or cv_skill.get("ani_experienta") or 0)
    level = float(cv_skill.get("level") or cv_skill.get("nivel_competenta") or 3)
    confidence = float(cv_skill.get("confidence") or cv_skill.get("confidence_score") or 0.7)
    skill_name = get_skill_name(cv_skill)

    level_factor = level / 5
    years_factor = min(years / 3, 1)
    confidence_factor = min(confidence, 1)

    strength = (
        level_factor * 0.45
        + years_factor * 0.35
        + confidence_factor * 0.20
    )

    if years < 1:
        strength = min(strength, 0.38)
    elif years < 2:
        strength = min(strength, 0.58)
    elif years < 3:
        strength = min(strength, 0.72)

    if skill_name and skill_name == skill_name.lower() and len(skill_name.split()) == 1:
        strength *= 0.85

    return max(0, min(1, strength))


def semantic_similarity_ratio(text1, text2):
    if not text1 or not text2:
        return 0

    embeddings = model.encode([text1, text2])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

    return float(similarity)


def calibrated_embedding_score(similarity):
    if similarity < 0.30:
        return 0

    if similarity >= 0.65:
        return 1

    return ((similarity - 0.30) / 0.35)


def semantic_text_skill_score(job_skill_name, evidence_fragments):
    if not job_skill_name or not evidence_fragments:
        return 0

    query = f"Competenta ceruta pentru job: {job_skill_name}"
    embeddings = model.encode([query, *evidence_fragments])
    similarities = cosine_similarity([embeddings[0]], embeddings[1:])[0]
    best_similarity = max(float(similarity) for similarity in similarities)

    return min(calibrated_embedding_score(best_similarity), 0.65)


def semantic_cv_skill_score(job_skill_name, cv_skills):
    if not job_skill_name or not cv_skills:
        return 0

    query = f"Competenta ceruta pentru job: {job_skill_name}"
    candidates = [
        f"Competenta din CV: {get_skill_name(skill)}"
        for skill in cv_skills
        if get_skill_name(skill)
    ]

    if not candidates:
        return 0

    embeddings = model.encode([query, *candidates])
    similarities = cosine_similarity([embeddings[0]], embeddings[1:])[0]
    best_score = 0

    for index, similarity in enumerate(similarities):
        semantic_score = calibrated_embedding_score(float(similarity))
        skill_strength = calculate_cv_skill_strength(cv_skills[index])
        best_score = max(best_score, semantic_score * skill_strength)

    return best_score


def build_skill_embedding_context(job_skills, cv_skills, evidence_fragments):
    job_skill_names = [get_skill_name(skill) for skill in job_skills]
    skill_queries = [
        f"Competenta ceruta pentru job: {name}"
        for name in job_skill_names
    ]
    cv_skill_candidates = [
        f"Competenta din CV: {get_skill_name(skill)}"
        for skill in cv_skills
        if get_skill_name(skill)
    ]
    negative_fragments = [
        fragment
        for fragment in evidence_fragments
        if is_negative_evidence(fragment)
    ]

    if not skill_queries:
        return {
            "text_scores": [],
            "cv_skill_scores": [],
            "negative_scores": [],
        }

    all_texts = [
        *skill_queries,
        *evidence_fragments,
        *cv_skill_candidates,
        *negative_fragments,
    ]
    embeddings = model.encode(all_texts)

    query_count = len(skill_queries)
    evidence_count = len(evidence_fragments)
    cv_skill_count = len(cv_skill_candidates)

    query_embeddings = embeddings[:query_count]
    evidence_embeddings = embeddings[
        query_count:query_count + evidence_count
    ]
    cv_skill_embeddings = embeddings[
        query_count + evidence_count:
        query_count + evidence_count + cv_skill_count
    ]
    negative_embeddings = embeddings[
        query_count + evidence_count + cv_skill_count:
    ]

    text_scores = []

    if evidence_count:
        text_similarities = cosine_similarity(
            query_embeddings,
            evidence_embeddings,
        )

        for similarities in text_similarities:
            best_similarity = max(float(similarity) for similarity in similarities)
            text_scores.append(
                min(calibrated_embedding_score(best_similarity), 0.65)
            )
    else:
        text_scores = [0 for _ in skill_queries]

    cv_skill_scores = []

    if len(cv_skill_candidates):
        cv_skill_similarities = cosine_similarity(
            query_embeddings,
            cv_skill_embeddings,
        )

        for similarities in cv_skill_similarities:
            best_score = 0

            for index, similarity in enumerate(similarities):
                semantic_score = calibrated_embedding_score(float(similarity))
                skill_strength = calculate_cv_skill_strength(cv_skills[index])
                best_score = max(best_score, semantic_score * skill_strength)

            cv_skill_scores.append(best_score)
    else:
        cv_skill_scores = [0 for _ in skill_queries]

    negative_scores = []

    if len(negative_fragments):
        negative_similarities = cosine_similarity(
            query_embeddings,
            negative_embeddings,
        )

        for similarities in negative_similarities:
            negative_scores.append(max(float(similarity) for similarity in similarities))
    else:
        negative_scores = [0 for _ in skill_queries]

    return {
        "text_scores": text_scores,
        "cv_skill_scores": cv_skill_scores,
        "negative_scores": negative_scores,
    }


def calculate_technical_skills_score(job_skills, cv_skills, cv_text):
    if not job_skills:
        return 0, {"required": [], "optional": []}

    missing_required = []
    missing_optional = []
    cv_evidence_fragments = build_cv_evidence_fragments(cv_text, cv_skills)
    embedding_context = build_skill_embedding_context(
        job_skills,
        cv_skills,
        cv_evidence_fragments,
    )
    skill_results = []

    for skill_index, job_skill in enumerate(job_skills):
        job_skill_name = get_skill_name(job_skill)
        job_skill_id = get_skill_id(job_skill)
        job_skill_terms = get_skill_terms(job_skill_name)
        required = bool(job_skill.get("required"))
        priority = float(job_skill.get("priority") or 3)
        weight = priority * (2 if required else 1)
        has_negative_evidence = has_negative_evidence_for_skill(
            job_skill_name,
            cv_text,
        ) or embedding_context["negative_scores"][skill_index] >= 0.66

        saved_skill_score = 0

        if not has_negative_evidence:
            for cv_skill in cv_skills:
                cv_skill_name = get_skill_name(cv_skill)
                cv_skill_id = get_skill_id(cv_skill)

                if job_skill_id and cv_skill_id and str(job_skill_id) == str(cv_skill_id):
                    saved_skill_score = max(saved_skill_score, calculate_cv_skill_strength(cv_skill))
                    break

                if normalize_text(job_skill_name) == normalize_text(cv_skill_name):
                    saved_skill_score = max(saved_skill_score, calculate_cv_skill_strength(cv_skill))
                    break

                if (
                    job_skill_terms
                    and count_matching_terms(job_skill_terms, cv_skill_name)
                    >= max(1, len(job_skill_terms) // 2)
                ):
                    saved_skill_score = max(saved_skill_score, calculate_cv_skill_strength(cv_skill))
                    break

        matched_term_count = count_matching_terms(job_skill_terms, cv_text)
        text_skill_score = 0

        if not has_negative_evidence and job_skill_terms and matched_term_count > 0:
            match_ratio = matched_term_count / len(job_skill_terms)
            text_skill_score = min(0.65, 0.35 + match_ratio * 0.30)

        embedding_text_score = 0 if has_negative_evidence else embedding_context["text_scores"][skill_index]
        embedding_cv_skill_score = 0 if has_negative_evidence else embedding_context["cv_skill_scores"][skill_index]

        final_skill_score = max(
            saved_skill_score,
            text_skill_score,
            embedding_text_score,
            embedding_cv_skill_score,
        )

        skill_results.append(
            {
                "name": job_skill_name,
                "required": required,
                "weight": weight,
                "score": final_skill_score,
            }
        )

    required_scores = [
        result["score"]
        for result in skill_results
        if result["required"] and result["score"] >= 0.45
    ]
    weak_required_results = [
        result
        for result in skill_results
        if result["required"] and result["score"] < 0.45
    ]
    weak_optional_results = [
        result
        for result in skill_results
        if not result["required"] and result["score"] < 0.45
    ]

    required_context_score = (
        sum(required_scores) / len(required_scores)
        if required_scores
        else 0
    )

    for result in skill_results:
        if (
            result["required"]
            and result["score"] < 0.45
            and result["score"] >= 0.05
            and len(required_scores) >= 4
            and len(weak_required_results) == 1
            and len(weak_optional_results) == 0
            and required_context_score >= 0.57
        ):
            result["score"] = max(result["score"], min(0.55, required_context_score * 0.85))

    total_weight = sum(result["weight"] for result in skill_results)
    matched_weight = 0

    for result in skill_results:
        if result["score"] >= 0.45:
            matched_weight += result["weight"] * result["score"]
            continue

        if result["required"]:
            missing_required.append(result["name"])
        else:
            missing_optional.append(result["name"])

    if total_weight == 0:
        return 0, {"required": missing_required, "optional": missing_optional}

    return normalize_score((matched_weight / total_weight) * 100), {
        "required": missing_required,
        "optional": missing_optional,
    }


def calculate_soft_skills_score(cv_text, job_description):
    soft_skill_groups = [
        [
            "comunicare",
            "communication",
            "communicator",
            "stakeholder",
            "presentation",
        ],
        [
            "echipa",
            "team",
            "teamwork",
            "collaboration",
            "colaborare",
            "cross functional",
        ],
        [
            "leadership",
            "coordonare",
            "coordinated",
            "mentoring",
            "mentor",
            "ownership",
        ],
        [
            "organizare",
            "organized",
            "planning",
            "prioritization",
            "time management",
        ],
        [
            "adaptabilitate",
            "adaptability",
            "flexible",
            "learning",
            "continuous improvement",
        ],
        [
            "responsabilitate",
            "responsibility",
            "responsible",
            "accountability",
        ],
        [
            "problem solving",
            "debugging",
            "analytical",
            "troubleshooting",
            "problem-solving",
        ],
        [
            "motivatie",
            "motivation",
            "motivated",
            "proactive",
            "initiative",
        ],
        [
            "atentie la detalii",
            "attention to detail",
            "quality",
            "code review",
            "qa",
        ],
    ]

    cv_lower = normalize_text(cv_text)
    job_lower = normalize_text(job_description)
    relevant_keywords = [
        group
        for group in soft_skill_groups
        if any(keyword in job_lower or keyword in cv_lower for keyword in group)
    ]

    if not relevant_keywords:
        return semantic_similarity(cv_text[:1200], job_description[:1200])

    matches = [
        group
        for group in relevant_keywords
        if any(keyword in cv_lower for keyword in group)
    ]

    return normalize_score((len(matches) / len(relevant_keywords)) * 100)


def calculate_cv_completeness(cv_text):
    text = cv_text or ""
    sections = {
        "experienta": extract_section(text, ["experienta", "experience", "work"]),
        "proiecte": extract_section(text, ["proiecte", "projects", "project"]),
        "educatie": extract_section(
            text,
            ["educatie", "education", "facultate", "university"],
        ),
        "competente": extract_section(text, ["competente", "skills"]),
    }

    completed_sections = [
        section_name for section_name, value in sections.items() if len(value) >= 20
    ]
    missing_sections = [
        section_name for section_name, value in sections.items() if len(value) < 20
    ]

    length_score = min(len(clean_text(text)) / 1500, 1) * 40
    section_score = (len(completed_sections) / len(sections)) * 60

    return normalize_score(length_score + section_score), missing_sections


def calculate_weighted_ahp_score(scores, ahp_weights):
    mapped_weights = {
        "technical_skills": float(ahp_weights.get("technical_skills") or 0),
        "experience": float(ahp_weights.get("experience") or 0),
        "projects": float(ahp_weights.get("projects") or 0),
        "education": float(ahp_weights.get("education") or 0),
        "soft_skills": float(ahp_weights.get("soft_skills") or 0),
        "certifications": float(ahp_weights.get("certifications") or 0),
    }

    total_weight = sum(mapped_weights.values())

    if total_weight == 0:
        return scores.get("overall", 0)

    weighted_score = 0

    for key, weight in mapped_weights.items():
        weighted_score += scores.get(key, 0) * (weight / total_weight)

    return normalize_score(weighted_score)


def build_detected_strengths(scores, missing_skills):
    strengths = []

    if scores["technical_skills"] >= 75:
        strengths.append("Competente tehnice relevante pentru job")

    if scores["experience"] >= 70:
        strengths.append("Experienta profesionala apropiata de cerintele rolului")

    if scores["projects"] >= 70:
        strengths.append("Proiecte relevante pentru activitatea postului")

    if scores["soft_skills"] >= 70:
        strengths.append("Abilitati soft compatibile cu profilul cautat")

    if not missing_skills["required"]:
        strengths.append("Nu lipsesc competente obligatorii identificate")

    return strengths


def build_recommendation(score):
    if score >= 75:
        return "RECOMANDAT"

    if score >= 50:
        return "NEUTRU"

    return "NERECOMANDAT"


def calibrate_final_score(final_score, semantic_scores, missing_skills):
    missing_required_count = len(missing_skills.get("required", []))

    if (
        missing_required_count == 0
        and semantic_scores["overall"] >= 90
        and semantic_scores["experience"] >= 90
        and semantic_scores["technical_skills"] >= 60
        and semantic_scores["cv_completeness"] >= 75
    ):
        final_score = max(final_score, 86)

    if missing_required_count >= 2:
        final_score = min(final_score, 65)

    if missing_required_count >= 1 and semantic_scores["technical_skills"] < 55:
        final_score = min(final_score, 70)

    return normalize_score(final_score)


def build_ml_features(semantic_scores, missing_skills, ahp_explainable_score):
    return {
        "overall_score": semantic_scores["overall"],
        "technical_skills_score": semantic_scores["technical_skills"],
        "experience_score": semantic_scores["experience"],
        "projects_score": semantic_scores["projects"],
        "education_score": semantic_scores["education"],
        "soft_skills_score": semantic_scores["soft_skills"],
        "certifications_score": semantic_scores["certifications"],
        "cv_completeness_score": semantic_scores["cv_completeness"],
        "missing_required_skills_count": len(missing_skills["required"]),
        "missing_optional_skills_count": len(missing_skills["optional"]),
        "ahp_explainable_score": ahp_explainable_score,
    }


def predict_final_score(features):
    model_bundle = get_scoring_model_bundle()

    if model_bundle:
        feature_columns = model_bundle.get("features", SCORING_FEATURES)
        input_values = pd.DataFrame(
            [[features[column] for column in feature_columns]],
            columns=feature_columns,
        )
        prediction = model_bundle["model"].predict(input_values)[0]

        return normalize_score(prediction), {
            "used_ml_model": True,
            "model_name": model_bundle.get("model_name"),
            "model_version": model_bundle.get("version"),
            "metrics": model_bundle.get("metrics"),
        }

    penalty = min(features["missing_required_skills_count"] * 6, 24)
    fallback_score = normalize_score(
        features["ahp_explainable_score"] * 0.65
        + features["overall_score"] * 0.25
        + features["cv_completeness_score"] * 0.10
        - penalty
    )

    return fallback_score, {
        "used_ml_model": False,
        "model_name": "fallback_formula",
        "model_version": "ml_model_not_trained",
        "metrics": None,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-cv")
def analyze_cv(data: CvAnalysisRequest):
    cv_text = data.cvText or ""
    known_skills = data.knownSkills or []

    cv_fragments = split_text(cv_text)
    fragment_embeddings = model.encode(cv_fragments) if cv_fragments else []

    detected_skills = []
    cv_text_lower = cv_text.lower()

    for skill in known_skills:
        skill_lower = skill.lower()

        if skill_lower in cv_text_lower:
            evidence = find_evidence_for_skill(skill, cv_fragments, cv_text)

            if is_negative_evidence(evidence):
                continue

            years = estimate_years(evidence)

            detected_skills.append(
                {
                    "name": skill,
                    "level": estimate_level(0.9, years),
                    "years_experience": years,
                    "confidence": 0.9,
                    "evidence": evidence,
                }
            )

            continue

        skill_embedding = model.encode([skill])

        best_score = 0
        best_evidence = ""

        for index, fragment_embedding in enumerate(fragment_embeddings):
            score = cosine_similarity(skill_embedding, [fragment_embedding])[0][0]

            if score > best_score:
                best_score = score
                best_evidence = cv_fragments[index]

        if best_score >= 0.45:
            if is_negative_evidence(best_evidence):
                continue

            years = estimate_years(best_evidence)

            detected_skills.append(
                {
                    "name": skill,
                    "level": estimate_level(best_score, years),
                    "years_experience": years,
                    "confidence": round(float(best_score), 2),
                    "evidence": best_evidence,
                }
            )

    soft_skill_names = [
        "comunicare",
        "lucru in echipa",
        "leadership",
        "organizare",
        "adaptabilitate",
        "responsabilitate",
        "problem solving",
    ]

    detected_soft_skills = [
        skill for skill in soft_skill_names if skill in cv_text.lower()
    ]

    return {
        "technical_skills": detected_skills,
        "professional_summary": clean_text(cv_text[:700]),
        "experience_summary": extract_section(
            cv_text,
            ["experienta", "experience", "work"],
        ),
        "projects_summary": extract_section(
            cv_text,
            ["proiecte", "projects", "project"],
        ),
        "education_summary": extract_section(
            cv_text,
            ["educatie", "education", "facultate", "university"],
        ),
        "certifications_summary": extract_section(
            cv_text,
            ["certificari", "certifications", "certification"],
        ),
        "volunteering_summary": extract_section(
            cv_text,
            ["voluntariat", "volunteering", "volunteer"],
        ),
        "soft_skills": detected_soft_skills,
    }


@app.post("/score-cv-job")
def score_cv_job(data: CvJobScoreRequest):
    cv_text = data.cvText or ""
    job_description = data.jobDescription or ""

    experience_text = extract_section(
        cv_text,
        ["experienta", "experience", "work"],
    )
    projects_text = extract_section(
        cv_text,
        ["proiecte", "projects", "project"],
    )
    education_text = extract_section(
        cv_text,
        ["educatie", "education", "facultate", "university"],
    )
    certifications_text = extract_section(
        cv_text,
        ["certificari", "certifications", "certification"],
    )

    (
        overall_score,
        experience_score,
        projects_score,
        education_score,
        certifications_score,
    ) = semantic_scores_against_reference(
        [
            cv_text,
            experience_text or cv_text,
            projects_text or cv_text,
            education_text,
            certifications_text,
        ],
        job_description,
    )

    technical_score, missing_skills = calculate_technical_skills_score(
        data.jobSkills,
        data.cvSkills,
        cv_text,
    )
    soft_skills_score = calculate_soft_skills_score(cv_text, job_description)
    completeness_score, incomplete_sections = calculate_cv_completeness(cv_text)

    semantic_scores = {
        "overall": overall_score,
        "technical_skills": technical_score,
        "experience": experience_score,
        "projects": projects_score,
        "education": education_score,
        "soft_skills": soft_skills_score,
        "certifications": certifications_score,
        "cv_completeness": completeness_score,
    }

    ahp_explainable_score = calculate_weighted_ahp_score(
        semantic_scores,
        data.ahpWeights,
    )

    ml_features = build_ml_features(
        semantic_scores,
        missing_skills,
        ahp_explainable_score,
    )
    final_score, ml_info = predict_final_score(ml_features)
    final_score = calibrate_final_score(
        final_score,
        semantic_scores,
        missing_skills,
    )

    is_partial_score = completeness_score < 60
    detected_strengths = build_detected_strengths(semantic_scores, missing_skills)
    recommendation = build_recommendation(final_score)

    return {
        "semantic_score": overall_score,
        "final_score": final_score,
        "ml_features": ml_features,
        "ml_model": ml_info,
        "semantic_scores": semantic_scores,
        "ahp_explainable_score": ahp_explainable_score,
        "missing_skills": missing_skills,
        "detected_strengths": detected_strengths,
        "incomplete_sections": incomplete_sections,
        "is_partial_score": is_partial_score,
        "recommendation": recommendation,
        "summary": (
            "Scor calculat pe baza analizei semantice NLP, a competentelor "
            "detectate si a ponderilor AHP primite din backend."
        ),
    }
