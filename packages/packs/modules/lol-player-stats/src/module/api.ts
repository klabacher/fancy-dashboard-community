// ============================================================================
// LoL Player Stats Widget - API Client (Bridge Integration)
// Typed client for invoking Tauri backend commands
// ============================================================================

import { createPluginInvoke, BridgeLogger } from "@fancydashboard/sdk/bridge";
import type { PluginManifest } from "@fancydashboard/sdk/bridge";
import type {
  LolPlayerSummary,
  LolApiKeyStatus,
  LolGetPlayerRequest,
} from "./types";

// ============================================================================
// Plugin Manifest
// ============================================================================

const manifest: PluginManifest = {
  id: "lol-player-stats",
  name: "League of Legends Player Stats",
  version: "1.0.0",
  description:
    "Widget de estatísticas de jogadores de League of Legends via Riot API",
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
 * Check if an API key is stored and its validity status
 */
export async function checkApiKeyStatus(): Promise<LolApiKeyStatus> {
  const response = await pluginInvoke<
    Record<string, never>,
    ApiResponse<LolApiKeyStatus>
  >("lol_check_api_key", {});

  if (!response.success) {
    handleApiError(
      "checkApiKeyStatus",
      response,
      "Falha ao verificar status da API key"
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "checkApiKeyStatus",
      apiResponse,
      "Não foi possível verificar a API key"
    );
  }

  return apiResponse.data!;
}

/**
 * Set and validate the Riot API key
 * Returns true if the key was valid and stored successfully
 */
export async function setApiKey(apiKey: string): Promise<boolean> {
  BridgeLogger.info(manifest.id, "setApiKey", "Tentando configurar API key...");

  const response = await pluginInvoke<{ apiKey: string }, ApiResponse<boolean>>(
    "lol_set_api_key",
    { apiKey }
  );

  if (!response.success) {
    handleApiError(
      "setApiKey",
      response,
      "Falha ao salvar API key. Verifique sua conexão."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "setApiKey",
      apiResponse,
      "API key inválida ou expirada. Verifique se a chave está correta."
    );
  }

  const success = apiResponse.data ?? false;
  if (success) {
    BridgeLogger.info(
      manifest.id,
      "setApiKey",
      "API key configurada com sucesso"
    );
  } else {
    BridgeLogger.warn(
      manifest.id,
      "setApiKey",
      "API key rejeitada pelo servidor"
    );
  }

  return success;
}

/**
 * Remove the stored API key
 */
export async function removeApiKey(): Promise<void> {
  const response = await pluginInvoke<Record<string, never>, ApiResponse<null>>(
    "lol_remove_api_key",
    {}
  );

  if (!response.success) {
    handleApiError("removeApiKey", response, "Falha ao remover API key");
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "removeApiKey",
      apiResponse,
      "Não foi possível remover a API key"
    );
  }

  BridgeLogger.info(manifest.id, "removeApiKey", "API key removida");
}

/**
 * Get player summary including account, summoner, and ranked data
 * This is proxied through the Rust backend to keep API key secure
 */
export async function getPlayerSummary(
  request: LolGetPlayerRequest
): Promise<LolPlayerSummary> {
  BridgeLogger.info(
    manifest.id,
    "getPlayerSummary",
    `Buscando dados de ${request.gameName}#${request.tagLine} (${request.region})`
  );

  const response = await pluginInvoke<
    { region: string; gameName: string; tagLine: string },
    ApiResponse<LolPlayerSummary>
  >("lol_get_player_summary", {
    region: request.region,
    gameName: request.gameName,
    tagLine: request.tagLine,
  });

  if (!response.success) {
    handleApiError(
      "getPlayerSummary",
      response,
      "Falha ao buscar dados do jogador. Verifique sua conexão."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    // Provide user-friendly error messages based on common API errors
    let friendlyMessage = apiResponse.message ?? "Jogador não encontrado";

    if (apiResponse.message?.includes("404")) {
      friendlyMessage = `Jogador "${request.gameName}#${request.tagLine}" não encontrado na região ${request.region}.`;
    } else if (apiResponse.message?.includes("403")) {
      friendlyMessage =
        "API key expirada ou inválida. Por favor, atualize sua chave.";
    } else if (apiResponse.message?.includes("429")) {
      friendlyMessage =
        "Limite de requisições atingido. Aguarde alguns segundos e tente novamente.";
    }

    BridgeLogger.error(manifest.id, "getPlayerSummary", friendlyMessage);
    throw new Error(friendlyMessage);
  }

  if (!apiResponse.data) {
    const errorMsg = "Dados do jogador não retornados pelo servidor";
    BridgeLogger.error(manifest.id, "getPlayerSummary", errorMsg);
    throw new Error(errorMsg);
  }

  BridgeLogger.info(
    manifest.id,
    "getPlayerSummary",
    `Dados carregados para ${apiResponse.data.account.gameName}`
  );

  return apiResponse.data;
}

/**
 * Validate the stored API key by making a test request
 */
export async function validateApiKey(): Promise<boolean> {
  const response = await pluginInvoke<
    Record<string, never>,
    ApiResponse<boolean>
  >("lol_validate_api_key", {});

  if (!response.success) {
    BridgeLogger.warn(
      manifest.id,
      "validateApiKey",
      "Falha na validação, assumindo inválida"
    );
    return false;
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    BridgeLogger.warn(
      manifest.id,
      "validateApiKey",
      apiResponse.message ?? "Validação inconclusiva"
    );
    return false;
  }

  const isValid = apiResponse.data ?? false;
  BridgeLogger.info(
    manifest.id,
    "validateApiKey",
    `API key ${isValid ? "válida" : "inválida"}`
  );

  return isValid;
}
