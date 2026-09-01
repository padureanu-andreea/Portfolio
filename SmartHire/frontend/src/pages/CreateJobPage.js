import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createJob } from "../services/jobService";
import {
  isValidLocationName,
  isValidLongText,
  isValidSalaryRange,
  isValidShortText,
  sanitizeIntegerInput,
} from "../utils/validation";

const initialFormData = {
  titlu_job: "",
  descriere_companie: "",
  descriere_rol: "",
  responsabilitati: "",
  cerinte: "",
  beneficii: "",
  tara: "",
  oras: "",
  mod_lucru: "FIZIC",
  salariu_minim: "",
  salariu_maxim: "",
};

const buildJobDescription = (data) => {
  const sections = [
    {
      title: "Despre companie",
      content: data.descriere_companie,
    },
    {
      title: "Descrierea rolului",
      content: data.descriere_rol,
    },
    {
      title: "Responsabilitati",
      content: data.responsabilitati,
    },
    {
      title: "Cerinte si experienta",
      content: data.cerinte,
    },
    {
      title: "Ce oferim",
      content: data.beneficii,
    },
  ];

  return sections
    .filter((section) => section.content.trim())
    .map((section) => `${section.title}\n${section.content.trim()}`)
    .join("\n\n");
};

function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (user?.rol !== "RECRUTOR") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    const salaryFields = ["salariu_minim", "salariu_maxim"];

    setFormData((currentData) => ({
      ...currentData,
      [name]: salaryFields.includes(name) ? sanitizeIntegerInput(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      if (!isValidShortText(formData.titlu_job, 255)) {
        setError("Titlul jobului trebuie sa aiba intre 2 si 255 de caractere.");
        setIsSaving(false);
        return;
      }

      if (
        !isValidLongText(formData.descriere_companie, 2500) ||
        !isValidLongText(formData.descriere_rol, 2500) ||
        !isValidLongText(formData.responsabilitati, 4000) ||
        !isValidLongText(formData.cerinte, 4000) ||
        (formData.beneficii.trim() &&
          !isValidLongText(formData.beneficii, 2500))
      ) {
        setError("Campurile descriptive completate trebuie sa aiba cel putin 10 caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidLocationName(formData.tara, 100)) {
        setError("Tara trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidLocationName(formData.oras, 100)) {
        setError("Orasul trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidSalaryRange(formData.salariu_minim, formData.salariu_maxim)) {
        setError("Salariile trebuie sa fie pozitive, iar salariul maxim nu poate fi mai mic decat salariul minim.");
        setIsSaving(false);
        return;
      }

      const descriere_job = buildJobDescription(formData);

      const job = await createJob({
        titlu_job: formData.titlu_job,
        descriere_job,
        tara: formData.tara,
        oras: formData.oras,
        mod_lucru: formData.mod_lucru,
        salariu_minim: formData.salariu_minim
          ? Number(formData.salariu_minim)
          : null,
        salariu_maxim: formData.salariu_maxim
          ? Number(formData.salariu_maxim)
          : null,
      });

      navigate(`/jobs/${job.id_job}/skills`);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut crea jobul.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Creeaza job</h1>
          <p>Creeaza un job draft pentru departamentul tau.</p>
        </div>
      </div>

      <form className="content-form wide-form" onSubmit={handleSubmit}>
        <label>
          Titlu job
          <input
            name="titlu_job"
            value={formData.titlu_job}
            onChange={handleChange}
            maxLength="255"
            required
          />
        </label>

        <label>
          Despre companie
          <textarea
            name="descriere_companie"
            value={formData.descriere_companie}
            onChange={handleChange}
            maxLength="2500"
            rows="4"
            required
          />
        </label>

        <label>
          Descrierea rolului
          <textarea
            name="descriere_rol"
            value={formData.descriere_rol}
            onChange={handleChange}
            maxLength="2500"
            rows="4"
            required
          />
        </label>

        <label>
          Responsabilitati
          <textarea
            name="responsabilitati"
            value={formData.responsabilitati}
            onChange={handleChange}
            maxLength="4000"
            rows="5"
            required
          />
        </label>

        <label>
          Cerinte si experienta
          <textarea
            name="cerinte"
            value={formData.cerinte}
            onChange={handleChange}
            maxLength="4000"
            rows="5"
            required
          />
        </label>

        <label>
          Ce oferim
          <textarea
            name="beneficii"
            value={formData.beneficii}
            onChange={handleChange}
            maxLength="2500"
            rows="4"
          />
        </label>

        <label>
          Tara
          <input
            name="tara"
            value={formData.tara}
            onChange={handleChange}
            placeholder="Ex: Romania"
            maxLength="100"
            required
          />
        </label>

        <label>
          Oras
          <input
            name="oras"
            value={formData.oras}
            onChange={handleChange}
            placeholder="Ex: Bucuresti"
            maxLength="100"
            required
          />
        </label>

        <label>
          Mod de lucru
          <select
            name="mod_lucru"
            value={formData.mod_lucru}
            onChange={handleChange}
            required
          >
            <option value="FIZIC">Prezenta fizica</option>
            <option value="HIBRID">Hibrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        </label>

        <label>
          Salariu minim
          <input
            name="salariu_minim"
            type="text"
            value={formData.salariu_minim}
            onChange={handleChange}
            inputMode="numeric"
            pattern="\d*"
            min="0"
            step="100"
          />
        </label>

        <label>
          Salariu maxim
          <input
            name="salariu_maxim"
            type="text"
            value={formData.salariu_maxim}
            onChange={handleChange}
            inputMode="numeric"
            pattern="\d*"
            min="0"
            step="100"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Se creeaza..." : "Creeaza job"}
          </button>

          <Link className="button-link secondary-link" to="/jobs">
            Anuleaza
          </Link>
        </div>
      </form>
    </section>
  );
}

export default CreateJobPage;
