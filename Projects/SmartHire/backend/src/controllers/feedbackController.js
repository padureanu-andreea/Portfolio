const feedbackModel =
  require("../models/feedbackModel");

const USER_ROLES =
  require("../constants/userRoles");

const INTERVIEW_STATUS =
  require("../constants/interviewStatus");

const INTERVIEW_TYPES =
  require("../constants/interviewTypes");

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

const canAccessJob = async (user, job) => {
  if (user.rol === USER_ROLES.RECRUTOR) {
    const recruiter = await feedbackModel.getRecruiterByUserId(user.id);

    return Boolean(
      recruiter &&
      Number(job.id_recrutor) === Number(recruiter.id_recrutor) &&
      Number(job.id_departament) === Number(recruiter.id_departament)
    );
  }

  if (user.rol === USER_ROLES.MANAGER) {
    const manager = await feedbackModel.getManagerByUserId(user.id);

    return Boolean(
      manager &&
      Number(job.id_departament) === Number(manager.id_departament)
    );
  }

  return false;
};

const canManageInterviewStage = (user, interviewType) => {
  if (user.rol === USER_ROLES.RECRUTOR) {
    return isHrInterview(interviewType);
  }

  if (user.rol === USER_ROLES.MANAGER) {
    return isTechnicalInterview(interviewType);
  }

  return false;
};

const canWriteFeedbackForInterview = (user, interview) => {
  return (
    canManageInterviewStage(user, interview.tip_interviu) &&
    [
      INTERVIEW_STATUS.FINALIZAT,
      INTERVIEW_STATUS.NEPREZENTAT
    ].includes(interview.status)
  );
};

const createFeedback = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER
    ) {

      return res.status(403).json({
        message:
          "Doar recruiterii sau managerii pot adauga feedback"
      });
    }

    const {
      id_interviu,
      continut_feedback,
      recomandare_finala
    } = req.body;

    if (!id_interviu || !continut_feedback || !recomandare_finala) {
      return res.status(400).json({
        message:
          "Interviul, continutul feedbackului si recomandarea sunt obligatorii"
      });
    }

    const interview =
      await feedbackModel.getInterviewById(
        id_interviu
      );

    if (!interview) {

      return res.status(404).json({
        message:
          "Interviul nu exista"
      });
    }

    const job = await feedbackModel.getJobById(interview.id_job);

    if (!job) {
      return res.status(404).json({
        message:
          "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "Nu poti adauga feedback pentru acest interviu"
      });
    }

    if (!canWriteFeedbackForInterview(req.user, interview)) {
      return res.status(403).json({
        message:
          "Feedbackul poate fi adaugat doar pentru etapa gestionata de rolul tau si doar dupa finalizarea interviului"
      });
    }

    const existingFeedback =
      await feedbackModel.getFeedbackByInterviewId(
        id_interviu
      );

    if (existingFeedback) {

      return res.status(400).json({
        message:
          "Exista deja feedback pentru acest interviu"
      });
    }

    const feedback =
      await feedbackModel.createFeedback({

        id_interviu,

        id_autor:
          req.user.id,

        continut_feedback,

        rating_candidat:
          null,

        recomandare_finala
      });

    res.status(201).json(feedback);

  } catch (err) {

    console.error(
      "CREATE FEEDBACK ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const getInterviewFeedback = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const interview =
      await feedbackModel.getInterviewById(
        req.params.id
      );

    if (!interview) {

      return res.status(404).json({
        message:
          "Interviul nu exista"
      });
    }

    const job = await feedbackModel.getJobById(interview.id_job);

    if (!job) {
      return res.status(404).json({
        message:
          "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "Nu poti vedea feedbackul acestui interviu"
      });
    }

    if (!canManageInterviewStage(req.user, interview.tip_interviu)) {
      return res.status(403).json({
        message:
          "Nu poti vedea feedbackul acestui tip de interviu"
      });
    }

    const feedback =
      await feedbackModel.getFeedbackByInterviewId(
        req.params.id
      );

    if (!feedback) {

      return res.status(404).json({
        message:
          "Feedback-ul nu exista"
      });
    }

    res.json(feedback);

  } catch (err) {

    console.error(
      "GET FEEDBACK ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const updateFeedback = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const feedback =
      await feedbackModel.getFeedbackById(
        req.params.id
      );

    if (!feedback) {

      return res.status(404).json({
        message:
          "Feedback-ul nu exista"
      });
    }

    const job = await feedbackModel.getJobById(feedback.id_job);

    if (!job) {
      return res.status(404).json({
        message:
          "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "Nu poti modifica acest feedback"
      });
    }

    const interview =
      await feedbackModel.getInterviewById(feedback.id_interviu);

    if (!interview || !canWriteFeedbackForInterview(req.user, interview)) {
      return res.status(403).json({
        message:
          "Nu poti modifica feedbackul acestui interviu"
      });
    }

    const updatedFeedback =
      await feedbackModel.updateFeedback(
      req.params.id,
      req.body
    );

    res.json(updatedFeedback);

  } catch (err) {

    console.error(
      "UPDATE FEEDBACK ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const deleteFeedback = async (
  req,
  res
) => {

  try {

    if (
      req.user.rol !== USER_ROLES.RECRUTOR &&
      req.user.rol !== USER_ROLES.MANAGER
    ) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const feedback =
      await feedbackModel.getFeedbackById(
        req.params.id
      );

    if (!feedback) {

      return res.status(404).json({
        message:
          "Feedback-ul nu exista"
      });
    }

    const job = await feedbackModel.getJobById(feedback.id_job);

    if (!job) {
      return res.status(404).json({
        message:
          "Jobul nu exista"
      });
    }

    const hasAccess = await canAccessJob(req.user, job);

    if (!hasAccess) {
      return res.status(403).json({
        message:
          "Nu poti sterge acest feedback"
      });
    }

    const interview =
      await feedbackModel.getInterviewById(feedback.id_interviu);

    if (!interview || !canManageInterviewStage(req.user, interview.tip_interviu)) {
      return res.status(403).json({
        message:
          "Nu poti sterge feedbackul acestui interviu"
      });
    }

    const deletedFeedback =
      await feedbackModel.deleteFeedback(
        req.params.id
      );

    res.json({

      message:
        "Feedback sters cu succes",

      feedback:
        deletedFeedback
    });

  } catch (err) {

    console.error(
      "DELETE FEEDBACK ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  createFeedback,
  getInterviewFeedback,
  updateFeedback,
  deleteFeedback
};
