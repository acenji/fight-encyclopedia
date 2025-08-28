import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";

/** Colors */
const RED = "#E53935";
const BLUE = "#1E88E5";

/** Turn [x,y] or [x,y,z] into [x,y,z] */
function to3(p) {
  if (!Array.isArray(p)) return [0, 0, 0];
  if (p.length === 3) return p;
  if (p.length === 2) return [p[0], p[1], 0];
  return [0, 0, 0];
}

/** Get keypoint by ref like "red.r_knee" / "blue.head" / "r_knee" (pref red) or direct [x,y,z] */
function getPt(ref, fighters) {
  if (Array.isArray(ref)) return to3(ref);
  if (typeof ref !== "string") return null;
  if (ref.includes(".")) {
    const [who, kp] = ref.split(".");
    const f = (fighters || {})[who] || {};
    const p = (f.keypoints || {})[kp];
    return p ? to3(p) : null;
  }
  // bare key (try red then blue)
  const pr = fighters?.red?.keypoints?.[ref];
  if (pr) return to3(pr);
  const pb = fighters?.blue?.keypoints?.[ref];
  if (pb) return to3(pb);
  return null;
}

/** Cylinder between two points */
function Bone({ a, b, color = "white", radius = 3 }) {
  const pa = to3(a), pb = to3(b);
  // compute midpoint, length, rotation
  const dx = pb[0] - pa[0], dy = pb[1] - pa[1], dz = pb[2] - pa[2];
  const len = Math.hypot(dx, dy, dz) || 0.0001;
  const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2];

  // Default cylinder oriented along Y; we rotate it to match vector pa->pb.
  // Build a quaternion that rotates [0,1,0] to the unit vector v:
  const v = [dx / len, dy / len, dz / len];
  // cross(0,1,0, v) = [v_z * 1 - 0, 0 - v_x * 1, 0] = [v[2], 0, -v[0]]
  const axis = [v[2], 0, -v[0]];
  const axisLen = Math.hypot(axis[0], axis[1], axis[2]) || 1;
  const normAxis = [axis[0] / axisLen, axis[1] / axisLen, axis[2] / axisLen];
  const dot = 0 * v[0] + 1 * v[1] + 0 * v[2]; // dot([0,1,0], v) = v.y
  const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

  return (
    <group position={mid}>
      <mesh rotation={[normAxis[0] * angle, normAxis[1] * angle, normAxis[2] * angle]}>
        <cylinderGeometry args={[radius, radius, len, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Joint({ p, color = "white", r = 6 }) {
  const pt = to3(p);
  return (
    <mesh position={pt}>
      <sphereGeometry args={[r, 24, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/** Draw one fighter skeleton with spheres & bones */
function FighterRig({ kp = {}, color = "white", scale = 1, liftZ = 0 }) {
  // liftZ lets you stack fighters (e.g., blue z=0, red z=10) to avoid exact overlap
  const K = useMemo(() => {
    const out = {};
    Object.entries(kp).forEach(([k, v]) => { out[k] = to3(v).map((n, i) => i === 2 ? n + liftZ : n * scale); });
    return out;
  }, [kp, scale, liftZ]);

  const L = (a, b, key) => (K[a] && K[b] ? <Bone key={key} a={K[a]} b={K[b]} color={color} radius={3} /> : null);

  return (
    <group>
      {/* Bones (roughly the same graph as your 2D) */}
      {L("head", "neck", "b-h-n")}
      {L("neck", "l_shoulder", "b-n-ls")}
      {L("neck", "r_shoulder", "b-n-rs")}
      {L("l_shoulder", "l_elbow", "b-ls-le")}
      {L("l_elbow", "l_wrist", "b-le-lw")}
      {L("r_shoulder", "r_elbow", "b-rs-re")}
      {L("r_elbow", "r_wrist", "b-re-rw")}
      {L("l_shoulder", "l_hip", "b-ls-lh")}
      {L("r_shoulder", "r_hip", "b-rs-rh")}
      {L("l_hip", "r_hip", "b-lh-rh")}
      {L("l_hip", "l_knee", "b-lh-lk")}
      {L("l_knee", "l_ankle", "b-lk-la")}
      {L("r_hip", "r_knee", "b-rh-rk")}
      {L("r_knee", "r_ankle", "b-rk-ra")}

      {/* Joints */}
      {Object.entries(K).map(([k, v]) => <Joint key={`j-${k}`} p={v} color={color} r={5} />)}
    </group>
  );
}

/** Simple 3D arrows for overlays (from→to) */
function Arrow3D({ from, to, color = "#666" }) {
  const a = to3(from), b = to3(to);
  // reuse Bone for the shaft; add a small cone arrowhead
  return (
    <group>
      <Bone a={a} b={b} color={color} radius={1.6} />
      <mesh position={b}>
        <coneGeometry args={[4, 10, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Pressure “chevrons” as a stack of tiny cones along a direction */
function Chevrons3D({ at, dir = [0, 1, 0], count = 3, color = "#666" }) {
  const origin = to3(at);
  const d = to3(dir);
  const len = Math.hypot(d[0], d[1], d[2]) || 1;
  const u = [d[0] / len, d[1] / len, d[2] / len];
  const step = 14;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const p = [origin[0] + u[0] * step * (i + 1), origin[1] + u[1] * step * (i + 1), origin[2] + u[2] * step * (i + 1)];
        return (
          <mesh key={i} position={p}>
            <coneGeometry args={[3, 8, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function TechniqueFrame3D({ frame }) {
  const { mat, fighters, overlays = [] } = frame;
  const W = mat?.size?.[0] ?? 1000;
  const H = mat?.size?.[1] ?? 600;

  // Normalize coordinates into a centered 3D space: x maps to X, y maps to -Z (so “down” is away), Y is height (0 for now)
  // We’ll pre-map keypoints: [x,y] → [ (x - W/2), 0, -(y - H/2) ]
  const mapped = useMemo(() => {
    function mapKP(kp) {
      const out = {};
      Object.entries(kp || {}).forEach(([k, v]) => {
        const p = to3(v);
        const X = p[0] - W / 2;
        const Y = p.length === 3 ? p[2] : 0; // use z as vertical if provided
        const Z = -(p[1] - H / 2);
        out[k] = [X, Y, Z];
      });
      return out;
    }
    return {
      red: { keypoints: mapKP(fighters?.red?.keypoints || {}) },
      blue: { keypoints: mapKP(fighters?.blue?.keypoints || {}) }
    };
  }, [fighters, W, H]);

  // Split overlays we can draw (arrow, chevrons). Loops/labels/pins/grips could be added similarly later.
  const overlayElems = useMemo(() => {
    const elems = [];
    overlays.forEach((o, i) => {
      if (!o || !o.type) return;
      if (o.type === "arrow") {
        const from = getPt(o.from, mapped);
        const to = getPt(o.to, mapped);
        if (from && to) elems.push(<Arrow3D key={`arr-${i}`} from={from} to={to} color={o.color || "#666"} />);
      } else if (o.type === "chevrons" || o.type === "pressure") {
        const at = getPt(o.at, mapped);
        const dir = Array.isArray(o.dir) ? o.dir : [0, 1, 0];
        if (at) elems.push(<Chevrons3D key={`chv-${i}`} at={at} dir={dir} count={o.count || 3} color={o.color || "#666"} />);
      }
    });
    return elems;
  }, [overlays, mapped]);

  return (
    <div style={{ width: "100%", height: 520, borderRadius: 8, overflow: "hidden", background: "#111" }}>
      <Canvas camera={{ position: [0, 140, 340], fov: 40 }}>
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[120, 200, 100]} intensity={0.8} />
        <directionalLight position={[-120, 120, -100]} intensity={0.4} />

        {/* Ground grid */}
        <Grid args={[40, 40]} cellSize={20} sectionColor="#2e2e2e" cellColor="#242424" />

        {/* Fighters (draw blue near ground, red slightly lifted so overlap is visible) */}
        <FighterRig kp={mapped.blue.keypoints} color={BLUE} liftZ={0} />
        <FighterRig kp={mapped.red.keypoints} color={RED} liftZ={6} />

        {/* Overlays */}
        {overlayElems}

        {/* Camera controls */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        {/* Frame label */}
        <Html position={[ -W/2 + 20, 80, -(H/2) + 20 ]}><div style={{ color:'#fff', font: '500 14px sans-serif' }}>3D View</div></Html>
      </Canvas>
    </div>
  );
}
