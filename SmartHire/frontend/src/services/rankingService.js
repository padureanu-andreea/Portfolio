import api from "../api/api";

export const getJobRanking = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/ranking`);
  return response.data;
};

export const getApplicationAnalysis = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/analysis`);
  return response.data;
};
