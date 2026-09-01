const interviewModel = require("../models/interviewModel");
const feedbackModel = require("../models/feedbackModel");
const notificationService = require("../services/notificationService");

const USER_ROLES =
  require("../constants/userRoles");

const INTERVIEW_STATUS =
  require("../constants/interviewStatus");

const APPLICATION_STATUS =
  require("../constants/applicationStatus");

const INTERVIEW_TYPES =
  require("../constants/interviewTypes");

const allowedInterviewTypes = Object.values(INTERVIEW_TYPES);

const interviewTypeLabels = {
  [INTERVIEW_TYPES.HR_ONLINE]: "HR online",
  [INTERVIEW_TYPES.HR_FIZIC]: "HR fizic",
  [INTERVIEW_TYPES.HR_TELEFONIC]: "HR telefonic",
  [INTERVIEW_TYPES.TEHNIC_ONLINE]: "tehnic online",
  [INTERVIEW_TYPES.TEHNIC_FIZIC]: "tehnic fizic"
};

const formatInterviewDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

const formatInterviewType = (type) => {
  return interviewTypeLabels[type] || type || "nespecificat";
};

const getApplicationLinkTag = (applicationId) =>
  applicationId ? ` [aplicatie:${applicationId}]` : "";

const formatCandidateName = (context) =>
  `${context?.prenume || ""} ${context?.nume || ""}`.trim() || "Candidatul";

const buildNoShowFeedbackContent = (interview) =>
  JSON.stringify({
    experienta_claritate:
      "Candidatul nu s-a prezentat la interviul programat.",
    comunicare_atitudine_motivatie:
      "Candidatul nu a participat la interviu, deci nu au putut fi evaluate comunicarea, atitudinea si motivatia.",
    evaluare_tehnica: isTechnicalInterview(interview.tip_interviu)
      ? "Candidatul nu s-a prezentat la interviul tehnic, deci partea tehnica nu a putut fi evaluata."
      : "",
    concluzie_generala:
      "Interviul nu a putut avea loc din cauza neprezentarii candidatului.",
    motivare_recomandare:
      "Nu se recomanda continuarea procesului in aceasta etapa, deoarece candidatul nu s-a prezentat la interviul programat."
  });

const isFutureDate = (value) => {
  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date > new Date();
};

const isHrInterview = (type) =>
  [
    INTERVIEW_TYPES.HR_ONLINE,
    INTERVIEW_TYPES.HR_FIZIC,
    INTERVIEW_TYPES.HR_TELEFONIC
  ].includes(type);

const isTechnicalInterview = (type) =>
  [
    INTERVIEW_TYPES.TEHNIC_ONLINE,
    INTERVIEW_TYPES.TEHNIC_FIZIC
  ].includes(type);

const canManageInterviewStage = (user, type) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    return isHrInterview(type);
  }

  if (user.rol === USER_ROLES.MANAGER) {
    return isTechnicalInterview(type);
  }

  return false;
};

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.ADMIN) {
    return true;
  }

  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await interviewModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(job.id_recrutor) === Number(recruiter.id_recrutor) &&
      Number(job.id_departament) === Number(recruiter.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await interviewModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(job.id_departament) === Number(manager.id_departament)
    );
  }

  return false;
};

const findOrganizerInterviewConflict = async ({
  organizerId,
  interviewDate,
  excludedInterviewId = null
}) => {
  return interviewModel.getOrganizerInterviewConflict({
    organizerId,
    interviewDate,
    excludedInterviewId
  });
};

