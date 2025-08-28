import React, { useState, useEffect } from "react";
import TechniqueFrame from "./TechniqueFrame";

// adjust these imports to match the real relative path
import f1 from "./data/1.json";
import f2 from "./data/2.json";
import f3 from "./data/3.json";

export default function FramePlayerInline() {
  const frames = [f1, f2, f3];
  const total = frames.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % total);
    }, 500); // 500ms per frame ≈ 2fps
    return () => clearInterval(interval);
  }, [playing, total]);

  const frame = frames[idx];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setIdx(i => (i - 1 + total) % total)}>◀︎ Prev</button>
        <button onClick={() => setPlaying(p => !p)}>{playing ? "Pause" : "Play"}</button>
        <button onClick={() => setIdx(i => (i + 1) % total)}>Next ▶︎</button>
        <span>Frame {idx + 1} / {total}</span>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
        <TechniqueFrame frame={frame} />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {frames.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              background: i === idx ? "#e3f2fd" : "#f5f5f5"
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
