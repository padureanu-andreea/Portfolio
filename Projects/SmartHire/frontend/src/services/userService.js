import api from "../api/api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put("/profile", profileData);
  return response.data;
};

export const changeMyPassword = async (passwordData) => {
  const response = await api.put("/profile/password", passwordData);
  return response.data;
};

export const createStaffUser = async (staffData) => {
  const response = await api.post("/users/staff", staffData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
