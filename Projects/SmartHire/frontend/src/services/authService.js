import api from "../api/api";

export const loginUser = async ({ email, parola }) => {
  const response = await api.post("/auth/login", {
    email,
    parola,
  });

  return response.data;
};

export const registerUser = async ({ nume, prenume, email, telefon, parola }) => {
  const response = await api.post("/auth/register", {
    nume,
    prenume,
    email,
    telefon,
    parola,
  });

  return response.data;
};
