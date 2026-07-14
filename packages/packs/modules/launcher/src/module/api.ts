// ============================================================================
// Launcher API - Bridge Integration
// Tauri bridge for .lnk parsing and app launching
// ============================================================================

import { createPluginInvoke, BridgeLogger } from "@fancydashboard/sdk/bridge";
import type { PluginManifest } from "@fancydashboard/sdk/bridge";
import type { LnkInfo, LaunchConfig, LaunchResult } from "./types";

export interface IconBinaryData {
  mime_type: string;
  base64: string;
}

// ============================================================================
// Plugin Manifest
// ============================================================================

const manifest: PluginManifest = {
  id: "launcher",
  name: "App Launcher Widget",
  version: "1.0.0",
  description: "Widget lançador de aplicativos com suporte a .lnk",
  permissions: ["bridge:invoke", "tauri:shell", "tauri:fs"],
};

// ============================================================================
// Bridge Integration
// ============================================================================

const pluginInvoke = createPluginInvoke(manifest);

// ============================================================================
// API Response Type (matching Rust ApiResponse)
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
 * Import a .lnk file and extract its information
 */
export async function importLnk(path: string): Promise<LnkInfo> {
  const response = await pluginInvoke<{ path: string }, ApiResponse<LnkInfo>>(
    "launcher_import_lnk",
    { path }
  );

  if (!response.success) {
    handleApiError(
      "importLnk",
      response,
      "Falha ao importar atalho. Verifique se o arquivo é um .lnk válido."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "importLnk",
      apiResponse,
      "Não foi possível ler informações do atalho"
    );
  }

  if (!apiResponse.data) {
    const errorMsg = "Dados do atalho não encontrados";
    BridgeLogger.error(manifest.id, "importLnk", errorMsg);
    throw new Error(errorMsg);
  }

  BridgeLogger.info(
    manifest.id,
    "importLnk",
    `Atalho importado: ${apiResponse.data.display_name ?? "Sem nome"}`
  );
  return apiResponse.data;
}

/**
 * Launch an application with the given configuration
 */
export async function launchApp(config: LaunchConfig): Promise<LaunchResult> {
  BridgeLogger.info(
    manifest.id,
    "launchApp",
    `Iniciando aplicativo: ${config.target}`
  );

  const response = await pluginInvoke<
    { config: LaunchConfig },
    ApiResponse<LaunchResult>
  >("launcher_launch", { config });

  if (!response.success) {
    handleApiError(
      "launchApp",
      response,
      "Falha ao iniciar aplicativo. O caminho pode estar incorreto ou o programa não existe."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "launchApp",
      apiResponse,
      "Não foi possível executar o aplicativo"
    );
  }

  if (!apiResponse.data) {
    const errorMsg = "Resultado do lançamento não retornado";
    BridgeLogger.error(manifest.id, "launchApp", errorMsg);
    throw new Error(errorMsg);
  }

  if (apiResponse.data.success) {
    BridgeLogger.info(
      manifest.id,
      "launchApp",
      `Aplicativo iniciado com sucesso: ${config.target} (PID: ${apiResponse.data.pid ?? "N/A"})`
    );
  } else {
    BridgeLogger.warn(
      manifest.id,
      "launchApp",
      `Aplicativo pode não ter iniciado corretamente: ${config.target}`
    );
  }

  return apiResponse.data;
}

/**
 * Validate if a target path exists
 */
export async function validateTarget(target: string): Promise<boolean> {
  const response = await pluginInvoke<{ target: string }, ApiResponse<boolean>>(
    "launcher_validate_target",
    { target }
  );

  if (!response.success) {
    BridgeLogger.warn(
      manifest.id,
      "validateTarget",
      "Falha ao validar caminho, assumindo inválido"
    );
    return false;
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    BridgeLogger.warn(
      manifest.id,
      "validateTarget",
      apiResponse.message ?? "Validação inconclusiva"
    );
    return false;
  }

  return apiResponse.data ?? false;
}

/**
 * Open a file dialog to select a .lnk file
 * Uses Tauri's dialog plugin
 */
export async function openLnkDialog(): Promise<string | null> {
  try {
    // Dynamic import to avoid bundling issues if dialog plugin isn't available
    const { open } = await import("@tauri-apps/plugin-dialog");

    const result = await open({
      title: "Selecionar um atalho (.lnk)",
      filters: [
        {
          name: "Atalhos",
          extensions: ["lnk"],
        },
      ],
      multiple: false,
    });

    if (typeof result === "string") {
      BridgeLogger.info(manifest.id, "openLnkDialog", "Atalho selecionado");
      return result;
    }

    BridgeLogger.info(
      manifest.id,
      "openLnkDialog",
      "Seleção cancelada pelo usuário"
    );
    return null;
  } catch (error) {
    const errorMsg = `Diálogo de arquivo não disponível: ${error instanceof Error ? error.message : "Verifique se o plugin de diálogo está instalado."}`;
    BridgeLogger.error(manifest.id, "openLnkDialog", errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Extract an icon for a local file target (exe/lnk target/etc).
 * Returns raw binary as base64.
 */
export async function getFileIcon(
  target: string,
  iconLocation?: string
): Promise<IconBinaryData> {
  const response = await pluginInvoke<
    { target: string; iconLocation?: string },
    ApiResponse<IconBinaryData>
  >("launcher_get_file_icon", {
    target,
    iconLocation,
  });

  if (!response.success) {
    handleApiError(
      "getFileIcon",
      response,
      "Falha ao extrair o ícone do aplicativo."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "getFileIcon",
      apiResponse,
      "Não foi possível extrair o ícone do arquivo"
    );
  }

  if (!apiResponse.data) {
    const errorMsg = "Ícone não retornado";
    BridgeLogger.error(manifest.id, "getFileIcon", errorMsg);
    throw new Error(errorMsg);
  }

  return apiResponse.data;
}

/**
 * Fetch website favicon (Rust-side HTTP to avoid CORS issues).
 */
export async function fetchFavicon(url: string): Promise<IconBinaryData> {
  const response = await pluginInvoke<
    { url: string },
    ApiResponse<IconBinaryData>
  >("launcher_fetch_favicon", { url });

  if (!response.success) {
    handleApiError(
      "fetchFavicon",
      response,
      "Falha ao buscar favicon do site."
    );
  }

  const apiResponse = response.data!;
  if (apiResponse.status === "error") {
    handleRustApiError(
      "fetchFavicon",
      apiResponse,
      "Não foi possível buscar favicon"
    );
  }

  if (!apiResponse.data) {
    const errorMsg = "Favicon não retornado";
    BridgeLogger.error(manifest.id, "fetchFavicon", errorMsg);
    throw new Error(errorMsg);
  }

  return apiResponse.data;
}
