import React, { useEffect, useState, useRef } from "react";

/**
 * useNetworkStatus
 * - Returns { isOnline, isSlow, reason }
 * - isOnline: boolean (true = OK)
 * - isSlow: boolean (true = detected slow effectiveType like '2g' or low downlink)
 * - reason: string explanation
 *
 * Behavior:
 * - Uses navigator.onLine for quick answer.
 * - Uses navigator.connection (if available) to detect slow connection types.
 * - Performs a periodic lightweight "ping" (fetch) to verify real connectivity and avoid false positives.
 */
export function useNetworkStatus({
  pingUrl = "/favicon.ico",
  pingIntervalMs = 15000,
  pingTimeoutMs = 3000,
  slowDownlinkThreshold = 0.5, // Mbps - treat below as slow
} = {}) {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== "undefined" && "onLine" in navigator) return navigator.onLine;
    return true;
  });
  const [isSlow, setIsSlow] = useState(false);
  const [reason, setReason] = useState("");
  const lastPingRef = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const updateFromNavigator = () => {
      const online = navigator.onLine;
      if (!mounted.current) return;
      setIsOnline(online);
      setReason(online ? "navigator.onLine=true" : "navigator.onLine=false");
    };

    window.addEventListener("online", updateFromNavigator);
    window.addEventListener("offline", updateFromNavigator);

    // network info (may be undefined on some browsers)
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const checkConnectionInfo = () => {
      if (!connection) return;
      const effectiveType = connection.effectiveType || "";
      const downlink = connection.downlink || 10;
      const slow = effectiveType.includes("2g") || downlink < slowDownlinkThreshold;
      setIsSlow(slow);
      setReason(slow ? `slow connection: ${effectiveType} ${downlink}Mbps` : `fast: ${effectiveType} ${downlink}Mbps`);
    };

    checkConnectionInfo();
    if (connection && connection.addEventListener) {
      connection.addEventListener("change", checkConnectionInfo);
    }

    // periodic ping to detect real connectivity
    let pingTimer = null;
    const doPing = async () => {
      // throttle pings
      const now = Date.now();
      if (now - lastPingRef.current < Math.max(2000, pingIntervalMs / 2)) return;
      lastPingRef.current = now;

      // quick abortable fetch to pingUrl
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), pingTimeoutMs);

        const res = await fetch(pingUrl, {
          method: "GET",
          cache: "no-cache",
          signal: controller.signal,
        });

        clearTimeout(id);

        if (!mounted.current) return;

        if (res.ok) {
          setIsOnline(true);
          // re-check navigator connection to update isSlow if needed
          checkConnectionInfo();
          setReason("ping-ok");
        } else {
          // non-OK response — still might be online but server issues; treat as online
          setIsOnline(true);
          setReason("ping-nonok");
        }
      } catch (err) {
        if (!mounted.current) return;
        setIsOnline(false);
        setReason("ping-failed");
      }
    };

    // initial ping
    doPing();

    pingTimer = setInterval(doPing, pingIntervalMs);

    return () => {
      mounted.current = false;
      window.removeEventListener("online", updateFromNavigator);
      window.removeEventListener("offline", updateFromNavigator);
      if (connection && connection.removeEventListener) {
        connection.removeEventListener("change", checkConnectionInfo);
      }
      if (pingTimer) clearInterval(pingTimer);
    };
  }, [pingUrl, pingIntervalMs, pingTimeoutMs, slowDownlinkThreshold]);

  return { isOnline, isSlow, reason };
}

/**
 * OfflineBanner - UI component you can drop into MainLayout (top)
 *
 * Renders fixed banner at top when offline or slow. Auto-hides when OK.
 * Tailwind classes used — adjust styles to match your theme.
 */
export default function OfflineBanner(props) {
  const { pingUrl, pingIntervalMs, pingTimeoutMs } = props || {};
  const { isOnline, isSlow, reason } = useNetworkStatus({
    pingUrl: pingUrl || "/favicon.ico",
    pingIntervalMs: pingIntervalMs || 15000,
    pingTimeoutMs: pingTimeoutMs || 3000,
  });

  // show banner if offline OR if slow (you can change behavior)
  const showOffline = !isOnline;
  const showSlow = isOnline && isSlow;

  if (!showOffline && !showSlow) return null;

  return (
    <div
      role="status"
      className={`fixed left-0 right-0 top-0 z-[60] mx-auto flex items-center justify-center py-2 px-4 transition-transform duration-200 ${
        showOffline ? "bg-red-600 text-white" : "bg-yellow-600 text-black"
      }`}
      style={{ backdropFilter: "saturate(120%) blur(6px)" }}
    >
      <div className="max-w-5xl w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-8 h-8 flex items-center justify-center bg-white/10">
            {showOffline ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01M12 20h.01M2 12a10 10 0 0120 0" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01M12 20h.01" /></svg>
            )}
          </div>

          <div>
            <div className="font-semibold text-sm">
              {showOffline ? "You're offline" : "Connection is slow"}
            </div>
            <div className="text-xs opacity-90">
              {showOffline
                ? "Some features will be unavailable. Check your network and try again."
                : "We detected a slow connection — some requests may take longer or fail."}
            </div>
          </div>
        </div>

        <div className="text-xs opacity-80 text-right">
          <div>Status: {reason}</div>
        </div>
      </div>
    </div>
  );
}