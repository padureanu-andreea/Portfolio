import api from "../api/api";

export const getJobs = async () => {
  const response = await api.get("/jobs");
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await api.delete(`/jobs/${jobId}`);
  return response.data;
};

export const getJobSkills = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/skills`);
  return response.data;
};

export const addSkillToJob = async (jobId, skillData) => {
  const response = await api.post(`/jobs/${jobId}/skills`, skillData);
  return response.data;
};

export const updateSkillForJob = async (jobId, skillId, skillData) => {
  const response = await api.put(`/jobs/${jobId}/skills/${skillId}`, skillData);
  return response.data;
};

export const removeSkillFromJob = async (jobId, skillId) => {
  const response = await api.delete(`/jobs/${jobId}/skills/${skillId}`);
  return response.data;
};

export const analyzeJobBias = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/analyze-bias`);
  return response.data;
};

export const getJobBiasAnalysis = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/bias-analysis`);
  return response.data;
};

export const applyAiRewrite = async (jobId, reformulatedDescription) => {
  const response = await api.put(`/jobs/${jobId}/apply-ai-rewrite`, {
    reformulated_description: reformulatedDescription,
  });
  return response.data;
};

export const publishJob = async (jobId) => {
  const response = await api.put(`/jobs/${jobId}/publish`);
  return response.data;
};

export const closeJob = async (jobId) => {
  const response = await api.put(`/jobs/${jobId}/close`);
  return response.data;
};
