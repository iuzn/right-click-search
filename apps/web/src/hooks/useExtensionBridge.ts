import { useEffect, useRef, useState, useCallback } from "react";
import { EngineInput } from "@/types/platform";
import { BridgeResponse } from "@/types/extension-bridge";

const ACK_TIMEOUT = 600; // ms - PLATFORM.md line 328

/**
 * Extension Bridge Hook
 * Handles communication between catalog page and Chrome Extension
 * PLATFORM.md lines 324-370
 */
export function useExtensionBridge() {
  const [connected, setConnected] = useState(false);
  const [installedEngines, setInstalledEngines] = useState<EngineInput[]>([]);
  const pending = useRef(
    new Map<string, (ok: boolean, msg?: string, data?: any) => void>()
  );

  // Handshake - Establish connection with extension
  useEffect(() => {
    let timeout = setTimeout(() => setConnected(false), ACK_TIMEOUT);

    const onMessage = (e: MessageEvent) => {
      if (e.source !== window || !e.data) return;

      // ACK message from extension
      if (e.data.type === "RCS_BRIDGE_ACK") {
        setConnected(true);
        clearTimeout(timeout);
        // Request current engines after connection
        requestEngines();
      }

      // Engine addition/removal result
      if (e.data.type === "RCS_RESULT") {
        const fn = pending.current.get(e.data.requestId);
        if (fn) {
          fn(e.data.ok, e.data.message, e.data.data);
          pending.current.delete(e.data.requestId);
        }
      }

      // Engine list update (real-time sync)
      if (e.data.type === "RCS_ENGINES_UPDATE") {
        const timestamp = Date.now();
        const newEngines = e.data.engines || [];
        console.log(`[${timestamp}] 🔄 RCS_ENGINES_UPDATE received:`, newEngines.length, 'engines');
        console.log(`[${timestamp}] 📦 Current state:`, installedEngines.length, 'engines');
        setInstalledEngines(newEngines);
        // Force a new reference
        console.log(`[${timestamp}] ✅ State setter called with:`, newEngines);
      }
    };

    window.addEventListener("message", onMessage);

    // Send handshake message
    window.postMessage(
      {
        type: "RCS_BRIDGE_HANDSHAKE",
        origin: location.origin,
        version: 1,
      },
      "*"
    );

    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timeout);
    };
  }, []);

  // Request current engines from extension
  const requestEngines = useCallback(() => {
    window.postMessage(
      {
        type: "RCS_GET_ENGINES",
      },
      "*"
    );
  }, []);

  // Get engines from extension
  const getEngines = useCallback(
    async (): Promise<{ ok: boolean; engines?: EngineInput[] }> => {
      return new Promise((resolve) => {
        const requestId = crypto.randomUUID();

        pending.current.set(requestId, (ok, msg, data) =>
          resolve({ ok, engines: data?.engines })
        );

        window.postMessage(
          {
            type: "RCS_GET_ENGINES",
            requestId,
          },
          "*"
        );

        setTimeout(() => {
          if (pending.current.has(requestId)) {
            pending.current.delete(requestId);
            resolve({ ok: false });
          }
        }, 2000);
      });
    },
    []
  );

  // Add engines to extension
  const addEngines = useCallback(
    async (engines: EngineInput[]): Promise<BridgeResponse> => {
      return new Promise<BridgeResponse>((resolve) => {
        const requestId = crypto.randomUUID();

        pending.current.set(requestId, (ok, msg) =>
          resolve({ ok, message: msg })
        );

        window.postMessage(
          {
            type: "RCS_ADD_ENGINES",
            engines,
            requestId,
          },
          "*"
        );

        // Timeout safety - if no response within 2 seconds
        setTimeout(() => {
          if (pending.current.has(requestId)) {
            pending.current.delete(requestId);
            resolve({
              ok: false,
              message: "Extension did not respond (timeout)",
            });
          }
        }, 2000);
      });
    },
    []
  );

  // Remove engine from extension
  const removeEngine = useCallback(
    async (engineUrl: string): Promise<BridgeResponse> => {
      return new Promise<BridgeResponse>((resolve) => {
        const requestId = crypto.randomUUID();

        pending.current.set(requestId, (ok, msg) =>
          resolve({ ok, message: msg })
        );

        window.postMessage(
          {
            type: "RCS_REMOVE_ENGINE",
            url: engineUrl,
            requestId,
          },
          "*"
        );

        setTimeout(() => {
          if (pending.current.has(requestId)) {
            pending.current.delete(requestId);
            resolve({
              ok: false,
              message: "Extension did not respond (timeout)",
            });
          }
        }, 2000);
      });
    },
    []
  );

  return {
    connected,
    installedEngines,
    getEngines,
    addEngines,
    removeEngine,
  };
}
