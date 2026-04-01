import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ClickHandler({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length >= 2) return [e.latlng];
        return [...prev, e.latlng];
      });
    },
  });
  return null;
}

function App() {
  const [points, setPoints] = useState([]);
  const [route, setRoute] = useState([]);
  const [eta, setEta] = useState(null);
  const [color, setColor] = useState("blue");

  const getRoute = async (p1, p2) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/route?lat1=${p1.lat}&lng1=${p1.lng}&lat2=${p2.lat}&lng2=${p2.lng}`
      );

      const data = await res.json();

      const latlngs = data.route.map((c) => [c[1], c[0]]);
      setRoute(latlngs);
      setColor(data.color);
      setEta(data.eta);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (points.length === 2) {
      getRoute(points[0], points[1]);
    }
  }, [points]);

  const reset = () => {
    setPoints([]);
    setRoute([]);
    setEta(null);
    setColor("blue");
  };

  return (
    <div style={{ fontFamily: "Arial" }}>
      {/* 🔝 HEADER */}
      <div
        style={{
          padding: "15px",
          background: "#111",
          color: "white",
          fontSize: "20px",
        }}
      >
        🚀 Smart Traffic AI
      </div>

      {/* 📊 INFO PANEL */}
      <div
        style={{
          padding: "10px",
          background: "#f5f5f5",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          ⏱ ETA: {eta ? `${eta} min` : "—"}
        </div>

        <div>
          🚦 Traffic:{" "}
          <span style={{ color: color, fontWeight: "bold" }}>
            {color.toUpperCase()}
          </span>
        </div>

        <button onClick={reset}>Reset</button>
      </div>

      {/* 🗺 MAP */}
      <MapContainer
        center={[52.2297, 21.0122]}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ClickHandler setPoints={setPoints} />

        {points.map((p, i) => (
          <Marker key={i} position={p} />
        ))}

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: color, weight: 6 }}
          />
        )}
      </MapContainer>

      {/* 📌 INSTRUCTION */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        👉 Click on the map to choose start and destination
      </div>
    </div>
  );
}

export default App;