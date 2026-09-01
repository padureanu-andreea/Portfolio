import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail, isValidPassword } from "../utils/validation";

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      if (!isValidEmail(email)) {
        setError("Emailul trebuie sa contina @ si sa se termine in .com.");
        setIsSubmitting(false);
        return;
      }

      if (!isValidPassword(parola)) {
        setError("Parola trebuie sa aiba cel putin 4 caractere.");
        setIsSubmitting(false);
        return;
      }

      await login({ email, parola });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Autentificarea a esuat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="panel">
        <h1>Autentificare</h1>
        <p>Conecteaza-te la contul tau SmartHire.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              pattern="[^@\s]+@[^@\s]+\.com"
              maxLength="255"
              required
            />
          </label>

          <label>
            Parola
            <input
              type="password"
              value={parola}
              onChange={(event) => setParola(event.target.value)}
              minLength="4"
              maxLength="100"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se autentifica..." : "Autentificare"}
          </button>
        </form>

        <nav className="links">
          <Link to="/register">Creeaza cont</Link>
        </nav>
      </section>
    </main>
  );
}

export default LoginPage;
