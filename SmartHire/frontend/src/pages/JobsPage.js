import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../services/jobService";
import { getMyApplications } from "../services/applicationService";
import { useAuth } from "../context/AuthContext";

const workModeLabels = {
  REMOTE: "Remote",
  HIBRID: "Hibrid",
  FIZIC: "Prezenta fizica",
};

const jobStatusLabels = {
  DRAFT: "Draft",
  ACTIV: "Activ",
  INCHIS: "Inchis",
};

const applicationStatusLabels = {
  DEPUSA: "Ai aplicat",
  IN_ANALIZA: "In analiza",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  RETRASA: "Retrasa",
};

const getUniqueValues = (items, key) => {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
};

function JobsPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    country: "",
    city: "",
    workMode: "",
    status: "",
    applicationStatus: "",
    sort: "newest",
  });
  const [myApplications, setMyApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await getJobs();
        setJobs(jobsData);

        if (user?.rol === "CANDIDAT") {
          const applicationsData = await getMyApplications();
          setMyApplications(applicationsData);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut incarca joburile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [user?.rol]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      department: "",
      country: "",
      city: "",
      workMode: "",
      status: "",
      applicationStatus: "",
      sort: "newest",
    });
  };

  const getApplicationForJob = (jobId) => {
    return myApplications.find(
      (application) => Number(application.id_job) === Number(jobId)
    );
  };

  const filteredJobs = jobs
    .filter((job) => {
      const searchText = `${job.titlu_job || ""} ${
        job.nume_departament || ""
      } ${job.oras || ""} ${job.tara || ""}`.toLowerCase();

      const matchesSearch =
        !filters.search ||
        searchText.includes(filters.search.trim().toLowerCase());

      const matchesDepartment =
        !filters.department ||
        job.nume_departament === filters.department;

      const matchesCountry =
        !filters.country ||
        job.tara === filters.country;

      const matchesCity =
        !filters.city ||
        job.oras === filters.city;

      const matchesWorkMode =
        !filters.workMode ||
        job.mod_lucru === filters.workMode;

      const matchesStatus =
        user?.rol === "CANDIDAT" ||
        !filters.status ||
        job.status === filters.status;

      const application = getApplicationForJob(job.id_job);
      const hasApplied = Boolean(application);
      const matchesApplicationStatus =
        user?.rol !== "CANDIDAT" ||
        !filters.applicationStatus ||
        (filters.applicationStatus === "NOT_APPLIED" && !hasApplied) ||
        (filters.applicationStatus === "APPLIED" && hasApplied) ||
        application?.status === filters.applicationStatus;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesCountry &&
        matchesCity &&
        matchesWorkMode &&
        matchesStatus &&
        matchesApplicationStatus
      );
    })
    .sort((firstJob, secondJob) => {
      if (filters.sort === "salary_desc") {
        return Number(secondJob.salariu_maxim || 0) - Number(firstJob.salariu_maxim || 0);
      }

      if (filters.sort === "salary_asc") {
        return Number(firstJob.salariu_minim || 0) - Number(secondJob.salariu_minim || 0);
      }

      if (filters.sort === "title") {
        return String(firstJob.titlu_job || "").localeCompare(
          String(secondJob.titlu_job || "")
        );
      }

      return new Date(secondJob.data_publicare || 0) - new Date(firstJob.data_publicare || 0);
    });

  const showDepartmentFilter =
    user?.rol === "CANDIDAT" ||
    user?.rol === "ADMIN";

  const departments = getUniqueValues(jobs, "nume_departament");
  const countries = getUniqueValues(jobs, "tara");
  const cities = getUniqueValues(jobs, "oras");

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Joburi</h1>
          <p>
            {user?.rol === "CANDIDAT"
              ? "Vezi joburile active la care poti aplica."
              : "Vezi joburile disponibile pentru rolul tau."}
          </p>
        </div>

        {user?.rol === "RECRUTOR" && (
          <Link className="button-link" to="/jobs/new">
            Creeaza job
          </Link>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <p>Se incarca joburile...</p>
      ) : jobs.length === 0 ? (
        <p>Nu au fost gasite joburi.</p>
      ) : (
        <>
        <form className="filter-panel">
          <label>
            Cauta
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Titlu, departament, oras"
            />
          </label>

          {showDepartmentFilter && (
            <label>
              Domeniu
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <option value="">Toate</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Tara
            <select
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
            >
              <option value="">Toate</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label>
            Oras
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
            >
              <option value="">Toate</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label>
            Mod de lucru
            <select
              name="workMode"
              value={filters.workMode}
              onChange={handleFilterChange}
            >
              <option value="">Toate</option>
              <option value="REMOTE">Remote</option>
              <option value="HIBRID">Hibrid</option>
              <option value="FIZIC">Prezenta fizica</option>
            </select>
          </label>

          {user?.rol !== "CANDIDAT" && (
            <label>
              Status
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Toate</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIV">Activ</option>
                <option value="INCHIS">Inchis</option>
              </select>
            </label>
          )}

          {user?.rol === "CANDIDAT" && (
            <label>
              Aplicare
              <select
                name="applicationStatus"
                value={filters.applicationStatus}
                onChange={handleFilterChange}
              >
                <option value="">Toate</option>
                <option value="NOT_APPLIED">Neaplicate</option>
                <option value="APPLIED">Aplicate</option>
                <option value="IN_ANALIZA">In analiza</option>
                <option value="ACCEPTATA">Acceptate</option>
                <option value="RESPINSA">Respinse</option>
                <option value="RETRASA">Retrase</option>
              </select>
            </label>
          )}

          <label>
            Sortare
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="newest">Cele mai noi</option>
              <option value="salary_desc">Salariu descrescator</option>
              <option value="salary_asc">Salariu crescator</option>
              <option value="title">Titlu A-Z</option>
            </select>
          </label>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reseteaza
          </button>
        </form>

        <p className="list-count">
          {filteredJobs.length} joburi afisate din {jobs.length}
        </p>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>Nu exista joburi care respecta filtrele selectate.</p>
          </div>
        ) : (
        <div className="list-grid">
          {filteredJobs.map((job) => {
            const application = getApplicationForJob(job.id_job);

            return (
            <article className="list-card job-card" key={job.id_job}>
              <div>
                <h2>{job.titlu_job}</h2>
                <p>{job.nume_departament || "Fara departament"}</p>
              </div>

              <div className="meta-row">
                <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                  {jobStatusLabels[job.status] || job.status}
                </span>
                <span>
                  {job.oras && job.tara
                    ? `${job.oras}, ${job.tara}`
                    : "Locatia nu este specificata"}
                </span>
                <span>
                  {workModeLabels[job.mod_lucru] ||
                    "Modul de lucru nu este specificat"}
                </span>
                <span>
                  {job.salariu_minim && job.salariu_maxim
                    ? `${job.salariu_minim} - ${job.salariu_maxim}`
                    : "Salariul nu este specificat"}
                </span>
                {user?.rol === "CANDIDAT" && (
                  <span
                    className={
                      application
                        ? `status-badge status-${application.status?.toLowerCase()}`
                        : "status-badge notification-info"
                    }
                  >
                    {application
                      ? applicationStatusLabels[application.status] ||
                        application.status
                      : "Disponibil pentru aplicare"}
                  </span>
                )}
              </div>

              <Link to={`/jobs/${job.id_job}`}>
                {user?.rol === "CANDIDAT" && application
                  ? "Vezi candidatura"
                  : "Vezi detalii"}
              </Link>
            </article>
          );
          })}
        </div>
        )}
        </>
      )}
    </section>
  );
}

export default JobsPage;
