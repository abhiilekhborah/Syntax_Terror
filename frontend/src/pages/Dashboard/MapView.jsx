import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; 
import styles from './MapView.module.css';

const API = 'http://127.0.0.1:5000';

const TYPE_COLOR = {
  pothole:      '#ef4444',
  garbage:      '#f59e0b',
  streetlight:  '#3b82f6',
  waterlogging: '#06b6d4',
  open_drain:   '#8b5cf6',
  water_supply: '#10b981',
};

export default function MapView({ onNavigate = () => {} }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersLayer = useRef(null);
  const heatLayer = useRef(null);
  
  const [reports, setReports] = useState([]);
  const [currentLayer, setCurrentLayer] = useState('markers'); // markers | heatmap | both
  const [addressText, setAddressText] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [stats, setStats] = useState({ total: '—', open: '—', resolved: '—' });

  const stateRef = useRef({
    userLat: 12.9716, 
    userLng: 77.5946,
    centerLat: 12.9716,
    centerLng: 77.5946,
    fetchedAddress: '',
    geoTimer: null,
    addrTimer: null
  });

  // Initialization
  useEffect(() => {
    if (mapRef.current) return; // already initialized

    navigator.geolocation.getCurrentPosition(
      p => initMap(p.coords.latitude, p.coords.longitude),
      () => initMap(12.9716, 77.5946)
    );

    function initMap(lat, lng) {
      if (mapRef.current) return;
      
      stateRef.current.userLat = lat;
      stateRef.current.userLng = lng;
      stateRef.current.centerLat = lat;
      stateRef.current.centerLng = lng;

      const map = L.map(mapContainer.current, { zoomControl: false }).setView([lat, lng], 15);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const userIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.25)"></div>`,
        className: '', iconSize: [12,12], iconAnchor: [6,6]
      });
      L.marker([lat, lng], { icon: userIcon }).addTo(map)
        .bindPopup('<div class="' + styles.popupTag + '">You</div><div class="' + styles.popupTitle + '">Your location</div>');

      map.on('moveend', () => {
        const c = map.getCenter();
        stateRef.current.centerLat = c.lat;
        stateRef.current.centerLng = c.lng;
        reverseGeocode(c.lat, c.lng);
      });

      loadReports();
      reverseGeocode(lat, lng);
      
      // Assign L specifically to window so leaflet.heat can find it.
      // Usually importing * as L is fine, but sometimes leaflet.heat uses window.L.
      if (typeof window !== 'undefined' && !window.L) {
        window.L = L;
      }
    }
    
    const interval = setInterval(() => {
      if (mapRef.current) loadReports();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  async function loadReports() {
    try {
      const res = await fetch(`${API}/reports`);
      const data = await res.json();
      setReports(data);
      updateStats(data);
    } catch(e) {
      setReports([]);
      updateStats([]);
    }
  }

  function updateStats(data) {
    setStats({
      total: data.length,
      open: data.filter(r => r.status === 'open').length,
      resolved: data.filter(r => r.status === 'resolved').length
    });
  }

  // Draw layers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (markersLayer.current) { if (map.hasLayer(markersLayer.current)) map.removeLayer(markersLayer.current); }
    if (heatLayer.current)    { if (map.hasLayer(heatLayer.current))    map.removeLayer(heatLayer.current); }

    markersLayer.current = L.layerGroup();
    const heatPts = [];

    reports.forEach(r => {
      const color = TYPE_COLOR[r.issue_type] || '#f97316';
      const icon = L.divIcon({
        html: `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.4);box-shadow:0 1px 6px ${color}99"></div>`,
        className: '', iconSize: [11,11], iconAnchor: [5,5]
      });

      const statusClass = r.status === 'open' ? styles.sOpen : r.status === 'resolved' ? styles.sResolved : styles.sProgress;
      const statusLabel = r.status === 'open' ? 'Open' : r.status === 'resolved' ? 'Resolved' : 'In Progress';

      L.marker([r.latitude, r.longitude], { icon })
        .bindPopup(`
          <div class="${styles.popupTag}">${(r.issue_type || 'issue').replace('_',' ')}</div>
          <div class="${styles.popupTitle}">${r.description || r.address || 'No description'}</div>
          <div class="${styles.popupRow}">
            <span class="${styles.popupMeta}">#${r.id} &nbsp;·&nbsp; ${r.address ? r.address.split(',')[0] : '—'}</span>
            <span class="${styles.popupStatus} ${statusClass}">${statusLabel}</span>
          </div>
        `)
        .addTo(markersLayer.current);

      heatPts.push([r.latitude, r.longitude, 0.7]);
    });

    if (L.heatLayer) {
      heatLayer.current = L.heatLayer(heatPts, {
        radius: 32, blur: 22, maxZoom: 17,
        gradient: { 0.0: '#1d4ed8', 0.4: '#10b981', 0.7: '#f59e0b', 1.0: '#ef4444' }
      });
    }

    applyLayer();
  }, [reports, currentLayer]);

  function applyLayer() {
    const map = mapRef.current;
    if (!map) return;
    if (markersLayer.current && map.hasLayer(markersLayer.current)) map.removeLayer(markersLayer.current);
    if (heatLayer.current && map.hasLayer(heatLayer.current))    map.removeLayer(heatLayer.current);
    
    if (currentLayer === 'markers' || currentLayer === 'both') {
      if (markersLayer.current) markersLayer.current.addTo(map);
    }
    if (currentLayer === 'heatmap' || currentLayer === 'both') {
      if (heatLayer.current) heatLayer.current.addTo(map);
    }
  }

  function reverseGeocode(lat, lng) {
    clearTimeout(stateRef.current.geoTimer);
    stateRef.current.geoTimer = setTimeout(async () => {
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        if (data.address) {
          const parts = [data.address.road, data.address.suburb, data.address.city || data.address.town].filter(Boolean);
          stateRef.current.fetchedAddress = data.display_name;
          showAddressBarText(parts.join(', ') || data.display_name.split(',').slice(0,2).join(','));
        }
      } catch(e) { 
        stateRef.current.fetchedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`; 
      }
    }, 500);
  }

  function showAddressBarText(text) {
    setAddressText(text);
    setShowAddress(true);
    clearTimeout(stateRef.current.addrTimer);
    stateRef.current.addrTimer = setTimeout(() => setShowAddress(false), 4000);
  }

  function locateMe() {
    const map = mapRef.current;
    if (map && stateRef.current.userLat) {
      map.flyTo([stateRef.current.userLat, stateRef.current.userLng], 15, { duration: 1 });
    }
  }

  function goToReport() {
    const lat  = stateRef.current.centerLat || stateRef.current.userLat;
    const lng  = stateRef.current.centerLng || stateRef.current.userLng;
    const addr = encodeURIComponent(stateRef.current.fetchedAddress || `${lat},${lng}`);
    window.history.pushState(null, '', `/?lat=${lat}&lng=${lng}&address=${addr}`);
    onNavigate('report');
  }

  return (
    <div className={styles.mapRoot}>
      <div className={styles.topbar}>
        <div className={styles.layerControls}>
          <button 
            className={`${styles.layerBtn} ${currentLayer === 'markers' ? styles.active : ''}`}
            onClick={() => setCurrentLayer('markers')}
          >
            Markers
          </button>
          <button 
            className={`${styles.layerBtn} ${currentLayer === 'heatmap' ? styles.active : ''}`}
            onClick={() => setCurrentLayer('heatmap')}
          >
            Heatmap
          </button>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            <span>LIVE</span>
          </div>
        </div>
      </div>

      <div className={styles.mapWrap}>
        <div ref={mapContainer} className={styles.mapContainer}></div>

        {/* Stats */}
        <div className={styles.statsPanel}>
          <div className={styles.statCard}>
            <div className={styles.statBar} style={{ background: 'var(--accent)' }}></div>
            <div>
              <div className={styles.statNum} style={{ color: 'var(--accent)' }}>{stats.total}</div>
              <div className={styles.statLbl}>Reports</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statBar} style={{ background: 'var(--danger)' }}></div>
            <div>
              <div className={styles.statNum} style={{ color: 'var(--danger)' }}>{stats.open}</div>
              <div className={styles.statLbl}>Open</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statBar} style={{ background: 'var(--accent3)' }}></div>
            <div>
              <div className={styles.statNum} style={{ color: 'var(--accent3)' }}>{stats.resolved}</div>
              <div className={styles.statLbl}>Resolved</div>
            </div>
          </div>
        </div>

        {/* Heatmap legend */}
        <div className={`${styles.heatLegend} ${currentLayer !== 'markers' ? styles.show : ''}`}>
          <div className={styles.heatLegendTitle}>Issue Density</div>
          <div className={styles.heatGradient}></div>
          <div className={styles.heatLabels}><span>Low</span><span>High</span></div>
        </div>

        {/* Address bar */}
        <div className={`${styles.addressBar} ${showAddress ? styles.show : ''}`}>
          <strong>{addressText}</strong>
        </div>

        {/* Locate */}
        <button className={styles.locateBtn} onClick={locateMe} title="My location">&#8982;</button>

        {/* Report */}
        <button className={styles.reportBtn} onClick={goToReport}>
          <span className={styles.reportBtnIcon}>+</span>
          Report Issue Here
        </button>
      </div>
    </div>
  );
}