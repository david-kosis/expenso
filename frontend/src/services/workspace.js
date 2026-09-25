import { API_URL } from "./api";

export async function getWorkspace() {
  const response = await fetch(`${API_URL}/api/workspace`, { credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load workspace");
  return data.workspace;
}

export async function saveWorkspace(workspace) {
  const response = await fetch(`${API_URL}/api/workspace`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workspace),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to save workspace");
  return data.workspace;
}
