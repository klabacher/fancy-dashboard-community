import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const root = process.cwd();

async function listPackDirs() {
  const result = [];
  for (const group of ["modules", "plugins"]) {
    const groupRoot = path.join(root, "packages", "packs", group);
    for (const entry of await fs.readdir(groupRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) result.push(path.join(groupRoot, entry.name));
    }
  }
  return result.sort();
}

async function listSourceFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(target)));
    } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
      files.push(target);
    }
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function moduleExport(value) {
  return value?.default ?? value;
}

function mapBridgePermissionToCatalog(permission) {
  switch (permission) {
    case "bridge:invoke":
    case "bridge:event":
    case "bridge:window":
      return null;
    case "tauri:fs":
      return "fs:scope";
    case "tauri:shell":
      return "shell:exec";
    default:
      return permission;
  }
}

async function collectInternalBridgePermissions(packDir) {
  const sourceRoot = path.join(packDir, "src");
  const requested = new Set();

  for (const file of await listSourceFiles(sourceRoot)) {
    const source = await fs.readFile(file, "utf8");
    if (
      !source.includes("PluginManifest") ||
      !source.includes("createPluginInvoke")
    ) {
      continue;
    }

    for (const block of source.matchAll(
      /\bpermissions\s*:\s*\[([\s\S]*?)\]/g,
    )) {
      for (const value of block[1].matchAll(/["']([^"']+)["']/g)) {
        requested.add(value[1]);
      }
    }
  }

  return requested;
}

const permissionErrors = new Set();

const approvedPermissionMatrix = {
  calendar: [],
  clock: [{ kind: "net:fetch", allow: ["https://api.open-meteo.com"] }],
  launcher: [
    { kind: "fs:scope", allow: ["*"] },
    { kind: "shell:exec", allow: ["*"] },
    { kind: "net:fetch", allow: ["http://*", "https://*"] },
  ],
  "lol-player-stats": [
    { kind: "store:read" },
    { kind: "store:write" },
    { kind: "net:fetch", allow: ["https://*.api.riotgames.com"] },
  ],
  "pc-monitor": [
    { kind: "system:specs" },
    { kind: "system:telemetry" },
    { kind: "store:read" },
    { kind: "store:write" },
  ],
  "productivity-suite": [],
  todo: [{ kind: "store:read" }, { kind: "store:write" }],
  weather: [{ kind: "net:fetch", allow: ["https://api.open-meteo.com"] }],
  mapcn: [
    { kind: "network:capture" },
    { kind: "store:read" },
    { kind: "store:write" },
  ],
};

function normalizedPermissions(permissions) {
  return permissions
    .map((permission) => ({
      kind: permission.kind,
      ...(Array.isArray(permission.allow)
        ? { allow: [...permission.allow].sort() }
        : {}),
    }))
    .sort((left, right) => left.kind.localeCompare(right.kind));
}

function assertApprovedPermissions(manifest) {
  const expected = approvedPermissionMatrix[manifest.id];
  assert(expected, `${manifest.id}: missing approved permission matrix entry`);
  const actualJson = JSON.stringify(
    normalizedPermissions(manifest.permissionsRequested ?? []),
  );
  const expectedJson = JSON.stringify(normalizedPermissions(expected));
  assert(
    actualJson === expectedJson,
    `${manifest.id}: catalog permissions do not match the approved matrix\nexpected ${expectedJson}\nactual   ${actualJson}`,
  );
}

function assertRuntimePermissionsAreDeclared(pkgName, runtime, manifest) {
  const declared = manifest.permissionsRequested ?? [];
  const requested = [
    ...(runtime.globalPermissions ?? []),
    ...(runtime.widgets ?? []).flatMap((widget) => widget.permissions ?? []),
  ];

  for (const permission of requested) {
    const match = declared.find(
      (candidate) => candidate.kind === permission.kind,
    );
    if (!match) {
      permissionErrors.add(
        `${pkgName}: runtime requests ${permission.kind}, but the catalog manifest does not declare it`,
      );
      continue;
    }
    if (Array.isArray(permission.allow)) {
      const declaredAllow = Array.isArray(match.allow) ? match.allow : [];
      for (const scope of permission.allow) {
        if (!declaredAllow.includes(scope)) {
          permissionErrors.add(
            `${pkgName}: runtime scope ${scope} is missing from catalog ${permission.kind}`,
          );
        }
      }
    }
  }
}

