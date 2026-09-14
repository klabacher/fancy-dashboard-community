# FancyDashboard Community 1.1.0 release notes

FancyDashboard Community 1.1.0 aligns every maintained pack with FancyDashboard Core 1.1.0 and turns the repository into a reproducible release input for the Marketplace.

## Pack inventory

| Pack               | Version | Purpose                                                  | 1.1.0 work                                                                                                             |
| ------------------ | ------: | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Calendar           |   1.0.0 | Calendar views backed by shared tasks                    | Synchronizes immediately with To-Do through a validated event protocol without embedding To-Do's native bridge client. |
| Clock              |   1.0.0 | Digital, analog, world, timer, and weather clock widgets | Uses an externalized build and declares the Open-Meteo dependency in the release contract.                             |
| Launcher           |   1.1.0 | Local shortcut and app launcher                          | Aligns the bridge contract with Core 1.1.0, including favicon network consent.                                         |
| LoL Player Stats   |   1.0.0 | Riot account and ranked statistics                       | Publishes a smaller host-compatible bundle and an auditable API scope.                                                 |
| PC Monitor         |   1.0.0 | Hardware and live telemetry widgets                      | Aligns system and storage capabilities with the runtime contract.                                                      |
| Productivity Suite |   2.0.0 | Quick tasks and productivity views                       | Shares the host task model without duplicating host dependencies.                                                      |
| To-Do              |   1.0.0 | Persistent task management                               | Broadcasts mutations so Calendar and independently loaded widgets stay current.                                        |
| Weather            |   1.0.0 | Open-Meteo weather layouts                               | Removes release-time debug code and makes visual particles deterministic.                                              |
| MapCN              |   2.0.0 | Network capture and visualization                        | Adds the missing public entry point and complete dual-format package exports.                                          |

## Packaging and verification

Each release pack is a deterministic ZIP containing exactly `index.js` and `manifest.json`. The release pipeline emits `catalog.json`, `SHA256SUMS.txt`, compatibility metadata, and one artifact per pack. `verify:release` checks source metadata and `verify:built` imports both ESM and CommonJS builds, checks declarations, versions, widgets, and runtime/bridge-to-catalog permission coverage.

## Compatibility

- FancyDashboard Core: 1.1.0
- Node.js: 24
- pnpm: 9.12.3
- Portable pack ABI: `fancy-browser-v1`

## Upgrade notes

Users can update packs through the Core 1.1.0 Marketplace. Calendar and To-Do retain their existing task data keys. Empty global settings pages have been removed; pack-specific widget settings remain available where implemented. Permission changes are shown before install or update and require the host's consent flow where applicable.

## Known release gate

The source and compiled contracts are prepared, but the release must remain unpublished until the permission manifest change is explicitly approved and the native app receives a full Computer Use pass at the required desktop sizes.
