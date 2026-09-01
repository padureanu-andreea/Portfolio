const applicationModel = require("../models/applicationModel");
const USER_ROLES = require("../constants/userRoles");
const APPLICATION_STATUS = require("../constants/applicationStatus");
const JOB_STATUS = require("../constants/jobStatus");
const notificationService = require("../services/notificationService");

const applicationStatusNotificationMessages = {
  [APPLICATION_STATUS.DEPUSA]: {
    titlu: "Candidatura inregistrata",
    mesaj: (jobTitle) =>
      `Candidatura ta pentru jobul "${jobTitle}" este inregistrata.`
  },
  [APPLICATION_STATUS.IN_ANALIZA]: {
    titlu: "Candidatura in analiza",
    mesaj: (jobTitle) =>
      `Candidatura ta pentru jobul "${jobTitle}" este in analiza. Echipa de recrutare evalueaza profilul tau.`
  },
  [APPLICATION_STATUS.ACCEPTATA]: {
    titlu: "Candidatura acceptata",
    mesaj: (jobTitle) =>
      `Felicitari! Candidatura ta pentru jobul "${jobTitle}" a fost acceptata.`
  },
  [APPLICATION_STATUS.RESPINSA]: {
    titlu: "Candidatura respinsa",
    mesaj: (jobTitle) =>
      `Procesul de recrutare pentru jobul "${jobTitle}" nu va continua cu aceasta candidatura.`
  }
};

const finalApplicationStatuses = [
  APPLICATION_STATUS.ACCEPTATA,
  APPLICATION_STATUS.RESPINSA
];

const isFinalApplicationStatus = (status) =>
  finalApplicationStatuses.includes(status);

const getApplicationLinkTag = (applicationId) =>
  applicationId ? ` [aplicatie:${applicationId}]` : "";

const getCandidateDisplayName = async (applicationId) => {
  const applicationDetails =
    await applicationModel.getApplicationDetailsForCandidate(applicationId);

  return `${applicationDetails?.prenume || ""} ${
    applicationDetails?.nume || ""
  }`.trim() || "Candidatul";
};

const notifyCandidateAboutStatusChange = async ({
  candidateId,
  jobTitle,
  status,
  applicationId
}) => {
  const notificationData = applicationStatusNotificationMessages[status];

  if (!notificationData) {
    return;
  }

  const candidateUserId =
    await applicationModel.getCandidateUserId(candidateId);

  if (!candidateUserId) {
    return;
  }

  await notificationService.createNotification({
    id_utilizator: candidateUserId,
    titlu: notificationData.titlu,
    mesaj: `${notificationData.mesaj(jobTitle)}${getApplicationLinkTag(applicationId)}`
  });
};

const createApplication = async (req, res) => {
  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Doar candidatii pot aplica"
      });
    }

    const candidate = await applicationModel.getCandidateByUserId(req.user.id);

    if (!candidate) {
      return res.status(400).json({
        message: "Nu exista candidat asociat userului"
      });
    }

    const {
      id_job,
      id_cv
    } = req.body;

    const job = await applicationModel.getJobById(id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    if (job.status !== JOB_STATUS.ACTIV) {
      return res.status(400).json({
        message: "Poti aplica doar la joburi active"
      });
    }

    const cv = await applicationModel.getCvById(id_cv);

    if (!cv) {
      return res.status(404).json({
        message: "CV-ul nu exista"
      });
    }

    if (cv.id_candidat !== candidate.id_candidat) {
      return res.status(403).json({
        message: "CV invalid"
      });
    }

    const existingApplication =
  await applicationModel.getApplicationByCandidateAndJob(
    candidate.id_candidat,
    id_job
  );

    if (existingApplication) {
      return res.status(400).json({
        message: "Ai aplicat deja la acest job"
      });
    }

    const application = await applicationModel.createApplication({
      id_candidat: candidate.id_candidat,
      id_job,
      id_cv
    });

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Aplicatie trimisa",
      mesaj:
        `Ai aplicat cu succes la jobul "${job.titlu_job}".` +
        getApplicationLinkTag(application.id_aplicatie)
    });

    const recruiterUserId = await applicationModel.getRecruiterUserIdByJobId(id_job);

    if (recruiterUserId) {
      const candidateName = await getCandidateDisplayName(application.id_aplicatie);

      await notificationService.createNotification({
        id_utilizator: recruiterUserId,
        titlu: "Aplicatie noua",
        mesaj:
          `${candidateName} a aplicat la jobul "${job.titlu_job}".` +
          getApplicationLinkTag(application.id_aplicatie)
      });
    }

    res.status(201).json(application);

  } catch (err) {
    console.error("CREATE APPLICATION ERROR:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Ai aplicat deja la acest job"
      });
    }

    res.status(500).json({
      message: err.message
    });
  }
};

