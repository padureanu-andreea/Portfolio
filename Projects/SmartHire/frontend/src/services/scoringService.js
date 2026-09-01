import api from "../api/api";

export const calculateApplicationScore = async (applicationId) => {
  const response = await api.post(`/applications/${applicationId}/calculate-score`);
  return response.data;
};

export const calculateMissingScoresForJob = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/calculate-missing-scores`);
  return response.data;
};
