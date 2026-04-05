import { useEffect, useState } from "react";

export type LocalUser = {
  uid: string;
  isPreview: boolean;
};

const STORAGE_KEY = "poolconnect_uid";

function generateUid(): string {
  const rnd = Math.random().toString(36).slice(2);
  const ts = Date.now().toString(36);
  return `pc_${ts}_${rnd}`;
}

/**
 * Firebase-free identity.
 * - If VITE_PREVIEW_MODE === 'true' => uid='preview-user'
 * - Otherwise => stable uid stored in localStorage
 */
export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preview = String(import.meta.env.VITE_PREVIEW_MODE || "").toLowerCase() === "true";
    if (preview) {
      setUser({ uid: "preview-user", isPreview: true });
      setLoading(false);
      return;
    }

    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const uid = existing && existing.trim() ? existing : generateUid();
      if (!existing) localStorage.setItem(STORAGE_KEY, uid);
      setUser({ uid, isPreview: false });
    } catch {
      // If storage is blocked, fall back to an ephemeral uid
      setUser({ uid: generateUid(), isPreview: false });
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
