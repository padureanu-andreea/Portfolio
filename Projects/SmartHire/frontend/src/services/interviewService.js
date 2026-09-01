import api from "../api/api";

export const getJobInterviews = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/interviews`);
  return response.data;
};

export const getMyInterviews = async () => {
  const response = await api.get("/interviews/my");
  return response.data;
};

export const createInterview = async (interviewData) => {
  const response = await api.post("/interviews", interviewData);
  return response.data;
};

export const updateInterview = async (interviewId, interviewData) => {
  const response = await api.put(`/interviews/${interviewId}`, interviewData);
  return response.data;
};

export const cancelInterview = async (interviewId) => {
  const response = await api.put(`/interviews/${interviewId}/cancel`);
  return response.data;
};

export const requestInterviewReschedule = async (interviewId) => {
  const response = await api.put(`/interviews/${interviewId}/request-reschedule`);
  return response.data;
};

export const markInterviewNoShow = async (interviewId) => {
  const response = await api.put(`/interviews/${interviewId}/mark-no-show`);
  return response.data;
};
