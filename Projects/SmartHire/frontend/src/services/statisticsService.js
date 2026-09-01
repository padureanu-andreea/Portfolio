import api from "../api/api";

export const getRecruitmentStatistics = async () => {
  const response = await api.get("/statistics/recruitment");
  return response.data;
};
