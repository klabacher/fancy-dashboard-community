# MapCN prerequisites

MapCN uses a platform-specific native network backend. Destination geolocation is optional and never blocks telemetry startup.

## Windows

No third-party packet driver or SDK is required.

FancyDashboard uses the Windows **IP Helper API** for active TCP destinations and the operating-system network counters for real receive/transmit rates. This intentionally avoids an Npcap runtime dependency and does not require FancyDashboard to redistribute packet-driver software.

## Linux

MapCN uses `libpcap` for packet observation. The runtime must provide libpcap and the FancyDashboard process needs the packet-capture permissions appropriate for the distribution. On Debian-family systems the development/build package is typically `libpcap-dev`; runtime packaging should depend on the corresponding libpcap runtime library.

## macOS

MapCN uses the system libpcap. Packet-capture permissions may be required depending on the machine's security policy.

## Optional GeoIP enrichment

To draw geographic destination points, install the GeoLite2 City database from MaxMind and place `GeoLite2-City.mmdb` in either:

- `<app_data_dir>/GeoLite2-City.mmdb` (recommended), or
- `<app_resources>/GeoLite2-City.mmdb`.

Typical app-data locations:

- Windows: `%APPDATA%/fancydashboard/`
- Linux: `~/.local/share/fancydashboard/`
- macOS: `~/Library/Application Support/fancydashboard/`

Without the database, MapCN continues to report connections and real aggregate upload/download rates. Geographic markers are simply unavailable, and the widget surfaces an explanatory notice instead of treating this as a capture failure.

## Runtime checks

The widget reports native-backend failures from the host and separately reports whether GeoIP enrichment is available. No synthetic traffic or synthetic bandwidth split is used.
