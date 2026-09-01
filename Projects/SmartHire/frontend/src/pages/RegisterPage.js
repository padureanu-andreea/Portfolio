import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
  sanitizeDigits,
} from "../utils/validation";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    telefon: "",
    parola: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: name === "telefon" ? sanitizeDigits(value, 10) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      if (!isValidName(formData.nume) || !isValidName(formData.prenume)) {
        setError("Numele si prenumele trebuie sa contina doar litere si sa aiba intre 2 si 80 de caractere.");
        setIsSubmitting(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError("Emailul trebuie sa contina @ si sa se termine in .com.");
        setIsSubmitting(false);
        return;
      }

      if (!isValidPhone(formData.telefon)) {
        setError("Numarul de telefon trebuie sa contina exact 10 cifre.");
        setIsSubmitting(false);
        return;
      }

      if (!isValidPassword(formData.parola)) {
        setError("Parola trebuie sa aiba cel putin 4 caractere.");
        setIsSubmitting(false);
        return;
      }

      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Inregistrarea a esuat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="panel">
        <h1>Inregistrare</h1>
        <p>Creeaza contul tau SmartHire.</p>

        <form className="form" onSubmit={handleSubmit}>
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
              minLength="4"
              maxLength="100"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se creeaza contul..." : "Inregistrare"}
          </button>
        </form>

        <nav className="links">
          <Link to="/login">Ai deja un cont?</Link>
        </nav>
      </section>
    </main>
  );
}

export default RegisterPage;
