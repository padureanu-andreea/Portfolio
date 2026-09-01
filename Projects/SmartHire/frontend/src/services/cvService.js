import api from "../api/api";

export const getMyCvs = async () => {
  const response = await api.get("/cvs/my");
  return response.data;
};

export const uploadCv = async (file) => {
  const formData = new FormData();
  formData.append("cv", file);

  const response = await api.post("/cvs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteCv = async (cvId) => {
  const response = await api.delete(`/cvs/${cvId}`);
  return response.data;
};

export const downloadCv = async (cvId) => {
  const response = await api.get(`/cvs/${cvId}/download`, {
    responseType: "blob",
  });

  return response.data;
};
