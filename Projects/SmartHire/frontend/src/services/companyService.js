import api from "../api/api";

export const getCompany = async () => {
  const response = await api.get("/company");
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await api.post("/company", companyData);
  return response.data;
};

export const updateCompany = async (companyData) => {
  const response = await api.put("/company", companyData);
  return response.data;
};
