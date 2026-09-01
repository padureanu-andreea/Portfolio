import React, { useEffect, useState } from "react";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "../services/userService";
import { useAuth } from "../context/AuthContext";
import {
  isValidName,
  isValidPassword,
  isValidPhone,
  sanitizeDigits,
} from "../utils/validation";

const roleLabels = {
  ADMIN: "Administrator",
  CANDIDAT: "Candidat",
  RECRUTOR: "Recrutor",
  MANAGER: "Manager",
};

function ProfilePage() {
  const { updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    telefon: "",
  });
  const [passwordData, setPasswordData] = useState({
    parola_curenta: "",
    parola_noua: "",
    confirma_parola: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const loadProfile = async () => {
    try {
      setError("");
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        nume: data.nume || "",
        prenume: data.prenume || "",
        telefon: data.telefon || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut incarca profilul.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: name === "telefon" ? sanitizeDigits(value, 10) : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      nume: profile.nume || "",
      prenume: profile.prenume || "",
      telefon: profile.telefon || "",
    });
    setIsEditing(false);
    setError("");
    setMessage("");
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      parola_curenta: "",
      parola_noua: "",
      confirma_parola: "",
    });
    setIsChangingPassword(false);
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!isValidName(formData.nume) || !isValidName(formData.prenume)) {
        setError(
          "Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere."
        );
        setIsSaving(false);
        return;
      }

      if (!isValidPhone(formData.telefon)) {
        setError("Numarul de telefon trebuie sa contina exact 10 cifre.");
        setIsSaving(false);
        return;
      }

      const result = await updateMyProfile(formData);
      setProfile(result.user);
      updateCurrentUser(result.user, result.token);
      setIsEditing(false);
      setMessage("Profilul a fost actualizat cu succes.");
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut actualiza profilul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");
    setIsPasswordSaving(true);

    try {
      if (!isValidPassword(passwordData.parola_curenta)) {
        setPasswordError("Introdu parola curenta.");
        setIsPasswordSaving(false);
        return;
      }

      if (!isValidPassword(passwordData.parola_noua)) {
        setPasswordError("Parola noua trebuie sa aiba cel putin 4 caractere.");
        setIsPasswordSaving(false);
        return;
      }

      if (passwordData.parola_noua !== passwordData.confirma_parola) {
        setPasswordError("Parola noua si confirmarea nu coincid.");
        setIsPasswordSaving(false);
        return;
      }

      await changeMyPassword({
        parola_curenta: passwordData.parola_curenta,
        parola_noua: passwordData.parola_noua,
      });

      setPasswordData({
        parola_curenta: "",
        parola_noua: "",
        confirma_parola: "",
      });
      setIsChangingPassword(false);
      setPasswordMessage("Parola a fost actualizata cu succes.");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Nu s-a putut actualiza parola."
      );
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Profil</h1>
        <p>Se incarca profilul...</p>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="page-section">
        <h1>Profil</h1>
        <p className="error">{error}</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Profil</h1>
          <p>Vezi datele contului tau si actualizeaza informatiile de baza.</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-summary-card">
          <div className="profile-avatar">
            {(profile.prenume?.[0] || "") + (profile.nume?.[0] || "")}
          </div>

          <div>
            <h2>
              {profile.prenume} {profile.nume}
            </h2>
            <p>{roleLabels[profile.rol] || profile.rol}</p>
          </div>

          <div className="profile-summary-details">
            <span>{profile.email}</span>
            <span>{profile.telefon || "Telefon necompletat"}</span>
            <span>
              Cont creat la{" "}
              {profile.data_creare
                ? new Date(profile.data_creare).toLocaleDateString("ro-RO")
                : "-"}
            </span>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Date personale</h2>
              <p>Actualizeaza numele, prenumele si numarul de telefon.</p>
            </div>

            {!isEditing && (
              <button type="button" onClick={() => setIsEditing(true)}>
                Editeaza profil
              </button>
            )}
          </div>

          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}

          {!isEditing ? (
            <div className="detail-grid compact-detail-grid">
              <div>
                <span>Nume</span>
                <strong>{profile.nume}</strong>
              </div>

              <div>
                <span>Prenume</span>
                <strong>{profile.prenume}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{profile.email}</strong>
              </div>

              <div>
                <span>Telefon</span>
                <strong>{profile.telefon || "-"}</strong>
              </div>
            </div>
          ) : (
            <form className="settings-form" onSubmit={handleSubmit}>
              <label>
                Nume
                <input
                  name="nume"
                  value={formData.nume}
                  onChange={handleChange}
                  maxLength="80"
                  required
                />
              </label>

              <label>
                Prenume
                <input
                  name="prenume"
                  value={formData.prenume}
                  onChange={handleChange}
                  maxLength="80"
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

              <div className="form-actions">
                <button type="submit" disabled={isSaving}>
                  {isSaving ? "Se salveaza..." : "Salveaza profil"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Anuleaza
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Securitate</h2>
              <p>Schimba parola contului folosind parola curenta.</p>
            </div>

            {!isChangingPassword && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsChangingPassword(true)}
              >
                Schimba parola
              </button>
            )}
          </div>

          {passwordError && <p className="error">{passwordError}</p>}
          {passwordMessage && <p className="success">{passwordMessage}</p>}

          {!isChangingPassword ? (
            <div className="security-info">
              <strong>Parola este protejata</strong>
              <p>
                Pentru siguranta contului, parola curenta este necesara la orice
                modificare.
              </p>
            </div>
          ) : (
            <form className="settings-form" onSubmit={handlePasswordSubmit}>
              <label>
                Parola curenta
                <input
                  name="parola_curenta"
                  type="password"
                  value={passwordData.parola_curenta}
                  onChange={handlePasswordChange}
                  minLength="4"
                  required
                />
              </label>

              <label>
                Parola noua
                <input
                  name="parola_noua"
                  type="password"
                  value={passwordData.parola_noua}
                  onChange={handlePasswordChange}
                  minLength="4"
                  required
                />
              </label>

              <label>
                Confirma parola noua
                <input
                  name="confirma_parola"
                  type="password"
                  value={passwordData.confirma_parola}
                  onChange={handlePasswordChange}
                  minLength="4"
                  required
                />
              </label>

              <div className="form-actions">
                <button type="submit" disabled={isPasswordSaving}>
                  {isPasswordSaving ? "Se salveaza..." : "Salveaza parola"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handlePasswordCancel}
                  disabled={isPasswordSaving}
                >
                  Anuleaza
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
