import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
}

interface CheckInResponse {
  success: boolean;
  message: string;
}

interface QuizHistoryItem {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
  };
  takenAt: string;
  totalScore: number;
  riskLevel: string;
  suggestedAction: string;
}

// API functions
export const getAllEventsApi = async (): Promise<ApiResponse<Event[]>> => {
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
): Promise<ApiResponse<CheckInResponse>> => {
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

export const getUserQuizHistoryApi = async (
  userId: string
): Promise<ApiResponse<QuizHistoryItem[]>> => {
  try {
    const response = await axios.get(`${API_URL}/quizzes/history/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    return {
      success: false,
      data: [],
      error: "Failed to fetch quiz history",
    };
  }
};
