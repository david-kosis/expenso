import { API_URL } from "./api";

export async function getWorkspace() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/workspace`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load workspace");
  return data.workspace;
}

export async function saveWorkspace(workspace) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/workspace`, {
    method: "PUT",
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspace),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to save workspace");
  return data.workspace;
}
