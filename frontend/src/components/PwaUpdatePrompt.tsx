import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useLocale } from "../i18n";

/**
 * Makes PWA releases visible without force-reloading an active workspace.
 * Existing workers that activate immediately also trigger the prompt, so a
 * user can refresh out of a stale app shell at a safe moment.
 */
export default function PwaUpdatePrompt() {
  const { t } = useLocale();
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || window.location.protocol !== "https:") return;

    let disposed = false;
    let hadController = Boolean(navigator.serviceWorker.controller);
    const markUpdateReady = () => {
      if (!disposed) setUpdateReady(true);
    };
    const bindInstallingWorker = (registration: ServiceWorkerRegistration) => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) markUpdateReady();
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async registration => {
        registrationRef.current = registration;
        if (registration.waiting) markUpdateReady();
        registration.addEventListener("updatefound", () => bindInstallingWorker(registration));
        bindInstallingWorker(registration);
        await registration.update();
      })
      .catch(error => console.warn("[SW] Registration failed:", error?.message || error));

    // An older worker may activate a new worker immediately. Do not interrupt
    // forms by reloading automatically; offer a deliberate refresh instead.
    const onControllerChange = () => {
      // First installation claims the page too; it is not an update.
      if (hadController) markUpdateReady();
      hadController = true;
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const refresh = () => {
    registrationRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  if (!updateReady || dismissed) return null;
  return (
    <aside className="pwa-update-prompt" role="status" aria-live="polite">
      <RefreshCw size={18} aria-hidden="true" />
      <p>{t("发现新版本，刷新后即可使用最新功能。", "A new version is ready. Refresh to use the latest features.")}</p>
      <button className="pwa-update-refresh" onClick={refresh}>{t("立即刷新", "Refresh now")}</button>
      <button className="pwa-update-dismiss" onClick={() => setDismissed(true)} aria-label={t("稍后更新", "Update later")}>
        <X size={17} aria-hidden="true" />
      </button>
    </aside>
  );
}
