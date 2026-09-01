import api from "../api/api";

export const askCandidateAssistant = async (question) => {
  const response = await api.post("/chatbot/candidate", {
    question,
  });

  return response.data;
};
