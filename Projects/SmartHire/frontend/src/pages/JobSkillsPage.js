import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addSkillToJob,
  getJobById,
  getJobSkills,
  removeSkillFromJob,
  updateSkillForJob,
} from "../services/jobService";

const initialFormData = {
  nume_competenta: "",
  este_obligatoriu: false,
};

function JobSkillsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [jobSkills, setJobSkills] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingSkillId, setUpdatingSkillId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
  try {
    setError("");

    const [jobData, jobSkillsData] = await Promise.all([
      getJobById(id),
      getJobSkills(id),
    ]);

    setJob(jobData);
    setJobSkills(jobSkillsData);
  } catch (err) {
    setError(err.response?.data?.message || "Nu s-au putut incarca competentele jobului.");
  } finally {
    setIsLoading(false);
  }
}, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);


  if (user?.rol !== "RECRUTOR") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const skillName = formData.nume_competenta.trim();

      if (!skillName) {
        setError("Completeaza numele competentei.");
        setIsSaving(false);
        return;
      }

      if (skillName.length < 2 || skillName.length > 100) {
        setError("Numele competentei trebuie sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      await addSkillToJob(id, {
        nume_competenta: skillName,
        este_obligatoriu: formData.este_obligatoriu,
      });

      setFormData(initialFormData);
      setMessage("Competenta a fost adaugata la job.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut adauga competenta la job.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (skillId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa elimini aceasta competenta din job?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await removeSkillFromJob(id, skillId);
      setMessage("Competenta a fost eliminata din job.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut elimina competenta.");
    }
  };

  const handleToggleRequired = async (skill) => {
    setError("");
    setMessage("");
    setUpdatingSkillId(skill.id_competenta);

    try {
      await updateSkillForJob(id, skill.id_competenta, {
        este_obligatoriu: !skill.este_obligatoriu,
      });

      setMessage("Tipul competentei a fost actualizat.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut actualiza competenta.");
    } finally {
      setUpdatingSkillId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Competente job</h1>
        <p>Se incarca competentele jobului...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Competente job</h1>
          <p>{job?.titlu_job}</p>
        </div>

        <Link className="button-link secondary-link" to={`/jobs/${id}`}>
          Inapoi la job
        </Link>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Competenta
          <input
            name="nume_competenta"
            value={formData.nume_competenta}
            onChange={handleChange}
            placeholder="Ex: JavaScript, SQL, React"
            maxLength="100"
            required
          />
        </label>

        <label className="checkbox-label">
          <input
            name="este_obligatoriu"
            type="checkbox"
            checked={formData.este_obligatoriu}
            onChange={handleChange}
          />
          Competenta obligatorie
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Se adauga..." : "Adauga competenta"}
        </button>
      </form>

      <div className="table-section">
        <h2>Competente atasate acestui job</h2>

        {jobSkills.length === 0 ? (
          <p>Nu exista competente adaugate inca.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Competenta</th>
                <th>Tip</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {jobSkills.map((skill) => (
                <tr key={skill.id_competenta}>
                  <td>{skill.nume_competenta}</td>
                  <td>{skill.este_obligatoriu ? "Obligatorie" : "Optionala"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleToggleRequired(skill)}
                        disabled={updatingSkillId === skill.id_competenta}
                      >
                        {skill.este_obligatoriu
                          ? "Fa optionala"
                          : "Fa obligatorie"}
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleRemove(skill.id_competenta)}
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default JobSkillsPage;
