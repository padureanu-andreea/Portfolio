import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsers, updateUser } from "../services/userService";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeDigits,
} from "../utils/validation";

const initialEditForm = {
  nume: "",
  prenume: "",
  email: "",
  telefon: "",
};

function CandidateUsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    phone: "",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      setError("");
      const data = await getUsers();
      setUsers(data.filter((item) => item.rol === "CANDIDAT"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-au putut incarca conturile candidatilor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === "ADMIN") {
      loadUsers();
    }
  }, [user?.rol]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const openDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setEditingCandidate(null);
    setError("");
    setMessage("");
  };

  const openEdit = (candidate) => {
    setEditingCandidate(candidate);
    setSelectedCandidate(null);
    setEditForm({
      nume: candidate.nume || "",
      prenume: candidate.prenume || "",
      email: candidate.email || "",
      telefon: candidate.telefon || "",
    });
    setError("");
    setMessage("");
  };

  const closeModal = () => {
    setSelectedCandidate(null);
    setEditingCandidate(null);
    setEditForm(initialEditForm);
    setIsSaving(false);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: name === "telefon" ? sanitizeDigits(value, 10) : value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingCandidate) {
      return;
    }

    setError("");
    setMessage("");

    if (!isValidName(editForm.nume) || !isValidName(editForm.prenume)) {
      setError(
        "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere."
      );
      return;
    }

    if (!isValidEmail(editForm.email)) {
      setError("Emailul trebuie sa contina @ si sa se termine in .com.");
      return;
    }

    if (!isValidPhone(editForm.telefon)) {
      setError("Numarul de telefon trebuie sa contina exact 10 cifre.");
      return;
    }

    try {
      setIsSaving(true);

      await updateUser(editingCandidate.id_utilizator, {
        ...editForm,
        rol: "CANDIDAT",
      });

      setMessage("Contul candidatului a fost actualizat cu succes.");
      closeModal();
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut actualiza contul candidatului."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter((candidate) => {
    const searchText = `${candidate.nume || ""} ${
      candidate.prenume || ""
    } ${candidate.email || ""} ${candidate.telefon || ""}`.toLowerCase();

    const matchesSearch =
      !filters.search ||
      searchText.includes(filters.search.trim().toLowerCase());

    const hasPhone = Boolean(candidate.telefon);
    const matchesPhone =
      !filters.phone ||
      (filters.phone === "with-phone" && hasPhone) ||
      (filters.phone === "without-phone" && !hasPhone);

    return matchesSearch && matchesPhone;
  });

  if (user?.rol !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Conturi candidati</h1>
          <p>Administreaza datele de baza ale conturilor de candidat.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="table-section">
        <form className="filter-panel compact-filter">
          <label>
            Cauta
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nume, email sau telefon"
            />
          </label>

          <label>
            Telefon
            <select
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
            >
              <option value="">Toate conturile</option>
              <option value="with-phone">Cu telefon completat</option>
              <option value="without-phone">Fara telefon completat</option>
            </select>
          </label>
        </form>

        {isLoading ? (
          <p>Se incarca utilizatorii candidati...</p>
        ) : users.length === 0 ? (
          <p>Nu exista conturi de candidati create inca.</p>
        ) : filteredUsers.length === 0 ? (
          <p>Nu exista conturi care respecta filtrele selectate.</p>
        ) : (
          <>
          <p className="table-count">
            {filteredUsers.length} conturi afisate din {users.length}
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Data creare</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((candidate) => (
                <tr key={candidate.id_utilizator}>
                  <td>
                    {candidate.nume} {candidate.prenume}
                  </td>
                  <td>{candidate.email}</td>
                  <td>{candidate.telefon || "-"}</td>
                  <td>{candidate.rol}</td>
                  <td>
                    {candidate.data_creare
                      ? new Date(candidate.data_creare).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="details-action-button"
                        onClick={() => openDetails(candidate)}
                      >
                        Detalii
                      </button>

                      <button
                        type="button"
                        className="edit-action-button"
                        onClick={() => openEdit(candidate)}
                      >
                        Editeaza
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>

      {selectedCandidate && (
        <div className="modal-overlay" role="presentation">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2>Detalii cont candidat</h2>
                <p>
                  {selectedCandidate.prenume} {selectedCandidate.nume}
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeModal}
                aria-label="Inchide"
              >
                x
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <span>Nume</span>
                <strong>{selectedCandidate.nume}</strong>
              </div>
              <div>
                <span>Prenume</span>
                <strong>{selectedCandidate.prenume}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedCandidate.email}</strong>
              </div>
              <div>
                <span>Telefon</span>
                <strong>{selectedCandidate.telefon || "-"}</strong>
              </div>
              <div>
                <span>Rol</span>
                <strong>{selectedCandidate.rol}</strong>
              </div>
              <div>
                <span>Data creare</span>
                <strong>
                  {selectedCandidate.data_creare
                    ? new Date(selectedCandidate.data_creare).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => openEdit(selectedCandidate)}>
                Editeaza contul
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
              >
                Inchide
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCandidate && (
        <div className="modal-overlay" role="presentation">
          <form className="modal-panel" onSubmit={handleEditSubmit}>
            <div className="modal-header">
              <div>
                <h2>Editeaza cont candidat</h2>
                <p>Actualizeaza doar datele administrative ale contului.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeModal}
                aria-label="Inchide"
              >
                x
              </button>
            </div>

            <label>
              Nume
              <input
                name="nume"
                value={editForm.nume}
                onChange={handleEditChange}
                maxLength="80"
                required
              />
            </label>

            <label>
              Prenume
              <input
                name="prenume"
                value={editForm.prenume}
                onChange={handleEditChange}
                maxLength="80"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                pattern="[^@\s]+@[^@\s]+\.com"
                maxLength="255"
                required
              />
            </label>

            <label>
              Telefon
              <input
                name="telefon"
                type="tel"
                value={editForm.telefon}
                onChange={handleEditChange}
                inputMode="numeric"
                pattern="\d{10}"
                maxLength="10"
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Se salveaza..." : "Salveaza modificarile"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
              >
                Anuleaza
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default CandidateUsersPage;
