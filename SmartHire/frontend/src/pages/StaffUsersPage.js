import React, { useEffect, useState } from "react";
import { getDepartments } from "../services/departmentService";
import {
  createStaffUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/userService";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
  isValidPositiveInteger,
  sanitizeDigits,
} from "../utils/validation";

const initialFormData = {
  nume: "",
  prenume: "",
  email: "",
  telefon: "",
  parola: "",
  rol: "RECRUTOR",
  id_departament: "",
};

function StaffUsersPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    rol: "",
    id_departament: "",
  });

  const loadData = async () => {
    try {
      setError("");

      const [departmentsData, usersData] = await Promise.all([
        getDepartments(),
        getUsers(),
      ]);

      setDepartments(departmentsData);
      setUsers(usersData);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-au putut incarca datele utilizatorilor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: name === "telefon" ? sanitizeDigits(value, 10) : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingUser(null);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!isValidName(formData.nume) || !isValidName(formData.prenume)) {
        setError("Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError("Emailul trebuie sa contina @ si sa se termine in .com.");
        setIsSaving(false);
        return;
      }

      if (!isValidPhone(formData.telefon)) {
        setError("Numarul de telefon trebuie sa contina exact 10 cifre.");
        setIsSaving(false);
        return;
      }

      if (!editingUser && !isValidPassword(formData.parola)) {
        setError("Parola trebuie sa aiba cel putin 4 caractere.");
        setIsSaving(false);
        return;
      }

      if (editingUser && formData.parola && !isValidPassword(formData.parola)) {
        setError("Parola trebuie sa aiba cel putin 4 caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidPositiveInteger(formData.id_departament, { required: true })) {
        setError("Selecteaza un departament valid.");
        setIsSaving(false);
        return;
      }

      const payload = {
        ...formData,
        id_departament: Number(formData.id_departament),
      };

      if (editingUser && !payload.parola) {
        delete payload.parola;
      }

      if (editingUser) {
        await updateUser(editingUser.id_utilizator, payload);
        setMessage("Contul intern a fost actualizat cu succes.");
      } else {
        await createStaffUser(payload);
        setMessage("Contul intern a fost creat cu succes.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva contul intern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nume: user.nume || "",
      prenume: user.prenume || "",
      email: user.email || "",
      telefon: user.telefon || "",
      parola: "",
      rol: user.rol || "RECRUTOR",
      id_departament: user.id_departament || "",
    });
    setError("");
    setMessage("");
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa stergi acest utilizator?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteUser(userId);
      setMessage("Utilizatorul a fost sters cu succes.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge utilizatorul.");
    }
  };

  const companyUsers = users.filter(
    (user) => user.rol === "RECRUTOR" || user.rol === "MANAGER"
  );

  const filteredCompanyUsers = companyUsers.filter((user) => {
    const userText = `${user.nume || ""} ${user.prenume || ""} ${
      user.email || ""
    }`.toLowerCase();

    const matchesSearch =
      !filters.search ||
      userText.includes(filters.search.trim().toLowerCase());

    const matchesRole = !filters.rol || user.rol === filters.rol;

    const matchesDepartment =
      !filters.id_departament ||
      Number(user.id_departament) === Number(filters.id_departament);

    return matchesSearch && matchesRole && matchesDepartment;
  });

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Conturi companie</h1>
          <p>Creeaza si gestioneaza conturile de recrutor si manager.</p>
        </div>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <h2>{editingUser ? "Editeaza cont intern" : "Creeaza cont intern"}</h2>

        <label>
          Nume
          <input
            name="nume"
            value={formData.nume}
            onChange={handleChange}
            maxLength="100"
            required
          />
        </label>

        <label>
          Prenume
          <input
            name="prenume"
            value={formData.prenume}
            onChange={handleChange}
            maxLength="100"
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.telefon}
            onChange={handleChange}
            inputMode="numeric"
            pattern="\d{10}"
            maxLength="10"
            required
          />
        </label>

        <label>
          Parola
          <input
            name="parola"
            type="password"
            value={formData.parola}
            onChange={handleChange}
            minLength={editingUser ? undefined : "4"}
            maxLength="100"
            required={!editingUser}
          />
        </label>

        <label>
          Rol
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="RECRUTOR">Recrutor</option>
            <option value="MANAGER">Manager</option>
          </select>
        </label>

        <label>
          Departament
          <select
            name="id_departament"
            value={formData.id_departament}
            onChange={handleChange}
            required
          >
            <option value="">Selecteaza departamentul</option>
            {departments.map((department) => (
              <option
                key={department.id_departament}
                value={department.id_departament}
              >
                {department.nume_departament}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSaving || departments.length === 0}>
            {isSaving
              ? "Se salveaza..."
              : editingUser
                ? "Actualizeaza contul intern"
                : "Creeaza cont intern"}
          </button>

          {editingUser && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Anuleaza
            </button>
          )}
        </div>
      </form>

      <div className="table-section">
        <h2>Conturi companie existente</h2>

        <form className="filter-panel compact-filter">
          <label>
            Cauta
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nume sau email"
            />
          </label>

          <label>
            Rol
            <select
              name="rol"
              value={filters.rol}
              onChange={handleFilterChange}
            >
              <option value="">Toate rolurile</option>
              <option value="RECRUTOR">Recrutor</option>
              <option value="MANAGER">Manager</option>
            </select>
          </label>

          <label>
            Departament
            <select
              name="id_departament"
              value={filters.id_departament}
              onChange={handleFilterChange}
            >
              <option value="">Toate departamentele</option>
              {departments.map((department) => (
                <option
                  key={department.id_departament}
                  value={department.id_departament}
                >
                  {department.nume_departament}
                </option>
              ))}
            </select>
          </label>
        </form>

        {isLoading ? (
          <p>Se incarca utilizatorii companiei...</p>
        ) : companyUsers.length === 0 ? (
          <p>Nu exista conturi de companie create inca.</p>
        ) : filteredCompanyUsers.length === 0 ? (
          <p>Nu exista conturi care respecta filtrele selectate.</p>
        ) : (
          <>
          <p className="table-count">
            {filteredCompanyUsers.length} conturi afisate din{" "}
            {companyUsers.length}
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Departament</th>
                <th>Creat</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredCompanyUsers.map((user) => (
                <tr key={user.id_utilizator}>
                  <td>
                    {user.nume} {user.prenume}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.telefon || "-"}</td>
                  <td>{user.rol}</td>
                  <td>
                    {departments.find(
                      (department) =>
                        Number(department.id_departament) ===
                        Number(user.id_departament)
                    )?.nume_departament || "-"}
                  </td>
                  <td>
                    {user.data_creare
                      ? new Date(user.data_creare).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleEdit(user)}>
                        Editeaza
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(user.id_utilizator)}
                      >
                        Sterge
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
    </section>
  );
}

export default StaffUsersPage;
