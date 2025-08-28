import React, { useState } from "react";
import LocalFramePlayer from "./LocalFramePlayer";
import TechniqueFrame3DPro from "./TechniqueFrame3DPro";

// same JSON frames
import f1 from "@frames/data/1.json";
import f2 from "@frames/data/2.json";
import f3 from "@frames/data/3.json";

const frames = [f1, f2, f3];

export default function App() {
  const [idx, setIdx] = useState(0);
  const frame = frames[idx];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, color: "#222" }}>
      <h1>Arm Triangle — High Knee-on-Belly</h1>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setIdx(i => (i - 1 + frames.length) % frames.length)}>◀ Prev</button>
        <span>Frame {idx + 1} / {frames.length}</span>
        <button onClick={() => setIdx(i => (i + 1) % frames.length)}>Next ▶</button>
      </div>

      {/* Show new 3D Pro view */}
      <div style={{ marginBottom: 20 }}>
        <h3>3D Pro View (with torso/contacts)</h3>
        <TechniqueFrame3DPro frame={frame} />
      </div>

      {/* Keep old 2D player for debugging */}
      <div>
        <h3>2D Debug View</h3>
        <LocalFramePlayer />
      </div>
    </div>
  );
}
