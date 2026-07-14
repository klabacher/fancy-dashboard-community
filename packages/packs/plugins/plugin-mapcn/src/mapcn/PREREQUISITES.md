# MapCN Prerequisites

## ✅ Required

### Windows

- Run as **Administrator** (packet capture permission)
- **Npcap** installed: [Npcap](https://npcap.com)
  - Enable **WinPcap API-compatible mode**

### Linux

- Run with **sudo/root** permissions for packet capture
- **libpcap** installed (`libpcap-dev` or equivalent)

### macOS

- Run with **sudo/root** permissions for packet capture
- **libpcap** is preinstalled

### GeoIP Database

- Download the free GeoLite2 City database from MaxMind
- Place `GeoLite2-City.mmdb` in:
  - `<app_data_dir>/GeoLite2-City.mmdb` (recommended)
  - `<app_resources>/GeoLite2-City.mmdb`

**App data directory locations**:

- Windows: `%APPDATA%/fancydashboard/`
- Linux: `~/.local/share/fancydashboard/`
- macOS: `~/Library/Application Support/fancydashboard/`

## ✅ Runtime Checks (Performed by the widget)

- Detects missing GeoIP database
- Detects missing network capture device
- Reports issues in a Toast notification

## ✅ Optional (For future 3D/2D advanced rendering)

- `react-globe.gl` + `three`
- `react-map-gl` + `deck.gl`

These are **not required** for the current lite renderer.
