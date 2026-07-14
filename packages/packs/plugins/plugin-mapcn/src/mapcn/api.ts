// ============================================================================
// MapCN Module - API Client (Bridge Integration)
// Typed client for invoking Tauri network sniffer commands
// ============================================================================

import { createPluginInvoke, BridgeLogger } from "@fancydashboard/sdk/bridge";
import type { PluginManifest } from "@fancydashboard/sdk/bridge";
import type { SnifferStatus } from "./types";

// ============================================================================
// Plugin Manifest
// ============================================================================

const manifest: PluginManifest = {
  id: "mapcn",
  name: "MapCN - Network Connection Mapper",
  version: "2.0.0",
  description:
    "Multi-widget network telemetry with compact stats, 2D map, and 3D globe",
  permissions: ["bridge:invoke"],
};

// ============================================================================
// Bridge Integration
// ============================================================================

const pluginInvoke = createPluginInvoke(manifest);

// ============================================================================
// API Response Wrapper (matches Rust ApiResponse)
// ============================================================================

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  timestamp: number;
}

// ============================================================================
// Error Handling Helper
// ============================================================================

function handleApiError(
  functionName: string,
  response: { success: boolean; error?: { message?: string } },
  fallbackMessage: string
): never {
  const errorMsg = response.error?.message ?? fallbackMessage;
  BridgeLogger.error(manifest.id, functionName, errorMsg);
  throw new Error(errorMsg);
}

function handleRustApiError(
  functionName: string,
  response: ApiResponse<unknown>,
  fallbackMessage: string
): never {
  const errorMsg = response.message ?? fallbackMessage;
  BridgeLogger.error(manifest.id, functionName, errorMsg);
  throw new Error(errorMsg);
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start network packet capture and monitoring
 * Requires administrator privileges on most systems
 *
 * @throws Error if sniffer fails to start or is already running
 */
export async function startSniffing(): Promise<boolean> {
  BridgeLogger.info(
    manifest.id,
    "startSniffing",
    "Iniciando captura de rede..."
  );

  const response = await pluginInvoke<
    Record<string, never>,
    ApiResponse<boolean>
  >("mapcn_start_sniffing", {});

  if (!response.success) {
    handleApiError(
      "startSniffing",
      response,
      "Falha ao iniciar captura de rede. Verifique suas permissões."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    // Provide user-friendly error messages
    let friendlyMessage = apiResponse.message ?? "Falha ao iniciar captura";

    if (
      apiResponse.message?.includes("Admin") ||
      apiResponse.message?.includes("privileges")
    ) {
      friendlyMessage =
        "Permissões de administrador necessárias. Execute o aplicativo como administrador para usar a captura de pacotes.";
    } else if (
      apiResponse.message?.includes("GeoIP") ||
      apiResponse.message?.includes("mmdb")
    ) {
      friendlyMessage =
        "Banco de dados GeoIP não encontrado. Baixe o GeoLite2-City.mmdb do MaxMind e coloque na pasta de dados do aplicativo.";
    } else if (
      apiResponse.message?.includes("device") ||
      apiResponse.message?.includes("Npcap")
    ) {
      friendlyMessage =
        "Nenhum dispositivo de rede encontrado. Certifique-se de que o Npcap está instalado (Windows).";
    }

    handleRustApiError("startSniffing", apiResponse, friendlyMessage);
  }

  const success = apiResponse.data ?? false;
  if (success) {
    BridgeLogger.info(
      manifest.id,
      "startSniffing",
      "Captura de rede iniciada com sucesso"
    );
  }

  return success;
}

/**
 * Stop network packet capture
 *
 * @throws Error if sniffer is not running
 */
export async function stopSniffing(): Promise<boolean> {
  BridgeLogger.info(manifest.id, "stopSniffing", "Parando captura de rede...");

  const response = await pluginInvoke<
    Record<string, never>,
    ApiResponse<boolean>
  >("mapcn_stop_sniffing", {});

  if (!response.success) {
    handleApiError("stopSniffing", response, "Falha ao parar captura de rede");
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "stopSniffing",
      apiResponse,
      "Não foi possível parar a captura"
    );
  }

  const success = apiResponse.data ?? false;
  if (success) {
    BridgeLogger.info(manifest.id, "stopSniffing", "Captura de rede parada");
  }

  return success;
}

/**
 * Get current status of the network sniffer
 * Includes running state, device name, GeoIP DB status, and packet count
 */
export async function getSnifferStatus(): Promise<SnifferStatus> {
  const response = await pluginInvoke<
    Record<string, never>,
    ApiResponse<SnifferStatus>
  >("mapcn_get_status", {});

  if (!response.success) {
    handleApiError(
      "getSnifferStatus",
      response,
      "Falha ao obter status do sniffer"
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "getSnifferStatus",
      apiResponse,
      "Não foi possível obter o status"
    );
  }

  if (!apiResponse.data) {
    const errorMsg = "Status não retornado pelo servidor";
    BridgeLogger.error(manifest.id, "getSnifferStatus", errorMsg);
    throw new Error(errorMsg);
  }

  return apiResponse.data;
}
