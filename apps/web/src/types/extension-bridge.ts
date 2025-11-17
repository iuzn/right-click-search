import { EngineInput } from "./platform";

// Page -> Extension messages
export type PageToExtension =
  | {
      type: "RCS_BRIDGE_HANDSHAKE";
      origin: string;
      version: 1;
    }
  | {
      type: "RCS_ADD_ENGINES";
      engines: EngineInput[];
      requestId: string;
    };

// Extension -> Page messages
export type ExtensionToPage =
  | {
      type: "RCS_BRIDGE_ACK";
      extVersion: string;
    }
  | {
      type: "RCS_RESULT";
      requestId: string;
      ok: boolean;
      message?: string;
    };

// General message type
export type BridgeMessage = PageToExtension | ExtensionToPage;

// Bridge response type
export interface BridgeResponse {
  ok: boolean;
  message?: string;
}
