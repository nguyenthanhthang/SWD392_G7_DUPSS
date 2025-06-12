import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Existing API functions
export const getAllEventsApi = async () => {
  const response = await axios.get(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    withCredentials: true,
  });
  return response.data;
};

export const checkInEventApi = async (
  eventId: string,
  userId: string,
  qrCode: string
) => {
  const response = await axios.post(
    `${API_URL}/events/${eventId}/check-in`,
    {
      userId,
      qrCode,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
};
