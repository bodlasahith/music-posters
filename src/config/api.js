// API configuration for development and production
const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3001/api";

export const API_ENDPOINTS = {
  GET_USER: `${API_BASE_URL}/get-user`,
  ADD_POSTER: `${API_BASE_URL}/add-poster`,
  DELETE_POSTER: `${API_BASE_URL}/delete-poster`,
  GENERATE_IMAGE:
    process.env.NODE_ENV === "production"
      ? "/api/generate-image"
      : "http://localhost:3001/generate-image",
};

export default API_BASE_URL;
