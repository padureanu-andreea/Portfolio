import api from "../api/api";

export const getSkills = async () => {
  const response = await api.get("/skills");
  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await api.post("/skills", skillData);
  return response.data;
};

export const updateSkill = async (skillId, skillData) => {
  const response = await api.put(`/skills/${skillId}`, skillData);
  return response.data;
};

export const deleteSkill = async (skillId) => {
  const response = await api.delete(`/skills/${skillId}`);
  return response.data;
};