const profileModel =
  require("../models/profileModel");

const USER_ROLES =
  require("../constants/userRoles");

const createProfile = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Doar candidatii pot crea profil"
      });
    }

    const candidate =
      await profileModel.getCandidateByUserId(
        req.user.id
      );

    if (!candidate) {

      return res.status(404).json({
        message:
          "Nu exista candidat asociat"
      });
    }

    const existingProfile =
      await profileModel.getProfileByCandidateId(
        candidate.id_candidat
      );

    if (existingProfile) {

      return res.status(400).json({
        message:
          "Profilul exista deja"
      });
    }

    const profile =
      await profileModel.createProfile({

        id_candidat:
          candidate.id_candidat,

        ...req.body
      });

    res.status(201).json(profile);

  } catch (err) {

    console.error(
      "CREATE PROFILE ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const getMyProfile = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const candidate =
      await profileModel.getCandidateByUserId(
        req.user.id
      );

    const profile =
      await profileModel.getProfileByCandidateId(
        candidate.id_candidat
      );

    if (!profile) {

      return res.status(404).json({
        message:
          "Profilul nu exista"
      });
    }

    res.json(profile);

  } catch (err) {

    console.error(
      "GET PROFILE ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const updateProfile = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const candidate =
      await profileModel.getCandidateByUserId(
        req.user.id
      );

    const existingProfile =
      await profileModel.getProfileByCandidateId(
        candidate.id_candidat
      );

    if (!existingProfile) {

      return res.status(404).json({
        message:
          "Profilul nu exista"
      });
    }

    const updatedProfile =
      await profileModel.updateProfile(
        candidate.id_candidat,
        req.body
      );

    res.json(updatedProfile);

  } catch (err) {

    console.error(
      "UPDATE PROFILE ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

const deleteProfile = async (req, res) => {

  try {

    if (req.user.rol !== USER_ROLES.CANDIDAT) {

      return res.status(403).json({
        message:
          "Acces interzis"
      });
    }

    const candidate =
      await profileModel.getCandidateByUserId(
        req.user.id
      );

    const existingProfile =
      await profileModel.getProfileByCandidateId(
        candidate.id_candidat
      );

    if (!existingProfile) {

      return res.status(404).json({
        message:
          "Profilul nu exista"
      });
    }

    const deletedProfile =
      await profileModel.deleteProfile(
        candidate.id_candidat
      );

    res.json({
      message:
        "Profil sters cu succes",
      profile: deletedProfile
    });

  } catch (err) {

    console.error(
      "DELETE PROFILE ERROR:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile
};