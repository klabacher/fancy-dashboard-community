# MapCN — Network Telemetry Suite

Multi-widget network telemetry with compact status, a 2D map, and a 3D globe.

## Widgets

- **Compact Widget** — resizable telemetry card.
- **2D Map Widget** — world map with live destination lines when GeoIP data is available.
- **3D Globe Widget** — globe with geographic connection arcs when GeoIP data is available.
- **Live Telemetry** — real aggregate download/upload rate, observed packet totals, online/offline status, and recent destinations.

## Requirements

See [PREREQUISITES.md](./PREREQUISITES.md).

Windows has no Npcap requirement. Linux/macOS use the platform libpcap backend. `GeoLite2-City.mmdb` is optional enrichment: network telemetry runs without it, while map markers require it.

## Usage

1. Add a MapCN widget from the module list.
2. Click **Start** to enable network monitoring.
3. Open the widget settings overlay to customize the presentation.

## Security and privacy

- **Local processing** — captured/observed network metadata is processed on the device.
- **No telemetry upload** — MapCN does not send captured network metadata to a FancyDashboard server.
- **No synthetic bandwidth split** — aggregate receive/transmit rates come from operating-system network counters.
- **Bounded state** — recent connection entries expire after 60 seconds and the host emits at most the top 100 entries per snapshot.
- **Payload avoidance** — MapCN uses packet headers for connection metadata on libpcap platforms; Windows uses the IP Helper connection table rather than packet payloads.
- **Explicit permission** — the module declares `network:capture`, which is mediated by the FancyDashboard permission/consent layer.

## Platform architecture

### Windows

The Rust host uses Windows IP Helper (`GetExtendedTcpTable`) to enumerate active TCP destinations and `sysinfo` interface counters for real receive/transmit rates. This avoids a redistributable packet-driver dependency and lets a normal FancyDashboard Windows installation start without Npcap.

The IP Helper table does not expose per-flow byte counters, so Windows connection entries intentionally report `bytes: 0`; aggregate upload/download rates remain real. MapCN does not fabricate per-connection transfer totals.

### Linux and macOS

The Rust host uses libpcap for connection discovery and packet-size accounting. Packet-capture permissions are controlled by the operating system/distribution.

### GeoIP

When `GeoLite2-City.mmdb` is present, destination IPs are enriched locally with country/city coordinates using `maxminddb`. Missing GeoIP data is treated as an optional capability, not a monitoring failure.

## Troubleshooting

### Network monitor cannot start

The widget displays the native host error returned by the platform backend. On Linux/macOS, verify libpcap is installed and the process has the required capture permissions. Windows does not require Npcap.

### Connections appear but the map has no geographic lines

Install `GeoLite2-City.mmdb` as documented in [PREREQUISITES.md](./PREREQUISITES.md). Telemetry and connection counts continue to work without it.

### No connections appearing

- Confirm monitoring is running (green/live indicator).
- Generate normal internet traffic and retry.
- Remember that the Windows backend currently visualizes active **TCP** remote destinations; aggregate bandwidth still includes operating-system network traffic.

## Performance

- Snapshots are emitted every 500 ms.
- The host bounds the visible connection list to 100 entries.
- GeoIP results are cached for the session instead of reopening/decoding the same destination repeatedly.
- Stale connection state is removed automatically.

## License

Part of FancyDashboard — see the repository license.
