import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-tagline">
            Platforma pentru recrutare inteligenta si organizata.
          </p>

          <div className="landing-actions">
            <Link className="landing-primary-action" to="/login">
              Conecteaza-te
            </Link>
            <Link className="landing-secondary-action" to="/register">
              Creeaza cont candidat
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-highlights" aria-label="Repere SmartHire">
        <article>
          <span>01</span>
          <h2>Aplicari centralizate</h2>
          <p>Candidaturile, CV-urile si statusurile raman usor de urmarit.</p>
        </article>

        <article>
          <span>02</span>
          <h2>Evaluare asistata</h2>
          <p>Scoringul si clasamentele ajuta la prioritizarea candidatilor.</p>
        </article>

        <article>
          <span>03</span>
          <h2>Colaborare interna</h2>
          <p>Interviurile, feedbackul si deciziile sunt pastrate in acelasi flux.</p>
        </article>
      </section>
    </main>
  );
}

export default LandingPage;
