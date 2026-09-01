import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getJobs } from "../services/jobService";
import {
  cancelInterview,
  getJobInterviews,
  getMyInterviews,
  requestInterviewReschedule,
  updateInterview,
} from "../services/interviewService";
import {
  createFeedback,
  deleteFeedback,
  updateFeedback,
} from "../services/feedbackService";
import FeedbackModal, {
  buildFeedbackFromInterview,
} from "../components/FeedbackModal";

const interviewStatusLabels = {
  PROGRAMAT: "Programat",
  FINALIZAT: "Finalizat",
  ANULAT: "Anulat",
  REPROGRAMARE_SOLICITATA: "Reprogramare solicitata",
  NEPREZENTAT: "Neprezentat",
};

const interviewTypeLabels = {
  HR_ONLINE: "HR online",
  HR_FIZIC: "HR fizic",
  HR_TELEFONIC: "HR telefonic",
  TEHNIC_ONLINE: "Tehnic online",
  TEHNIC_FIZIC: "Tehnic fizic",
};

const interviewFilterStatuses = [
  { value: "", label: "Toate statusurile" },
  { value: "PROGRAMAT", label: "Programate" },
  { value: "FINALIZAT", label: "Finalizate" },
  { value: "ANULAT", label: "Anulate" },
  { value: "REPROGRAMARE_SOLICITATA", label: "Reprogramare solicitata" },
  { value: "NEPREZENTAT", label: "Neprezentat" },
];

const hrInterviewTypes = ["HR_ONLINE", "HR_FIZIC", "HR_TELEFONIC"];
const technicalInterviewTypes = ["TEHNIC_ONLINE", "TEHNIC_FIZIC"];
const feedbackInterviewStatuses = ["FINALIZAT", "NEPREZENTAT"];

const toDatetimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMonthLabel = (value) =>
  value.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

const getDateKey = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const getCalendarDays = (calendarDate) => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      key: getDateKey(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: getDateKey(date) === getDateKey(new Date()),
    };
  });
};

function InterviewsPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingInterviewId, setEditingInterviewId] = useState(null);
  const [editFormError, setEditFormError] = useState("");
  const [editForm, setEditForm] = useState({
    data_interviu: "",
    tip_interviu: "",
    link_meeting: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    jobId: "",
  });
  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarInterview, setSelectedCalendarInterview] =
    useState(null);

  const canAccess =
    user?.rol === "CANDIDAT" ||
    user?.rol === "RECRUTOR" ||
    user?.rol === "MANAGER" ||
    user?.rol === "ADMIN";

  const isCandidate = user?.rol === "CANDIDAT";
  const editableInterviewTypes =
    user?.rol === "MANAGER"
      ? technicalInterviewTypes
      : user?.rol === "RECRUTOR"
        ? hrInterviewTypes
        : [...hrInterviewTypes, ...technicalInterviewTypes];
  const canManageFeedbackForInterview = (interview) => {
    if (isCandidate || !feedbackInterviewStatuses.includes(interview.status)) {
      return false;
    }

    if (user?.rol === "RECRUTOR") {
      return hrInterviewTypes.includes(interview.tip_interviu);
    }

    if (user?.rol === "MANAGER") {
      return technicalInterviewTypes.includes(interview.tip_interviu);
    }

    return false;
  };
  const canManageInterviewStage = (interview) => {
    if (isCandidate || !interview) {
      return false;
    }

    if (user?.rol === "ADMIN") {
      return true;
    }

    if (user?.rol === "RECRUTOR") {
      return hrInterviewTypes.includes(interview.tip_interviu);
    }

    if (user?.rol === "MANAGER") {
      return technicalInterviewTypes.includes(interview.tip_interviu);
    }

    return false;
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError("");
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Nu s-au putut incarca joburile.");
      } finally {
        setIsLoadingJobs(false);
      }
    };

    if (canAccess && !isCandidate) {
      loadJobs();
    } else if (isCandidate) {
      setIsLoadingJobs(false);
    }
  }, [canAccess, isCandidate]);

  useEffect(() => {
    const loadCandidateInterviews = async () => {
      if (!isCandidate) {
        return;
      }

      setIsLoadingInterviews(true);
      setError("");

      try {
        const data = await getMyInterviews();
        setInterviews(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Nu s-au putut incarca interviurile."
        );
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    loadCandidateInterviews();
  }, [isCandidate]);

  useEffect(() => {
    const loadInterviews = async () => {
      if (isCandidate) {
        return;
      }

      if (jobs.length === 0) {
        setInterviews([]);
        return;
      }

      setIsLoadingInterviews(true);
      setError("");

      try {
        const interviewsByJob = await Promise.all(
          jobs.map((job) =>
            getJobInterviews(job.id_job).then((jobInterviews) =>
              jobInterviews.map((interview) => ({
                ...interview,
                id_job: job.id_job,
                titlu_job: job.titlu_job,
              }))
            )
          )
        );

        setInterviews(interviewsByJob.flat());
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Nu s-au putut incarca interviurile."
        );
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    loadInterviews();
  }, [jobs, isCandidate]);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const reloadCandidateInterviews = async () => {
    const data = await getMyInterviews();
    setInterviews(data);
  };

  const reloadStaffInterviews = async () => {
    const interviewsByJob = await Promise.all(
      jobs.map((job) =>
        getJobInterviews(job.id_job).then((jobInterviews) =>
          jobInterviews.map((interview) => ({
            ...interview,
            id_job: job.id_job,
            titlu_job: job.titlu_job,
          }))
        )
      )
    );

    setInterviews(interviewsByJob.flat());
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesStatus =
      !filters.status || interview.status === filters.status;

    const matchesJob =
      isCandidate
        ? !filters.jobId || Number(interview.id_job) === Number(filters.jobId)
        : !selectedJobId || Number(interview.id_job) === Number(selectedJobId);

    return matchesStatus && matchesJob;
  });

  const candidateInterviewJobs = interviews.reduce((uniqueJobs, interview) => {
    if (
      interview.id_job &&
      !uniqueJobs.some((job) => Number(job.id_job) === Number(interview.id_job))
    ) {
      uniqueJobs.push({
        id_job: interview.id_job,
        titlu_job: interview.titlu_job,
      });
    }

    return uniqueJobs;
  }, []);

  const handleCancelInterview = async (interviewId) => {
    const confirmed = window.confirm("Sigur vrei sa anulezi interviul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await cancelInterview(interviewId);
      setMessage("Interviul a fost anulat.");
      setSelectedCalendarInterview(null);
      await reloadCandidateInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut anula interviul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelManagedInterview = async (interviewId) => {
    const confirmed = window.confirm("Sigur vrei sa anulezi interviul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await updateInterview(interviewId, {
        status: "ANULAT",
      });

      setMessage("Interviul a fost anulat.");
      setSelectedCalendarInterview(null);
      await reloadStaffInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut anula interviul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestReschedule = async (interviewId) => {
    const confirmed = window.confirm(
      "Sigur vrei sa soliciti reprogramarea interviului?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await requestInterviewReschedule(interviewId);
      setMessage("Solicitarea de reprogramare a fost trimisa.");
      setSelectedCalendarInterview(null);
      await reloadCandidateInterviews();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut solicita reprogramarea interviului."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingInterview = (interview) => {
    setSelectedCalendarInterview(null);
    setEditingInterviewId(interview.id_interviu);
    setEditForm({
      data_interviu: toDatetimeLocalValue(interview.data_interviu),
      tip_interviu: interview.tip_interviu || editableInterviewTypes[0],
      link_meeting: interview.link_meeting || "",
    });
    setError("");
    setMessage("");
    setEditFormError("");
  };

  const cancelEditingInterview = () => {
    setEditingInterviewId(null);
    setEditForm({
      data_interviu: "",
      tip_interviu: "",
      link_meeting: "",
    });
    setEditFormError("");
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setEditFormError("");
  };

  const handleUpdateInterview = async (event) => {
    event.preventDefault();

    if (!editingInterviewId) {
      return;
    }

    if (!editForm.data_interviu) {
      setEditFormError("Alege data si ora interviului.");
      return;
    }

    if (new Date(editForm.data_interviu) <= new Date()) {
      setEditFormError("Data interviului trebuie sa fie in viitor.");
      return;
    }

    setError("");
    setMessage("");
    setEditFormError("");
    setIsSaving(true);

    try {
      await updateInterview(editingInterviewId, {
        data_interviu: editForm.data_interviu,
        tip_interviu: editForm.tip_interviu,
        link_meeting: editForm.link_meeting,
        status: "PROGRAMAT",
      });

      setMessage("Interviul a fost actualizat si programat din nou.");
      cancelEditingInterview();
      await reloadStaffInterviews();
    } catch (err) {
      setEditFormError(
        err.response?.data?.message ||
          "Nu s-a putut actualiza interviul."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeedback = async ({ feedbackId, payload }) => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (feedbackId) {
        await updateFeedback(feedbackId, payload);
        setMessage("Feedbackul a fost actualizat.");
      } else {
        await createFeedback(payload);
      setMessage("Feedbackul a fost salvat.");
      }

      setSelectedCalendarInterview(null);
      setFeedbackInterview(null);
      await reloadStaffInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut salva feedbackul.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const confirmed = window.confirm("Sigur vrei sa stergi feedbackul?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await deleteFeedback(feedbackId);
      setMessage("Feedbackul a fost sters.");
      setSelectedCalendarInterview(null);
      setFeedbackInterview(null);
      await reloadStaffInterviews();
    } catch (err) {
      setError(err.response?.data?.message || "Nu s-a putut sterge feedbackul.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToPreviousMonth = () => {
    setCalendarDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCalendarDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToCurrentMonth = () => {
    setCalendarDate(new Date());
  };

  const interviewsByDate = filteredInterviews.reduce((groups, interview) => {
    const key = getDateKey(interview.data_interviu);

    if (!key) {
      return groups;
    }

    return {
      ...groups,
      [key]: [...(groups[key] || []), interview].sort(
        (firstInterview, secondInterview) =>
          new Date(firstInterview.data_interviu) -
          new Date(secondInterview.data_interviu)
      ),
    };
  }, {});

  const getInterviewTitle = (interview) => {
    if (isCandidate) {
      return interview.titlu_job || "Interviu";
    }

    const candidateName = `${interview.prenume || ""} ${
      interview.nume || ""
    }`.trim();

    return candidateName || "Candidat";
  };

  const renderInterviewActions = (interview) => (
    <div className="card-actions">
      <Link
        className="button-link secondary-link"
        to={`/applications/${interview.id_aplicatie}`}
      >
        Detalii aplicare
      </Link>

      {isCandidate && interview.status === "PROGRAMAT" && (
        <>
          <button
            type="button"
            onClick={() => handleRequestReschedule(interview.id_interviu)}
            disabled={isSaving}
          >
            Solicita reprogramare
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={() => handleCancelInterview(interview.id_interviu)}
            disabled={isSaving}
          >
            Anuleaza interviul
          </button>
        </>
      )}

      {canManageInterviewStage(interview) &&
        ["PROGRAMAT", "REPROGRAMARE_SOLICITATA"].includes(
          interview.status
        ) && (
          <button
            type="button"
            onClick={() => startEditingInterview(interview)}
            disabled={isSaving}
          >
            Reprogrameaza
          </button>
        )}

      {!isCandidate &&
        canManageInterviewStage(interview) &&
        ["PROGRAMAT", "REPROGRAMARE_SOLICITATA"].includes(
          interview.status
        ) && (
          <button
            type="button"
            className="danger-button"
            onClick={() => handleCancelManagedInterview(interview.id_interviu)}
            disabled={isSaving}
          >
            Anuleaza interviul
          </button>
        )}

      {!isCandidate && canManageFeedbackForInterview(interview) && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setSelectedCalendarInterview(null);
            setFeedbackInterview(interview);
          }}
          disabled={isSaving}
        >
          {buildFeedbackFromInterview(interview)
            ? "Editeaza feedback"
            : "Adauga feedback"}
        </button>
      )}
    </div>
  );

  const renderInterviewCalendar = () => (
    <div className="interview-calendar">
      <div className="calendar-toolbar">
        <div>
          <h2>{formatMonthLabel(calendarDate)}</h2>
          <p>
            Interviurile sunt grupate dupa data programarii. Apasa pe un
            interviu pentru detalii si actiuni.
          </p>
        </div>

        <div className="calendar-nav">
          <button type="button" onClick={goToPreviousMonth}>
            Luna anterioara
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={goToCurrentMonth}
          >
            Luna curenta
          </button>
          <button type="button" onClick={goToNextMonth}>
            Luna urmatoare
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {getCalendarDays(calendarDate).map((day) => {
          const dayInterviews = interviewsByDate[day.key] || [];

          return (
            <div
              className={`calendar-day${
                day.isCurrentMonth ? "" : " muted-day"
              }${day.isToday ? " today-day" : ""}`}
              key={day.key}
            >
              <div className="calendar-day-number">
                <span>{day.date.getDate()}</span>
              </div>

              <div className="calendar-events">
                {dayInterviews.map((interview) => (
                  <button
                    type="button"
                    className={`calendar-event status-${interview.status?.toLowerCase()}`}
                    key={interview.id_interviu}
                    onClick={() => setSelectedCalendarInterview(interview)}
                  >
                    <strong>{formatTime(interview.data_interviu)}</strong>
                    <span>{getInterviewTitle(interview)}</span>
                    <small>
                      {interviewTypeLabels[interview.tip_interviu] ||
                        interview.tip_interviu ||
                        "Interviu"}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCalendarInterviewModal = () => {
    if (!selectedCalendarInterview) {
      return null;
    }

    const interview = selectedCalendarInterview;
    const organizerName =
      interview.organizator_prenume || interview.organizator_nume
        ? `${interview.organizator_prenume || ""} ${
            interview.organizator_nume || ""
          }`.trim()
        : "-";

    return (
      <div className="modal-overlay" role="presentation">
        <article className="modal-panel interview-detail-modal">
          <div className="modal-header">
            <div>
              <h2>{getInterviewTitle(interview)}</h2>
              <p>
                {interviewTypeLabels[interview.tip_interviu] ||
                  interview.tip_interviu ||
                  "Interviu"}
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() => setSelectedCalendarInterview(null)}
              aria-label="Inchide"
            >
              x
            </button>
          </div>

          <span className={`status-badge status-${interview.status?.toLowerCase()}`}>
            {interviewStatusLabels[interview.status] || interview.status}
          </span>

          <div className="interview-card-grid">
            {!isCandidate && (
              <>
                <div>
                  <span>Candidat</span>
                  <strong>
                    {interview.prenume} {interview.nume}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{interview.email || "-"}</strong>
                </div>

                <div>
                  <span>Telefon</span>
                  <strong>{interview.telefon || "-"}</strong>
                </div>
              </>
            )}

            <div>
              <span>Job</span>
              <strong>{interview.titlu_job || "-"}</strong>
            </div>

            <div>
              <span>Data si ora</span>
              <strong>{formatDateTime(interview.data_interviu)}</strong>
            </div>

            <div>
              <span>Link/locatie</span>
              <strong>{interview.link_meeting || "-"}</strong>
            </div>

            <div>
              <span>Organizator</span>
              <strong>{organizerName}</strong>
            </div>
          </div>

          {renderInterviewActions(interview)}
        </article>
      </div>
    );
  };

  if (isCandidate) {
    return (
      <section className="page-section">
        <div className="section-header">
          <div>
            <h1>Interviurile mele</h1>
            <p>Vezi interviurile programate pentru candidaturile tale.</p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="table-section">
          {isLoadingInterviews ? (
            <p>Se incarca interviurile...</p>
          ) : interviews.length === 0 ? (
            <p>Nu ai interviuri programate momentan.</p>
          ) : (
            <>
            <form className="filter-panel compact-filter">
              <label>
                Job
                <select
                  name="jobId"
                  value={filters.jobId}
                  onChange={handleFilterChange}
                >
                  <option value="">Toate joburile</option>
                  {candidateInterviewJobs.map((job) => (
                    <option key={job.id_job} value={job.id_job}>
                      {job.titlu_job}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  {interviewFilterStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </form>

            <p className="table-count">
              {filteredInterviews.length} interviuri afisate din{" "}
              {interviews.length}
            </p>

            {filteredInterviews.length === 0 ? (
              <p>Nu exista interviuri care respecta filtrele selectate.</p>
            ) : (
              renderInterviewCalendar()
            )}
            </>
          )}
        </div>

        {renderCalendarInterviewModal()}
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>Interviuri</h1>
          <p>Vezi interviurile programate pentru joburile disponibile rolului tau.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {isLoadingJobs ? (
        <p>Se incarca joburile...</p>
      ) : jobs.length === 0 ? (
        <p>Nu exista joburi disponibile.</p>
      ) : (
        <>
          <form className="content-form">
            <label>
              Job
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
              >
                <option value="">Toate joburile</option>
                {jobs.map((job) => (
                  <option key={job.id_job} value={job.id_job}>
                    {job.titlu_job}
                  </option>
                ))}
              </select>
            </label>

            {selectedJobId && (
              <Link className="button-link secondary-link" to={`/jobs/${selectedJobId}`}>
                Vezi jobul
              </Link>
            )}
          </form>

          <div className="table-section">
            {isLoadingInterviews ? (
              <p>Se incarca interviurile...</p>
            ) : interviews.length === 0 ? (
              <p>Nu exista interviuri pentru joburile disponibile.</p>
            ) : (
              <>
              <form className="filter-panel compact-filter">
                <label>
                  Status
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    {interviewFilterStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </form>

              <p className="table-count">
                {filteredInterviews.length} interviuri afisate din{" "}
                {interviews.length}
              </p>

              {filteredInterviews.length === 0 ? (
                <p>Nu exista interviuri care respecta filtrele selectate.</p>
              ) : (
                renderInterviewCalendar()
              )}

              </>
            )}
          </div>
        </>
      )}

      {renderCalendarInterviewModal()}

      {editingInterviewId && (
        <div className="modal-overlay" role="presentation">
          <form className="modal-panel" onSubmit={handleUpdateInterview}>
            <div className="modal-header">
              <div>
                <h2>Reprogrameaza interviul</h2>
                <p>Alege noua data, tipul interviului si linkul sau locatia.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={cancelEditingInterview}
                disabled={isSaving}
                aria-label="Inchide"
              >
                x
              </button>
            </div>

            <label>
              Data si ora
              <input
                type="datetime-local"
                name="data_interviu"
                value={editForm.data_interviu}
                onChange={handleEditFormChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              {editFormError && <span className="field-error">{editFormError}</span>}
            </label>

            <label>
              Tip interviu
              <select
                name="tip_interviu"
                value={editForm.tip_interviu}
                onChange={handleEditFormChange}
                required
              >
                {editableInterviewTypes.map((type) => (
                  <option key={type} value={type}>
                    {interviewTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Link meeting sau locatie
              <input
                name="link_meeting"
                value={editForm.link_meeting}
                onChange={handleEditFormChange}
                placeholder="Ex: https://meet.google.com/... sau sediul companiei"
                maxLength="500"
              />
            </label>

            <div className="form-actions">
              <button type="submit" disabled={isSaving}>
                Salveaza reprogramarea
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={cancelEditingInterview}
                disabled={isSaving}
              >
                Anuleaza
              </button>
            </div>
          </form>
        </div>
      )}

      {feedbackInterview && (
        <FeedbackModal
          interview={feedbackInterview}
          candidateName={`${feedbackInterview.prenume || ""} ${
            feedbackInterview.nume || ""
          }`.trim()}
          jobTitle={feedbackInterview.titlu_job}
          interviewerName={`${
            feedbackInterview.organizator_prenume || ""
          } ${feedbackInterview.organizator_nume || ""}`.trim()}
          interviewTypeLabel={
            interviewTypeLabels[feedbackInterview.tip_interviu] ||
            feedbackInterview.tip_interviu
          }
          formatDateTime={formatDateTime}
          onClose={() => setFeedbackInterview(null)}
          onSubmit={handleSaveFeedback}
          onDelete={handleDeleteFeedback}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}

export default InterviewsPage;