const createInterview = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {

      return res.status(403).json({
        message:
          "Doar recruiterii sau managerii pot crea interviuri"
      });
    }

    const {
      id_aplicatie,
      data_interviu,
      tip_interviu,
      link_meeting
    } = req.body;

    if (!allowedInterviewTypes.includes(tip_interviu)) {
      return res.status(400).json({
        message: "Tip interviu invalid"
      });
    }

    if (!data_interviu || !isFutureDate(data_interviu)) {
      return res.status(400).json({
        message: "Data interviului trebuie sa fie valida si in viitor"
      });
    }

    if (req.user.rol === USER_ROLES.RECRUTOR && !isHrInterview(tip_interviu)) {
      return res.status(403).json({
        message: "Recrutorul poate programa doar interviuri HR"
      });
    }

    if (req.user.rol === USER_ROLES.MANAGER && !isTechnicalInterview(tip_interviu)) {
      return res.status(403).json({
        message: "Managerul poate programa doar interviuri tehnice"
      });
    }

    const application =
      await interviewModel.getApplicationById(
        id_aplicatie
      );

    if (!application) {

      return res.status(404).json({
        message:
          "Aplicatia nu exista"
      });
    }

    const job = await interviewModel.getJobById(application.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti crea interviuri pentru aceasta aplicatie"
      });
    }

    const applicationInterviews =
      await interviewModel.getApplicationInterviews(id_aplicatie);

    const hasFinalizedHrInterview = applicationInterviews.some(
      (item) =>
        isHrInterview(item.tip_interviu) &&
        item.status === INTERVIEW_STATUS.FINALIZAT
    );

    const hasActiveInterviewOfSameStage = applicationInterviews.some(
      (item) =>
        ((isHrInterview(tip_interviu) && isHrInterview(item.tip_interviu)) ||
          (isTechnicalInterview(tip_interviu) &&
            isTechnicalInterview(item.tip_interviu))) &&
        [
          INTERVIEW_STATUS.PROGRAMAT,
          INTERVIEW_STATUS.REPROGRAMARE_SOLICITATA
        ].includes(item.status)
    );

    if (hasActiveInterviewOfSameStage) {
      return res.status(400).json({
        message: "Exista deja un interviu activ pentru aceasta etapa"
      });
    }

    if (isTechnicalInterview(tip_interviu) && !hasFinalizedHrInterview) {
      return res.status(400).json({
        message:
          "Interviul tehnic poate fi programat doar dupa finalizarea interviului HR"
      });
    }

    const interviewConflict = await findOrganizerInterviewConflict({
      organizerId: req.user.id,
      interviewDate: data_interviu
    });

    if (interviewConflict) {
      return res.status(400).json({
        message:
          "Exista deja un interviu programat in apropierea acestei ore. Alege un interval de cel putin o ora."
      });
    }

    const interview =
      await interviewModel.createInterview({

        id_aplicatie,

        id_organizator:
          req.user.id,

        data_interviu,

        tip_interviu,

        link_meeting,

        status:
          INTERVIEW_STATUS.PROGRAMAT
      });

    if (application.status === APPLICATION_STATUS.DEPUSA) {
      await interviewModel.updateApplicationStatus(
        id_aplicatie,
        APPLICATION_STATUS.IN_ANALIZA
      );
    }

    const candidateUserId =
        await interviewModel.getCandidateUserIdByApplication(
        id_aplicatie
    );

    await notificationService.createNotification({
        id_utilizator: candidateUserId,
        titlu: "Interviu programat",
        mesaj:
          `Ai fost programat la un interviu ${formatInterviewType(tip_interviu)} ` +
          `pe ${formatInterviewDate(data_interviu)}.` +
          (link_meeting ? ` Link/locatie: ${link_meeting}.` : "") +
          getApplicationLinkTag(id_aplicatie)
    });

    res.status(201).json(interview);

  } catch (err) {

    console.error(
      "CREATE INTERVIEW ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const updateInterview = async (
  req,
  res
) => {

  try {
    const allowedStatuses = [
      INTERVIEW_STATUS.PROGRAMAT,
      INTERVIEW_STATUS.FINALIZAT,
      INTERVIEW_STATUS.ANULAT,
      INTERVIEW_STATUS.REPROGRAMARE_SOLICITATA,
      INTERVIEW_STATUS.NEPREZENTAT
    ];

    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Status interviu invalid"
      });
    }

    if (req.body.tip_interviu && !allowedInterviewTypes.includes(req.body.tip_interviu)) {
      return res.status(400).json({
        message: "Tip interviu invalid"
      });
    }

    if (req.body.data_interviu && !isFutureDate(req.body.data_interviu)) {
      return res.status(400).json({
        message: "Data interviului trebuie sa fie valida si in viitor"
      });
    }

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const interview =
      await interviewModel.getInterviewById(
        req.params.id
      );

    if (!interview) {

      return res.status(404).json({
        message:
          "Interviul nu exista"
      });
    }

    const job = await interviewModel.getJobById(interview.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti modifica acest interviu"
      });
    }

    if (!canManageInterviewStage(req.user, interview.tip_interviu)) {
      return res.status(403).json({
        message: "Nu poti modifica acest tip de interviu"
      });
    }

    if (
      req.body.tip_interviu &&
      !canManageInterviewStage(req.user, req.body.tip_interviu)
    ) {
      return res.status(403).json({
        message: "Nu poti schimba interviul la acest tip"
      });
    }

    if (
      req.body.data_interviu &&
      (!req.body.status || req.body.status === INTERVIEW_STATUS.PROGRAMAT)
    ) {
      const interviewConflict = await findOrganizerInterviewConflict({
        organizerId: interview.id_organizator,
        interviewDate: req.body.data_interviu,
        excludedInterviewId: req.params.id
      });

      if (interviewConflict) {
        return res.status(400).json({
          message:
            "Exista deja un interviu programat in apropierea acestei ore. Alege un interval de cel putin o ora."
        });
      }
    }

    const updatedInterview =
      await interviewModel.updateInterview(
        req.params.id,
        req.body
      );

    const interviewWasRescheduled =
      interview.status === INTERVIEW_STATUS.REPROGRAMARE_SOLICITATA &&
      req.body.status === INTERVIEW_STATUS.PROGRAMAT;

    const interviewScheduleChanged =
      Boolean(req.body.data_interviu) || Boolean(req.body.link_meeting);

    if (
      interviewWasRescheduled ||
      (req.body.status === INTERVIEW_STATUS.PROGRAMAT && interviewScheduleChanged)
    ) {
      const candidateUserId =
        await interviewModel.getCandidateUserIdByApplication(
          interview.id_aplicatie
        );

      if (candidateUserId) {
        await notificationService.createNotification({
          id_utilizator: candidateUserId,
          titlu: "Interviu actualizat",
          mesaj:
            `Interviul tau ${formatInterviewType(updatedInterview.tip_interviu)} ` +
            `a fost programat pentru ${formatInterviewDate(updatedInterview.data_interviu)}.` +
            (updatedInterview.link_meeting
              ? ` Link/locatie: ${updatedInterview.link_meeting}.`
              : "") +
            getApplicationLinkTag(interview.id_aplicatie)
        });
      }
    }

    if (
      interview.status !== INTERVIEW_STATUS.FINALIZAT &&
      req.body.status === INTERVIEW_STATUS.FINALIZAT &&
      isHrInterview(interview.tip_interviu)
    ) {
      const managerUserId =
        await interviewModel.getManagerUserIdByDepartmentId(
          job.id_departament
        );

      if (managerUserId && Number(managerUserId) !== Number(req.user.id)) {
        const context =
          await interviewModel.getApplicationNotificationContext(
            interview.id_aplicatie
          );

        await notificationService.createNotification({
          id_utilizator: managerUserId,
          titlu: "Candidat pregatit pentru interviu tehnic",
          mesaj:
            `${formatCandidateName(context)} a finalizat etapa HR pentru jobul "${context?.titlu_job || "necunoscut"}" si poate fi evaluat tehnic.` +
            getApplicationLinkTag(interview.id_aplicatie)
        });
      }
    }

    res.json(updatedInterview);

  } catch (err) {

    console.error(
      "UPDATE INTERVIEW ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const deleteInterview = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const interview =
      await interviewModel.getInterviewById(
        req.params.id
      );

    if (!interview) {

      return res.status(404).json({
        message:
          "Interviul nu exista"
      });
    }

    const job = await interviewModel.getJobById(interview.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti sterge acest interviu"
      });
    }

    if (!canManageInterviewStage(req.user, interview.tip_interviu)) {
      return res.status(403).json({
        message: "Nu poti sterge acest tip de interviu"
      });
    }

    const deletedInterview =
      await interviewModel.deleteInterview(
        req.params.id
      );

    res.json({
      message:
        "Interviu sters cu succes",

      interview:
        deletedInterview
    });

  } catch (err) {

    console.error(
      "DELETE INTERVIEW ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const getJobInterviews = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const job = await interviewModel.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti vedea interviurile pentru acest job"
      });
    }

    const interviews =
      await interviewModel.getJobInterviews(
        req.params.id
      );

    res.json(interviews);

  } catch (err) {

    console.error(
      "GET INTERVIEWS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const getMyInterviews = async (
  req,
  res
) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Doar candidatii pot vedea lista proprie de interviuri"
      });
    }

    const candidate =
      await interviewModel.getCandidateByUserId(
        req.user.id
      );

    if (!candidate) {

      return res.status(400).json({
        message:
          "Nu exista candidat asociat acestui user"
      });
    }

    const interviews =
      await interviewModel.getCandidateInterviews(
        candidate.id_candidat
      );

    res.json(interviews);

  } catch (err) {

    console.error(
      "GET MY INTERVIEWS ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const updateInterviewStatusByCandidate = async (
  req,
  res,
  status,
  successMessage
) => {
  try {
    if (req.user.rol !== USER_ROLES.CANDIDAT) {
      return res.status(403).json({
        message: "Doar candidatii pot efectua aceasta actiune"
      });
    }

    const candidate = await interviewModel.getCandidateByUserId(req.user.id);

    if (!candidate) {
      return res.status(400).json({
        message: "Nu exista candidat asociat acestui user"
      });
    }

    const interview = await interviewModel.getInterviewById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interviul nu exista"
      });
    }

    const application = await interviewModel.getApplicationById(
      interview.id_aplicatie
    );

    if (
      !application ||
      Number(application.id_candidat) !== Number(candidate.id_candidat)
    ) {
      return res.status(403).json({
        message: "Nu poti modifica acest interviu"
      });
    }

    if (interview.status !== INTERVIEW_STATUS.PROGRAMAT) {
      return res.status(400).json({
        message: "Interviul nu mai poate fi modificat"
      });
    }

    const updatedInterview = await interviewModel.updateInterviewStatus(
      req.params.id,
      status
    );

    const notificationContext =
      await interviewModel.getApplicationNotificationContext(
        interview.id_aplicatie
      );

    await notificationService.createNotification({
      id_utilizator: interview.id_organizator,
      titlu: "Interviu actualizat",
      mesaj:
        `${formatCandidateName(notificationContext)} - ${successMessage}` +
        getApplicationLinkTag(interview.id_aplicatie)
    });

    res.json(updatedInterview);
  } catch (err) {
    console.error("CANDIDATE UPDATE INTERVIEW ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const cancelInterviewByCandidate = async (req, res) => {
  return updateInterviewStatusByCandidate(
    req,
    res,
    INTERVIEW_STATUS.ANULAT,
    "Candidatul a anulat interviul programat."
  );
};

const requestInterviewReschedule = async (req, res) => {
  return updateInterviewStatusByCandidate(
    req,
    res,
    INTERVIEW_STATUS.REPROGRAMARE_SOLICITATA,
    "Candidatul a solicitat reprogramarea interviului."
  );
};

const markInterviewNoShow = async (req, res) => {
  try {
    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER &&
      req.user.rol !== USER_ROLES.ADMIN
    ) {
      return res.status(403).json({
        message: "Acces interzis"
      });
    }

    const interview = await interviewModel.getInterviewById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interviul nu exista"
      });
    }

    const job = await interviewModel.getJobById(interview.id_job);

    if (!job) {
      return res.status(404).json({
        message: "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message: "Nu poti modifica acest interviu"
      });
    }

    if (!canManageInterviewStage(req.user, interview.tip_interviu)) {
      return res.status(403).json({
        message: "Nu poti modifica acest tip de interviu"
      });
    }

    if (interview.status !== INTERVIEW_STATUS.PROGRAMAT) {
      return res.status(400).json({
        message: "Doar interviurile programate pot fi marcate ca neprezentat"
      });
    }

    const updatedInterview = await interviewModel.updateInterviewStatus(
      req.params.id,
      INTERVIEW_STATUS.NEPREZENTAT
    );

    const existingFeedback =
      await feedbackModel.getFeedbackByInterviewId(req.params.id);

    if (!existingFeedback) {
      await feedbackModel.createFeedback({
        id_interviu: req.params.id,
        id_autor: req.user.id,
        continut_feedback: buildNoShowFeedbackContent(interview),
        rating_candidat: null,
        recomandare_finala: "NU_SE_RECOMANDA_CONTINUAREA_PROCESULUI"
      });
    }

    const candidateUserId =
      await interviewModel.getCandidateUserIdByApplication(
        interview.id_aplicatie
      );

    if (candidateUserId) {
      await notificationService.createNotification({
        id_utilizator: candidateUserId,
        titlu: "Status interviu actualizat",
        mesaj:
          "Interviul tau a fost marcat ca neprezentat." +
          getApplicationLinkTag(interview.id_aplicatie)
      });
    }

    res.json(updatedInterview);
  } catch (err) {
    console.error("MARK INTERVIEW NO SHOW ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  createInterview,
  updateInterview,
  deleteInterview,
  getJobInterviews,
  getMyInterviews,
  cancelInterviewByCandidate,
  requestInterviewReschedule,
  markInterviewNoShow
};
