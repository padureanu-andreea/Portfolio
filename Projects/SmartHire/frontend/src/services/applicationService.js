import api from "../api/api";

export const createApplication = async ({ id_job, id_cv }) => {
  const response = await api.post("/applications", {
    id_job,
    id_cv,
  });

  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get("/applications/my");
  return response.data;
};

export const withdrawApplication = async (applicationId) => {
  const response = await api.put(`/applications/${applicationId}/withdraw`);
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applications`);
  return response.data;
};

export const getApplicationDetails = async (applicationId) => {
  const response = await api.get(`/applications/${applicationId}/details`);
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`/applications/${applicationId}/status`, {
    status,
  });

  return response.data;
};
