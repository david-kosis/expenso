export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =====================================================
   TOKEN
===================================================== */

export function getToken() {
  return localStorage.getItem(
    "token"
  );
}


/* =====================================================
   API REQUEST HELPER
===================================================== */

async function request(
  endpoint,
  options = {}
) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Something went wrong"
    );

    error.status =
      response.status;

    throw error;
  }

  return data;
}


/* =====================================================
   CURRENT USER
===================================================== */

export async function getCurrentUser() {
  const data =
    await request(
      "/api/user/me"
    );

  return data.user;
}


/* =====================================================
   UPDATE USER
===================================================== */

export async function updateUser(
  userData
) {
  return request(
    "/api/user/me",
    {
      method: "PUT",
      body: JSON.stringify(
        userData
      ),
    }
  );
}


/* =====================================================
   UPLOAD PROFILE PICTURE
===================================================== */

export async function uploadProfilePicture(
  file
) {
  const formData =
    new FormData();

  formData.append(
    "profilePicture",
    file
  );

  return request(
    "/api/user/profile-picture",
    {
      method: "POST",
      body: formData,
    }
  );
}


/* =====================================================
   REMOVE PROFILE PICTURE
===================================================== */

export async function removeProfilePicture() {
  return request(
    "/api/user/profile-picture",
    {
      method: "DELETE",
    }
  );
}


/* =====================================================
   LOGIN
===================================================== */

export async function loginUser(
  email,
  password
) {
  return request(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
}


/* =====================================================
   REGISTER
===================================================== */

export async function registerUser(
  name,
  email,
  password
) {
  return request(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );
}


/* =====================================================
   RESEND EMAIL VERIFICATION
===================================================== */

export async function resendVerification(
  email
) {
  return request(
    "/api/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }
  );
}
