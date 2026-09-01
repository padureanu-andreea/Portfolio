import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../services/skillService";
import { isValidShortText } from "../utils/validation";

function SkillsPage() {
  const { user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canManageSkills = user?.rol === "ADMIN";

  const loadSkills = async () => {
    try {
      setError("");
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-au putut incarca competentele.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  if (!canManageSkills) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetForm = () => {
    setSkillName("");
    setEditingSkill(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!isValidShortText(skillName, 100)) {
        setError("Numele competentei trebuie sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      const payload = {
        nume_competenta: skillName,
      };

      if (editingSkill) {
        await updateSkill(editingSkill.id_competenta, payload);
        setMessage("Competenta a fost actualizata cu succes.");
      } else {
        await createSkill(payload);
        setMessage("Competenta a fost creata cu succes.");
      }

      resetForm();
      await loadSkills();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva competenta.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setSkillName(skill.nume_competenta || "");
    setError("");
    setMessage("");
  };

  const handleDelete = async (skillId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa stergi aceasta competenta?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteSkill(skillId);
      setMessage("Competenta a fost stearsa cu succes.");
      await loadSkills();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge competenta.");
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Competente</h1>
          <p>Administreaza competentele folosite pentru joburi si potrivirea CV-urilor.</p>
        </div>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Nume competenta
          <input
            value={skillName}
            onChange={(event) => setSkillName(event.target.value)}
            maxLength="100"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving
              ? "Se salveaza..."
              : editingSkill
                ? "Actualizeaza competenta"
                : "Creeaza competenta"}
          </button>

          {editingSkill && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Anuleaza
            </button>
          )}
        </div>
      </form>

      <div className="table-section">
        <h2>Competente existente</h2>

        {isLoading ? (
          <p>Se incarca competentele...</p>
        ) : skills.length === 0 ? (
          <p>Nu exista competente create inca.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume competenta</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id_competenta}>
                  <td>{skill.id_competenta}</td>
                  <td>{skill.nume_competenta}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(skill)}>
                        Editeaza
                      </button>

                      {user?.rol === "ADMIN" && (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(skill.id_competenta)}
                        >
                          Sterge
                        </button>
                      )}
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

export default SkillsPage;
