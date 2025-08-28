import React from "react";

/**
 * TechniqueFrame.jsx (JS-only)
 * - Draws top-down stick figures for two fighters (blue defender, red attacker)
 * - Supports overlays: arrow, loop, chevrons (pressure), label, pin, grip
 * - Expects frame JSON with:
 *   {
 *     mat: { size: [W,H] },
 *     fighters: { red: { keypoints:{} }, blue: { keypoints:{} } },
 *     overlays: [ ... ]
 *   }
 */

const RED = "#E53935";
const BLUE = "#1E88E5";
const STROKE = 6;
const JOINT = 6;

function line(p1, p2, color, key) {
  if (!p1 || !p2) return null;
  return (
    <line
      key={key}
      x1={p1[0]}
      y1={p1[1]}
      x2={p2[0]}
      y2={p2[1]}
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function joint(p, color, key) {
  if (!p) return null;
  return <circle key={key} cx={p[0]} cy={p[1]} r={JOINT} fill={color} />;
}

/** Safely resolve a point:
 * - ["x","y"] array → use directly
 * - "red.r_knee" or "blue.head" → look up from fighters map
 * - raw key name like "r_knee" → tries red first, then blue
 */
function resolvePt(ref, fighters) {
  if (Array.isArray(ref)) return ref;
  if (typeof ref !== "string") return null;

  if (ref.includes(".")) {
    const [who, kp] = ref.split(".");
    const f = fighters[who];
    return f && f.keypoints ? f.keypoints[kp] || null : null;
  }
  // bare key name: prefer red, fallback blue
  return (fighters.red.keypoints[ref] || fighters.blue.keypoints[ref] || null);
}

function drawSkeleton(kp, color) {
  const s = [];
  const L = (a, b) => line(kp[a], kp[b], color, `${a}-${b}`);

  // torso “T”: head→neck→shoulders; shoulders→hips; hips→knees→ankles; shoulders→elbows→wrists
  s.push(L("head", "neck"));
  s.push(L("neck", "l_shoulder"));
  s.push(L("neck", "r_shoulder"));
  s.push(L("l_shoulder", "l_elbow"));
  s.push(L("l_elbow", "l_wrist"));
  s.push(L("r_shoulder", "r_elbow"));
  s.push(L("r_elbow", "r_wrist"));
  s.push(L("l_shoulder", "l_hip"));
  s.push(L("r_shoulder", "r_hip"));
  s.push(L("l_hip", "r_hip"));
  s.push(L("l_hip", "l_knee"));
  s.push(L("l_knee", "l_ankle"));
  s.push(L("r_hip", "r_knee"));
  s.push(L("r_knee", "r_ankle"));

  // joints
  Object.entries(kp || {}).forEach(([k, v]) => {
    if (Array.isArray(v)) s.push(joint(v, color, `j-${k}`));
  });

  return s;
}

/** Arrow overlay */
function Arrow({ from, to, color = "#616161", label }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  const hx = x2 - ux * 12,
    hy = y2 - uy * 12;

  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={4} />
      <polygon
        points={`${x2},${y2} ${hx - uy * 6},${hy + ux * 6} ${hx + uy * 6},${hy - ux * 6}`}
        fill={color}
      />
      {label ? (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          fontSize={14}
          fill={color}
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </>
  );
}

/** Loop overlay (wrap path): path is array of refs or points */
function Loop({ path = [], color = "#616161", label, fighters }) {
  const points = path
    .map((ref) => resolvePt(ref, fighters))
    .filter(Boolean)
    .map((p) => `${p[0]},${p[1]}`)
    .join(" ");

  if (!points) return null;

  const first = resolvePt(path[0], fighters);
  return (
    <>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray="6 6"
      />
      {first && label ? (
        <text x={first[0]} y={first[1] - 10} fontSize={13} fill={color}>
          {label}
        </text>
      ) : null}
    </>
  );
}

/** Chevrons (pressure indicator): draws small V-shapes from a point in a direction */
function Chevrons({ at, dir = [0, 1], count = 3, color = "#616161", label }) {
  const [x, y] = at;
  const [dx, dy] = dir;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;

  const elems = [];
  const step = 16;

  for (let i = 0; i < count; i++) {
    const cx = x + ux * (i + 1) * step;
    const cy = y + uy * (i + 1) * step;
    const left = [cx - uy * 6, cy + ux * 6];
    const right = [cx + uy * 6, cy - ux * 6];
    elems.push(
      <polyline
        key={`chv-${i}`}
        points={`${left[0]},${left[1]} ${cx},${cy} ${right[0]},${right[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    );
  }

  return (
    <>
      {elems}
      {label ? (
        <text x={x + ux * (count + 0.5) * step} y={y + uy * (count + 0.5) * step - 8} fontSize={13} fill={color}>
          {label}
        </text>
      ) : null}
    </>
  );
}

/** Small label text at a point */
function Label({ at, text, color = "#616161" }) {
  const [x, y] = at;
  return (
    <text x={x} y={y - 10} fontSize={13} fill={color}>
      {text}
    </text>
  );
}

/** Pin icon at a point (simple X) */
function Pin({ at, color = "#616161", label }) {
  const [x, y] = at;
  return (
    <>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke={color} strokeWidth={3} />
      <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke={color} strokeWidth={3} />
      {label ? (
        <text x={x + 10} y={y + 4} fontSize={12} fill={color}>
          {label}
        </text>
      ) : null}
    </>
  );
}

/** Grip icon between two points (dashed line + small circles) */
function Grip({ a, b, color = "#616161", label }) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={3}
        strokeDasharray="4 4"
      />
      <circle cx={x1} cy={y1} r={4} fill={color} />
      <circle cx={x2} cy={y2} r={4} fill={color} />
      {label ? (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} fontSize={12} fill={color} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </>
  );
}

export default function TechniqueFrame({ frame }) {
  const { mat, fighters, overlays = [] } = frame;
  const [W, H] = mat.size;

  const overlayElems = [];
  overlays.forEach((o, idx) => {
    if (!o || !o.type) return;
    if (o.type === "arrow") {
      const from = resolvePt(o.from, fighters);
      const to = resolvePt(o.to, fighters);
      if (from && to) {
        overlayElems.push(
          <Arrow key={`arr-${idx}`} from={from} to={to} color={o.color || "#616161"} label={o.label} />
        );
      }
    } else if (o.type === "loop") {
      overlayElems.push(
        <Loop
          key={`loop-${idx}`}
          path={o.path || []}
          color={o.color || "#616161"}
          label={o.label}
          fighters={fighters}
        />
      );
    } else if (o.type === "chevrons" || o.type === "pressure") {
      const at = resolvePt(o.at, fighters);
      if (at) {
        overlayElems.push(
          <Chevrons
            key={`chv-${idx}`}
            at={at}
            dir={Array.isArray(o.dir) ? o.dir : [0, 1]}
            count={o.count || 3}
            color={o.color || "#616161"}
            label={o.label}
          />
        );
      }
    } else if (o.type === "label") {
      const at = resolvePt(o.at, fighters);
      if (at && o.text) {
        overlayElems.push(<Label key={`lbl-${idx}`} at={at} text={o.text} color={o.color || "#616161"} />);
      }
    } else if (o.type === "pin") {
      const at = resolvePt(o.at, fighters);
      if (at) {
        overlayElems.push(<Pin key={`pin-${idx}`} at={at} color={o.color || "#616161"} label={o.label} />);
      }
    } else if (o.type === "grip") {
      const a = resolvePt(o.a, fighters);
      const b = resolvePt(o.b, fighters);
      if (a && b) {
        overlayElems.push(<Grip key={`grp-${idx}`} a={a} b={b} color={o.color || "#616161"} label={o.label} />);
      }
    }
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      style={{ background: "#fafafa", borderRadius: 8 }}
    >
      {/* Draw defender first, then attacker so attacker sits “on top” */}
      {drawSkeleton(fighters.blue?.keypoints || {}, BLUE)}
      {drawSkeleton(fighters.red?.keypoints || {}, RED)}
      {overlayElems}
    </svg>
  );
}
