export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem("token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function getCurrentUser() {
  const data = await request("/api/user/me");
  return data.user;
}

export async function updateUser(userData) {
  return request("/api/user/me", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append("profilePicture", file);
  return request("/api/user/profile-picture", {
    method: "POST",
    body: formData,
  });
}

export async function removeProfilePicture() {
  return request("/api/user/profile-picture", { method: "DELETE" });
}

export async function loginUser(email, password, remember = true) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, remember }),
  });
}

export async function registerUser(name, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logoutUser() {
  return request("/api/auth/logout", { method: "POST" });
}

export async function resendVerification(email) {
  return request("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetCode(email, code) {
  return request("/api/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resetPassword(password, resetToken) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ password, resetToken }),
  });
}
