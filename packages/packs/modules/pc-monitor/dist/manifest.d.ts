declare const manifest: {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    apiVersion: string;
    tier: "essential" | "community";
    entry: {
        frontend: string;
    };
    integrity: {
        sha256: string;
    };
    kind: "module";
    widgets: {
        id: string;
        name: string;
        description: string;
        configSchema?: {
            schema?: unknown;
            description?: string | undefined;
            version?: string | undefined;
        } | undefined;
    }[];
    metadata?: {
        category: "productivity" | "media" | "monitoring" | "social" | "gaming" | "utilities" | "visualization" | "other";
        tags?: string[] | undefined;
        license?: string | undefined;
        repository?: string | null | undefined;
        screenshots?: string[] | undefined;
        previewImages?: string[] | undefined;
    } | undefined;
    permissionsRequested?: ({
        kind: "store:read";
    } | {
        kind: "store:write";
    } | {
        kind: "notification:send";
    } | {
        kind: "net:fetch";
        allow: string[];
    } | {
        kind: "fs:scope";
        allow: string[];
    } | {
        kind: "shell:exec";
        allow: string[];
    })[] | undefined;
    configSchema?: {
        schema?: unknown;
        description?: string | undefined;
        version?: string | undefined;
    } | undefined;
    capabilitiesProvided?: {
        id: string;
        description?: string | undefined;
    }[] | undefined;
};

export { manifest as default, manifest };
