import React, { useEffect, useState } from "react";
import {
  createCompany,
  getCompany,
  updateCompany,
} from "../services/companyService";
import {
  isValidFiscalCode,
  isValidLocationName,
  isValidShortText,
} from "../utils/validation";

const emptyForm = {
  nume_companie: "",
  cod_fiscal: "",
  oras: "",
  tara: "",
};

function CompanyPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [companyExists, setCompanyExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const company = await getCompany();

        setFormData({
          nume_companie: company.nume_companie || "",
          cod_fiscal: company.cod_fiscal || "",
          oras: company.oras || "",
          tara: company.tara || "",
        });

        setCompanyExists(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setCompanyExists(false);
        } else {
          setError(
            err.response?.data?.message || "Nu s-au putut incarca datele companiei."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCompany();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!isValidShortText(formData.nume_companie, 255)) {
        setError("Numele companiei trebuie sa aiba intre 2 si 255 de caractere.");
        setIsSaving(false);
        return;
      }

      if (!isValidFiscalCode(formData.cod_fiscal)) {
        setError("Codul fiscal poate contine doar litere, cifre si cratima.");
        setIsSaving(false);
        return;
      }

      if (formData.oras && !isValidLocationName(formData.oras, 100)) {
        setError("Orasul trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      if (formData.tara && !isValidLocationName(formData.tara, 100)) {
        setError("Tara trebuie sa contina doar litere si sa aiba intre 2 si 100 de caractere.");
        setIsSaving(false);
        return;
      }

      const savedCompany = companyExists
        ? await updateCompany(formData)
        : await createCompany(formData);

      setFormData({
        nume_companie: savedCompany.nume_companie || "",
        cod_fiscal: savedCompany.cod_fiscal || "",
        oras: savedCompany.oras || "",
        tara: savedCompany.tara || "",
      });

      setCompanyExists(true);
      setMessage("Compania a fost salvata cu succes.");
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva compania.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Companie</h1>
        <p>Se incarca datele companiei...</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Companie</h1>
          <p>
            Configureaza compania care va folosi aceasta instalare SmartHire.
          </p>
        </div>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Numele companiei
          <input
            name="nume_companie"
            value={formData.nume_companie}
            onChange={handleChange}
            maxLength="255"
            required
          />
        </label>

        <label>
          Cod fiscal
          <input
            name="cod_fiscal"
            value={formData.cod_fiscal}
            onChange={handleChange}
            maxLength="30"
          />
        </label>

        <label>
          Oras
          <input
            name="oras"
            value={formData.oras}
            onChange={handleChange}
            maxLength="100"
          />
        </label>

        <label>
          Tara
          <input
            name="tara"
            value={formData.tara}
            onChange={handleChange}
            maxLength="100"
          />
        </label>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving
            ? "Se salveaza..."
            : companyExists
              ? "Actualizeaza compania"
              : "Creeaza compania"}
        </button>
      </form>
    </section>
  );
}

export default CompanyPage;