function assertBridgePermissionsAreDeclared(pkgName, requested, manifest) {
  const declared = manifest.permissionsRequested ?? [];

  for (const bridgePermission of requested) {
    const catalogKind = mapBridgePermissionToCatalog(bridgePermission);
    if (!catalogKind) continue;

    if (!declared.some((candidate) => candidate.kind === catalogKind)) {
      const mapped =
        bridgePermission === catalogKind
          ? catalogKind
          : `${bridgePermission} (catalog ${catalogKind})`;
      permissionErrors.add(
        `${pkgName}: bridge source requests ${mapped}, but the catalog manifest does not declare it`,
      );
    }
  }
}

for (const packDir of await listPackDirs()) {
  const pkg = JSON.parse(
    await fs.readFile(path.join(packDir, "package.json"), "utf8"),
  );
  const mainExports = pkg.exports?.["."];
  const manifestExports = pkg.exports?.["./manifest"];
  assert(
    mainExports && manifestExports,
    `${pkg.name}: missing package exports`,
  );

  const expected = [
    mainExports.import,
    mainExports.require,
    mainExports.types,
    manifestExports.import,
    manifestExports.require,
    manifestExports.types,
  ];
  for (const relative of expected) {
    assert(typeof relative === "string", `${pkg.name}: invalid export path`);
    await fs.access(path.resolve(packDir, relative));
  }

  const esm = moduleExport(
    await import(
      `${pathToFileURL(path.resolve(packDir, mainExports.import)).href}?verify=${Date.now()}`
    ),
  );
  const cjs = moduleExport(require(path.resolve(packDir, mainExports.require)));
  const manifestEsm = moduleExport(
    await import(
      `${pathToFileURL(path.resolve(packDir, manifestExports.import)).href}?verify=${Date.now()}`
    ),
  );
  const manifestCjs = moduleExport(
    require(path.resolve(packDir, manifestExports.require)),
  );

  assertApprovedPermissions(manifestEsm);

  for (const [format, module] of [
    ["ESM", esm],
    ["CJS", cjs],
  ]) {
    assert(module?.id === manifestEsm.id, `${pkg.name}: ${format} id mismatch`);
    assert(
      module?.version === pkg.version,
      `${pkg.name}: ${format} version ${module?.version} != ${pkg.version}`,
    );
    assert(
      Array.isArray(module.widgets) && module.widgets.length > 0,
      `${pkg.name}: ${format} has no widgets`,
    );
    assert(
      module.globalSettings === null ||
        typeof module.globalSettings === "object",
      `${pkg.name}: ${format} has an invalid globalSettings contract`,
    );
    assertRuntimePermissionsAreDeclared(pkg.name, module, manifestEsm);
  }

  assertBridgePermissionsAreDeclared(
    pkg.name,
    await collectInternalBridgePermissions(packDir),
    manifestEsm,
  );

  assert(
    manifestEsm.id === manifestCjs.id,
    `${pkg.name}: manifest id mismatch`,
  );
  assert(
    manifestEsm.version === pkg.version && manifestCjs.version === pkg.version,
    `${pkg.name}: compiled manifest version mismatch`,
  );
}

if (permissionErrors.size > 0) {
  throw new Error(
    `Community permission contract violations:\n- ${[...permissionErrors].join("\n- ")}`,
  );
}

process.stdout.write(
  "Verified ESM, CJS, declarations, catalog/runtime/bridge permissions, manifests, and widgets for 9 Community packs.\n",
);
