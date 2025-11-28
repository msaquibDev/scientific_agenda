const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://asicon-scientific-program.onrender.com/api";

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const api = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse(response);
  },

  getSessions: async () => {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  createSession: async (sessionData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(sessionData),
    });
    return handleResponse(response);
  },

  updateSession: async (id: string, sessionData: any) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(sessionData),
    });
    return handleResponse(response);
  },

  deleteSession: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  sendEmail: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  sendAllEmails: async () => {
    const response = await fetch(`${API_BASE_URL}/sessions/send-all-emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse(response);
  },
};
