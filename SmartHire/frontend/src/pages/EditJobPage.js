import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getJobById, updateJob } from "../services/jobService";
import {
  isValidLocationName,
  isValidLongText,
  isValidSalaryRange,
  isValidShortText,
  sanitizeIntegerInput,
} from "../utils/validation";

const jobStatusLabels = {
  DRAFT: "Draft",
  ACTIV: "Activ",
  INCHIS: "Inchis",
};

const initialFormData = {
  id_departament: "",
  titlu_job: "",
  descriere_job: "",
  tara: "",
  oras: "",
  mod_lucru: "",
  salariu_minim: "",
  salariu_maxim: "",
  status: "",
};

const formatSalaryForInput = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return String(Math.trunc(numericValue));
};

function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [departmentName, setDepartmentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const job = await getJobById(id);

        setFormData({
          id_departament: job.id_departament || "",
          titlu_job: job.titlu_job || "",
          descriere_job: job.descriere_job || "",
          tara: job.tara || "",
          oras: job.oras || "",
          mod_lucru: job.mod_lucru || "FIZIC",
          salariu_minim: formatSalaryForInput(job.salariu_minim),
          salariu_maxim: formatSalaryForInput(job.salariu_maxim),
          status: job.status || "",
        });

        setDepartmentName(job.nume_departament || "");
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-a putut incarca jobul.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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

      if (!isValidLongText(formData.descriere_job, 12000)) {
        setError("Descrierea jobului trebuie sa aiba cel putin 10 caractere.");
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

      await updateJob(id, {
        id_departament: Number(formData.id_departament),
        titlu_job: formData.titlu_job,
        descriere_job: formData.descriere_job,
        tara: formData.tara,
        oras: formData.oras,
        mod_lucru: formData.mod_lucru,
        salariu_minim: formData.salariu_minim
          ? Number(formData.salariu_minim)
          : null,
        salariu_maxim: formData.salariu_maxim
          ? Number(formData.salariu_maxim)
          : null,
        status: formData.status,
      });

      navigate(`/jobs/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut actualiza jobul.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Editeaza job</h1>
        <p>Se incarca jobul...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Editeaza job</h1>
          <p>Actualizeaza informatiile jobului.</p>
        </div>
      </div>

      <form className="content-form wide-form" onSubmit={handleSubmit}>
        <label>
          Departament
          <span className="readonly-field">
            {departmentName || "Departamentul tau"}
          </span>
        </label>

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
          Descriere
          <textarea
            name="descriere_job"
            value={formData.descriere_job}
            onChange={handleChange}
            maxLength="12000"
            rows="8"
            required
          />
        </label>

        <label>
          Tara
          <input
            name="tara"
            value={formData.tara}
            onChange={handleChange}
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

        <label>
          Status
          <span className={`status-badge status-${formData.status?.toLowerCase()}`}>
            {jobStatusLabels[formData.status] || formData.status || "-"}
          </span>
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Se salveaza..." : "Salveaza modificarile"}
        </button>
      </form>
    </section>
  );
}

export default EditJobPage;
