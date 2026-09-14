# Changelog

All notable changes to FancyDashboard Community are documented here.

## [1.1.0] - Unreleased

### Added

- Deterministic portable pack builds for all nine Community packs.
- ESM, CommonJS, declaration, manifest, widget, version, and permission contract verification.
- A public entry point for MapCN so its declared package exports can be loaded.
- A validated snapshot/request/command protocol between independently loaded Calendar and To-Do bundles.

### Changed

- Raised the minimum supported FancyDashboard Core version to 1.1.0.
- Aligned package versions with their compiled manifests.
- Standardized build externals to keep host libraries out of each pack bundle.
- Replaced empty global settings panels with the explicit `null` contract.
- Made Weather decoration deterministic and removed a development-only hook from release bundles.

### Fixed

- MapCN now emits its advertised ESM, CommonJS, declaration, and manifest exports.
- Calendar observes and edits To-Do tasks across independently installed packs without embedding To-Do's native bridge identity.
- The release verifier now rejects package/manifest version drift and incomplete exports.

### Release blockers

- Final permission declarations require explicit security approval before they are persisted.
- Native visual and interaction QA is blocked by the unavailable Computer Use kernel; compiled and contract evidence does not replace that gate.
