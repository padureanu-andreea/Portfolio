import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deleteCv,
  downloadCv,
  getMyCvs,
  uploadCv,
} from "../services/cvService";

function MyCvsPage() {
  const { user } = useAuth();

  const [cvs, setCvs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCvs = async () => {
    try {
      setError("");
      const data = await getMyCvs();
      setCvs(data);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-au putut incarca CV-urile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCvs();
  }, []);

  if (user?.rol !== "CANDIDAT") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0] || null;

    setError("");

    if (file && file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Fisierul trebuie sa fie PDF.");
      event.target.value = "";
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("Fisierul PDF nu poate depasi 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Selecteaza un fisier PDF.");
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await uploadCv(selectedFile);
      setSelectedFile(null);
      event.target.reset();
      setMessage("CV-ul a fost incarcat cu succes.");
      await loadCvs();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut incarca CV-ul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (cv) => {
    setError("");
    setMessage("");

    try {
      const fileBlob = await downloadCv(cv.id_cv);
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = cv.nume_fisier || "cv.pdf";
      link.click();

      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut descarca CV-ul.");
    }
  };

  const handleDelete = async (cvId) => {
    const confirmed = window.confirm("Sigur vrei sa stergi acest CV?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteCv(cvId);
      setMessage("CV-ul a fost sters cu succes.");
      await loadCvs();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge CV-ul.");
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>CV-urile mele</h1>
          <p>Incarca si administreaza CV-urile folosite pentru aplicari.</p>
        </div>
      </div>

      <form className="content-form" onSubmit={handleSubmit}>
        <label>
          Fisier CV
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        <p className="info-message">
          CV-ul trebuie incarcat in format PDF si nu poate depasi 10 MB.
        </p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={isSaving || !selectedFile}>
          {isSaving ? "Se incarca..." : "Incarca CV"}
        </button>
      </form>

      <div className="table-section">
        <h2>CV-uri incarcate</h2>

        {isLoading ? (
          <p>Se incarca CV-urile...</p>
        ) : cvs.length === 0 ? (
          <p>Nu ai incarcat niciun CV inca.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fisier</th>
                <th>Data incarcare</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id_cv}>
                  <td>{cv.nume_fisier}</td>
                  <td>
                    {cv.data_incarcare
                      ? new Date(cv.data_incarcare).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" onClick={() => handleDownload(cv)}>
                        Descarca
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(cv.id_cv)}
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

export default MyCvsPage;