const getMyApplications = async (req, res) => {
  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const candidate = await applicationModel.getCandidateByUserId(req.user.id);

    const applications =
      await applicationModel.getApplicationsByCandidate(
        candidate.id_candidat
      );

    res.json(applications);

  } catch (err) {
    console.error("GET MY APPLICATIONS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const job = await applicationModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    if (req.user.rol === USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Candidatii pot vedea doar propriile aplicatii"
      });
    }

    if (req.user.rol === USER_ROLES.RECRUTOR) {
      const recruiter = await applicationModel.getRecruiterByUserId(req.user.id);

      if (
        !recruiter ||
        Number(job.id_recrutor) !== Number(recruiter.id_recrutor) ||
        Number(job.id_departament) !== Number(recruiter.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti vedea aplicatiile pentru acest job"
        });
      }
    }

    if (req.user.rol === USER_ROLES.MANAGER) {
      const manager = await applicationModel.getManagerByUserId(req.user.id);

      if (
        !manager ||
        Number(job.id_departament) !== Number(manager.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti vedea aplicatiile din alt departament"
        });
      }
    }

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const applications = await applicationModel.getApplicationsByJob(req.params.id);

    res.json(applications);
  } catch (err) {
    console.error("GET JOB APPLICATIONS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      APPLICATION_STATUS.DEPUSA,
      APPLICATION_STATUS.IN_ANALIZA,
      APPLICATION_STATUS.ACCEPTATA,
      APPLICATION_STATUS.RESPINSA
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Status invalid"
      });
    }

    if (req.user.rol === USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Candidatii pot doar sa isi retraga candidatura"
      });
    }

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const application =
      await applicationModel.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Aplicatia nu exista"
      });
    }

    const job = await applicationModel.getJobById(application.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    if (req.user.rol === USER_ROLES.RECRUTOR) {
      const recruiter = await applicationModel.getRecruiterByUserId(req.user.id);

      if (
        !recruiter ||
        Number(job.id_recrutor) !== Number(recruiter.id_recrutor) ||
        Number(job.id_departament) !== Number(recruiter.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti modifica statusul acestei aplicatii"
        });
      }
    }

    if (req.user.rol === USER_ROLES.MANAGER) {
      const manager = await applicationModel.getManagerByUserId(req.user.id);

      if (
        !manager ||
        Number(job.id_departament) !== Number(manager.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti modifica aplicatii din alt departament"
        });
      }
    }

    if (application.status === req.body.status) {
      return res.json(application);
    }

    if (isFinalApplicationStatus(application.status)) {
      return res.status(400).json({
        message:
          "Candidatura are deja o decizie finala si statusul nu mai poate fi modificat"
      });
    }

    const updated =
      await applicationModel.updateApplicationStatus(
        req.params.id,
        req.body.status
      );

    await notifyCandidateAboutStatusChange({
      candidateId: application.id_candidat,
      jobTitle: job.titlu_job,
      status: req.body.status,
      applicationId: req.params.id
    });

    res.json(updated);

  } catch (err) {
    console.error("UPDATE APPLICATION STATUS ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Doar candidatii pot retrage candidatura"
      });
    }

    const candidate =
      await applicationModel.getCandidateByUserId(req.user.id);

    const application =
      await applicationModel.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Aplicatia nu exista"
      });
    }

    if (application.id_candidat !== candidate.id_candidat) {
      return res.status(403).json({
        message: "Nu poti retrage aceasta aplicatie"
      });
    }

    if (
      application.status === APPLICATION_STATUS.ACCEPTATA ||
      application.status === APPLICATION_STATUS.RESPINSA
    ) {
      return res.status(400).json({
        message: "Aplicatia nu mai poate fi retrasa"
      });
    }

    const updated =
      await applicationModel.updateApplicationStatus(
        req.params.id,
        APPLICATION_STATUS.RETRASA
      );

    const cancelledInterviews =
      await applicationModel.cancelProgrammedInterviewsByApplication(
        req.params.id
      );

    await notificationService.createNotification({
      id_utilizator: req.user.id,
      titlu: "Candidatura retrasa",
      mesaj: cancelledInterviews.length > 0
        ? `Ai retras candidatura cu succes. Interviul programat a fost anulat automat.${getApplicationLinkTag(req.params.id)}`
        : `Ai retras candidatura cu succes.${getApplicationLinkTag(req.params.id)}`
    });

    const recruiterUserId =
      await applicationModel.getRecruiterUserIdByJobId(application.id_job);

    if (recruiterUserId) {
      const job = await applicationModel.getJobById(application.id_job);
      const candidateName = await getCandidateDisplayName(req.params.id);

      await notificationService.createNotification({
        id_utilizator: recruiterUserId,
        titlu: "Candidatura retrasa",
        mesaj: cancelledInterviews.length > 0
          ? `${candidateName} si-a retras candidatura pentru jobul "${job?.titlu_job || "necunoscut"}". Interviul programat a fost anulat automat.${getApplicationLinkTag(req.params.id)}`
          : `${candidateName} si-a retras candidatura pentru jobul "${job?.titlu_job || "necunoscut"}".${getApplicationLinkTag(req.params.id)}`
      });
    }

    res.json(updated);

  } catch (err) {
    console.error("WITHDRAW APPLICATION ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getApplicationDetails = async (req, res) => {
  try {
    const application = await applicationModel.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Aplicatia nu exista"
      });
    }

    const job = await applicationModel.getJobById(application.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    if (req.user.rol === USER_ROLES.CANDIDAT) {
      const candidate = await applicationModel.getCandidateByUserId(req.user.id);

      if (!candidate || Number(application.id_candidat) !== Number(candidate.id_candidat)) {
        return res.status(403).json({
          message: "Nu poti vedea aceasta aplicatie"
        });
      }
    } else if (req.user.rol === USER_ROLES.RECRUTOR) {
      const recruiter = await applicationModel.getRecruiterByUserId(req.user.id);

      if (
        !recruiter ||
        Number(job.id_recrutor) !== Number(recruiter.id_recrutor) ||
        Number(job.id_departament) !== Number(recruiter.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti vedea aceasta aplicatie"
        });
      }
    } else if (req.user.rol === USER_ROLES.MANAGER) {
      const manager = await applicationModel.getManagerByUserId(req.user.id);

      if (
        !manager ||
        Number(job.id_departament) !== Number(manager.id_departament)
      ) {
        return res.status(403).json({
          message: "Nu poti vedea aceasta aplicatie"
        });
      }
    } else if (req.user.rol !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const details = await applicationModel.getApplicationDetailsForCandidate(
      req.params.id
    );

    const interviews = await applicationModel.getApplicationInterviews(
      req.params.id
    );
    const shouldIncludeFeedback =
      req.user.rol === USER_ROLES.RECRUTOR ||
      req.user.rol === USER_ROLES.MANAGER;
    const visibleInterviews = shouldIncludeFeedback
      ? interviews
      : interviews.map((interview) => {
          const {
            id_feedback,
            feedback_id_autor,
            feedback_continut_feedback,
            feedback_rating_candidat,
            feedback_recomandare_finala,
            feedback_data_feedback,
            ...visibleInterview
          } = interview;

          return visibleInterview;
        });

    res.json({
      ...details,
      interviews: visibleInterviews
    });
  } catch (err) {
    console.error("GET APPLICATION DETAILS ERROR:", err);
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationDetails
};
