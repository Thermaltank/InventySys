import axios from "axios";

// Configura la URL base para tu API
const API_URL = "http://localhost:8080/api/usuarios";

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario", error);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData); // Supón que tienes un endpoint de login
    return response.data; // Devuelve datos que podrías usar para manejar el login
  } catch (error) {
    console.error("Error al iniciar sesión", error);
    throw error;
  }
};
