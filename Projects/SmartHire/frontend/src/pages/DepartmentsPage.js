import React, { useEffect, useState } from "react";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departmentService";
import { isValidShortText } from "../utils/validation";

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDepartments = async () => {
    try {
      setError("");
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-au putut incarca departamentele.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const resetForm = () => {
    setDepartmentName("");
    setEditingDepartment(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!isValidShortText(departmentName, 100)) {
        setError("Numele departamentului trebuie sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      const payload = {
        nume_departament: departmentName,
      };

      if (editingDepartment) {
        await updateDepartment(editingDepartment.id_departament, payload);
        setMessage("Departamentul a fost actualizat cu succes.");
      } else {
        await createDepartment(payload);
        setMessage("Departamentul a fost creat cu succes.");
      }

      resetForm();
      await loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva departamentul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setDepartmentName(department.nume_departament || "");
    setMessage("");
    setError("");
  };

  const handleDelete = async (departmentId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa stergi acest departament?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteDepartment(departmentId);
      setMessage("Departamentul a fost sters cu succes.");
      await loadDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge departamentul.");
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Departamente</h1>
          <p>Administreaza departamentele folosite pentru joburi si conturi interne.</p>
        </div>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Nume departament
          <input
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
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
              : editingDepartment
                ? "Actualizeaza departamentul"
                : "Creeaza departamentul"}
          </button>

          {editingDepartment && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Anuleaza
            </button>
          )}
        </div>
      </form>

      <div className="table-section">
        <h2>Departamente existente</h2>

        {isLoading ? (
          <p>Se incarca departamentele...</p>
        ) : departments.length === 0 ? (
          <p>Nu exista departamente create inca.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume departament</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department) => (
                <tr key={department.id_departament}>
                  <td>{department.id_departament}</td>
                  <td>{department.nume_departament}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(department)}>
                        Editeaza
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(department.id_departament)}
                      >
                        Sterge
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

export default DepartmentsPage;
