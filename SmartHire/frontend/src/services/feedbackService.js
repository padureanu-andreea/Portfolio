import api from "../api/api";

export const createFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);
  return response.data;
};

export const updateFeedback = async (feedbackId, feedbackData) => {
  const response = await api.put(`/feedback/${feedbackId}`, feedbackData);
  return response.data;
};

export const deleteFeedback = async (feedbackId) => {
  const response = await api.delete(`/feedback/${feedbackId}`);
  return response.data;
};
