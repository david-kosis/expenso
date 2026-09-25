import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { getWorkspace, saveWorkspace } from "../services/workspace";
import { getUser } from "../api/storage";

const keyFor = (prefix, userId) => `${prefix}${userId}`;

export default function WorkspaceSync() {
  const timer = useRef(null);

  const readLocal = () => {
    const user = getUser();
    if (!user) return null;
    const id = user.id || user._id;
    if (!id) return null;
    const read = (prefix, fallback) => {
      try { return JSON.parse(localStorage.getItem(keyFor(prefix, id)) || JSON.stringify(fallback)); }
      catch { return fallback; }
    };
    return {
      customers: read("expensoCustomers_", []),
      suppliers: read("expensoSuppliers_", []),
      products: read("expensoProducts_", []),
      notifications: read("expensoNotifications_", []),
    };
  };

  const writeLocal = (workspace) => {
    const user = getUser();
    if (!user) return;
    const id = user.id || user._id;
    if (!id) return;
    localStorage.setItem(keyFor("expensoCustomers_", id), JSON.stringify(workspace.customers || []));
    localStorage.setItem(keyFor("expensoSuppliers_", id), JSON.stringify(workspace.suppliers || []));
    localStorage.setItem(keyFor("expensoProducts_", id), JSON.stringify(workspace.products || []));
    localStorage.setItem(keyFor("expensoNotifications_", id), JSON.stringify(workspace.notifications || []));
    window.dispatchEvent(new CustomEvent("expenso-data-changed", { detail: { type: "workspace-loaded" } }));
  };

  const syncToServer = () => {
    const workspace = readLocal();
    if (!workspace) return;
    saveWorkspace(workspace).catch((error) => console.error("Workspace sync failed:", error));
  };

  useEffect(() => {
    let mounted = true;

    getWorkspace()
      .then((remote) => {
        if (!mounted) return;
        const local = readLocal();
        const remoteHasData = [remote.customers, remote.suppliers, remote.products, remote.notifications].some((items) => items?.length);
        const localHasData = local && [local.customers, local.suppliers, local.products, local.notifications].some((items) => items?.length);

        if (remoteHasData || !localHasData) writeLocal(remote);
        else syncToServer();
      })
      .catch(() => {
        // Offline/degraded backend: keep the existing local cache usable.
      });

    const onChanged = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(syncToServer, 500);
    };

    window.addEventListener("expenso-data-changed", onChanged);
    return () => {
      mounted = false;
      clearTimeout(timer.current);
      window.removeEventListener("expenso-data-changed", onChanged);
    };
  }, []);

  return <Outlet />;
}
