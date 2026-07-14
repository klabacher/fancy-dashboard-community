# MapCN - Network Telemetry Suite

Multi-widget network telemetry with compact status, 2D map, and 3D globe.

## 🎯 Widgets

- **Compact Widget**: Resizable telemetry card (1x1/2x1/2x2)
- **2D Map Widget**: Lite world map with neon connection lines
- **3D Globe Widget**: Rotating globe with animated arcs
- **Live Telemetry**: Download/upload speed, packet totals, online/offline, last seen

## 📋 Requirements

See [src/modules/mapcn/PREREQUISITES.md](src/modules/mapcn/PREREQUISITES.md).

## 🚀 Usage

1. Add a MapCN widget from the module list.
2. Click **Start** to enable capture.
3. Open the widget settings overlay to customize it.

## 🔧 Configuration

Each widget has its own configuration overlay (per-widget).

## 🛡️ Security & Privacy

- **Local Processing**: All packet capture and processing happens locally
- **No Data Upload**: Network data is never sent to external servers
- **Memory Safe**: Old connections are automatically cleared (60s retention)
- **Limited Scope**: Only captures headers, not payload data

## ⚠️ Troubleshooting

### "Failed to open capture device"

- **Cause**: Missing administrator privileges
- **Solution**: Run the application as administrator

### "No network device found"

- **Cause**: Npcap (Windows) or libpcap not installed
- **Solution**: Install the required packet capture library

### "GeoIP database not found"

- **Cause**: GeoLite2-City.mmdb not in the expected location
- **Solution**: Download and place the database file as described above

### No connections appearing

- **Check**: Ensure packet capture has started (green indicator)
- **Check**: Verify you have active internet connections
- **Check**: Try stopping and restarting the capture

## 🏗️ Architecture

### Rust Backend

- `network_sniffer.rs`: Packet capture using pcap crate
- Event streaming via Tauri IPC (500ms batches)
- GeoIP lookup using maxminddb

### React Frontend

- `api.ts`: Bridge integration for Tauri commands
- `useNetworkSniffing.ts`: Event subscription and state management
- `useMapCNStore.ts`: Zustand store for connections and history
- Widgets: MapCNCompactWidget, MapCNMap2DWidget, MapCNGlobeWidget

## 📊 Performance

- **Batch Processing**: Events emitted every 500ms to prevent UI lag
- **Connection Limit**: Shows top 100 connections to maintain performance
- **History Retention**: Keeps last 60 seconds of speed data
- **Automatic Cleanup**: Removes stale connections (>60s old)

## 🔮 Future Enhancements

- [ ] Advanced Rust telemetry (per-connection packet in/out)
- [ ] Hover tooltips with live throughput deltas
- [ ] Historical connection playback
- [ ] Connection labeling and service heuristics

## 📝 License

Part of FancyDashboard - see main project license.
