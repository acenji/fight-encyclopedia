import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

const RED = "#E53935";
const BLUE = "#1E88E5";

// ---------- vector helpers ----------
const v3 = (x=0,y=0,z=0)=>[x,y,z];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const len=(a)=>Math.hypot(a[0],a[1],a[2])||1;
const norm=(a)=>mul(a,1/len(a));
const mid=(a,b)=>mul(add(a,b),0.5);
const to3=(p)=>Array.isArray(p) ? (p.length===3?p:[p[0],p[1],0]) : [0,0,0];

// map 2D frame coords [x,y] (pixels) into 3D space centered at origin:
// X := x - W/2, Z := -(y - H/2), Y := provided z (or slight lift)
function mapKP(kp, W, H, liftY=0) {
  const out = {};
  Object.entries(kp||{}).forEach(([k,v])=>{
    const p = to3(v);
    const X = p[0] - W/2;
    const Y = p[2] + liftY;
    const Z = -(p[1] - H/2);
    out[k] = [X,Y,Z];
  });
  return out;
}

// build a box by endpoints & sizes
function Box({pos=[0,0,0], size=[10,10,10], color="#999", opacity=1, transparent=false}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size}/>
      <meshStandardMaterial color={color} opacity={opacity} transparent={transparent}/>
    </mesh>
  );
}

// Cylinder “capsule” bone between two points
function Bone({a,b,color="#fff", radius=3}) {
  const A = to3(a), B = to3(b);
  const d = sub(B,A);
  const L = len(d);
  const m = mid(A,B);

  // rotate cylinder (Y-up) to vector d via quaternion from [0,1,0] -> d̂
  const v = norm(d);
  const axis = [ v[2], 0, -v[0] ];          // cross([0,1,0], v)
  const dot  = v[1];                        // dot([0,1,0], v)
  const angle = Math.acos(Math.min(1,Math.max(-1,dot)));
  const axisLen = len(axis);
  const R = axisLen > 1e-6 ? axis.map(c=>c/axisLen) : [1,0,0];
  const rot = [ R[0]*angle, R[1]*angle, R[2]*angle ];

  return (
    <group position={m}>
      <mesh rotation={rot}>
        <cylinderGeometry args={[radius, radius, L, 14]} />
        <meshStandardMaterial color={color}/>
      </mesh>
    </group>
  );
}

// Spherical joint
function Joint({p, color="#fff", r=5}) {
  const P = to3(p);
  return (
    <mesh position={P}>
      <sphereGeometry args={[r, 24, 24]} />
      <meshStandardMaterial color={color}/>
    </mesh>
  );
}

// Compute torso & pelvis proxy boxes from shoulders/hips
function torsoPelvisFromKP(K, torsoDepth=18, pelvisDepth=18, opacity=0.25, color="#ccc") {
  const ls=K.l_shoulder, rs=K.r_shoulder, lh=K.l_hip, rh=K.r_hip;
  if(!ls||!rs||!lh||!rh) return null;

  const shoulderMid = mid(ls, rs);
  const hipMid = mid(lh, rh);
  const spine = sub(shoulderMid, hipMid);
  const torsoLen = len(spine);
  const shoulderSpan = len(sub(ls, rs));
  const hipSpan = len(sub(lh, rh));

  // Torso box centered between shoulder & hip mids
  const torsoPos = mid(shoulderMid, hipMid);
  const torsoSize = [Math.max(shoulderSpan*0.9, hipSpan*0.9), Math.max(torsoLen, 20), torsoDepth];

  // Pelvis box centered at hipMid (slightly smaller)
  const pelvisPos = hipMid;
  const pelvisSize = [hipSpan*0.9, Math.max(torsoLen*0.3, 12), pelvisDepth];

  return (
    <>
      <Box pos={torsoPos} size={torsoSize} color={color} opacity={opacity} transparent/>
      <Box pos={pelvisPos} size={pelvisSize} color={color} opacity={opacity} transparent/>
    </>
  );
}

// Contact resolution (very simple): snap attacker keypoint onto defender torso top face
function applyContacts(mapped, contacts) {
  if(!contacts) return mapped;
  const out = JSON.parse(JSON.stringify(mapped));

  contacts.forEach(c=>{
    // c.type: "pinOnTorsoTop" | "chestToChest"
    // c.a: "red.r_knee" etc., c.b: "blue" (defender torso)
    if(c.type === "pinOnTorsoTop") {
      const [whoA, kpA] = c.a.split(".");
      const A = out[whoA]?.keypoints?.[kpA];
      const blue = out.blue?.keypoints;
      const ls=blue?.l_shoulder, rs=blue?.r_shoulder, lh=blue?.l_hip, rh=blue?.r_hip;
      if(A && ls && rs && lh && rh) {
        const shoulderMid = mid(ls, rs);
        const hipMid = mid(lh, rh);
        const torsoTopY = Math.max(shoulderMid[1], hipMid[1]) + 6; // +6 small clearance
        out[whoA].keypoints[kpA] = [A[0], torsoTopY, A[2]];
      }
    }
    if(c.type === "chestToChest") {
      // move red chest (shoulderMid) slightly above blue chest
      const red = out.red?.keypoints, blue = out.blue?.keypoints;
      if(red && blue) {
        const rChest = mid(red.l_shoulder, red.r_shoulder);
        const bChest = mid(blue.l_shoulder, blue.r_shoulder);
        const lift = 10; // separation so meshes are visible but overlapping
        const delta = sub(bChest, rChest);
        // translate all red keypoints toward blue chest, then lift
        Object.keys(red).forEach(k=>{
          red[k] = add(red[k], [delta[0], 0, delta[2]]);
          red[k] = [red[k][0], bChest[1] + lift, red[k][2]];
        });
      }
    }
  });

  return out;
}

function FighterRig({ K, color="#fff", jointR=5, boneR=3, showBoxes=true, translucent=false }) {
  const alpha = translucent ? 0.5 : 1;

  const L = (a,b,k)=> (K[a]&&K[b]) ? <Bone key={k} a={K[a]} b={K[b]} color={color} radius={boneR}/> : null;

  return (
    <group>
      {/* Torso & pelvis proxies */}
      {showBoxes && torsoPelvisFromKP(K, 20, 18, translucent?0.18:0.28, color)}

      {/* Bones */}
      {L("head","neck","b-h-n")}
      {L("neck","l_shoulder","b-n-ls")}
      {L("neck","r_shoulder","b-n-rs")}
      {L("l_shoulder","l_elbow","b-ls-le")}
      {L("l_elbow","l_wrist","b-le-lw")}
      {L("r_shoulder","r_elbow","b-rs-re")}
      {L("r_elbow","r_wrist","b-re-rw")}
      {L("l_shoulder","l_hip","b-ls-lh")}
      {L("r_shoulder","r_hip","b-rs-rh")}
      {L("l_hip","r_hip","b-lh-rh")}
      {L("l_hip","l_knee","b-lh-lk")}
      {L("l_knee","l_ankle","b-lk-la")}
      {L("r_hip","r_knee","b-rh-rk")}
      {L("r_knee","r_ankle","b-rk-ra")}

      {/* Joints */}
      {Object.entries(K).map(([k,p])=> <Joint key={`j-${k}`} p={p} color={color} r={jointR}/>)}
    </group>
  );
}

export default function TechniqueFrame3DPro({ frame }) {
  const { mat, fighters, overlays = [], contacts = [] } = frame;
  const W = mat?.size?.[0] ?? 1000;
  const H = mat?.size?.[1] ?? 600;

  // map both to scene coords (blue near ground; red slightly lifted so depth reads)
  const blueK = mapKP(fighters?.blue?.keypoints || {}, W, H, 0);
  const redK  = mapKP(fighters?.red?.keypoints  || {}, W, H, 6);

  // apply simple contact constraints (e.g., knee on torso top, chest-to-chest)
  const mapped = applyContacts({ red:{keypoints:redK}, blue:{keypoints:blueK} }, contacts);

  return (
    <div style={{ width: "100%", height: 560, borderRadius: 8, overflow: "hidden", background: "#0f0f0f" }}>
      <Canvas camera={{ position: [0, 160, 360], fov: 40 }}>
        <ambientLight intensity={0.6}/>
        <directionalLight position={[150,200,120]} intensity={0.8}/>
        <directionalLight position={[-120,120,-120]} intensity={0.4}/>

        <Grid args={[40,40]} cellSize={20} sectionColor="#2e2e2e" cellColor="#232323" />

        {/* Draw defender first, translucent, then attacker on top */}
        <FighterRig K={mapped.blue.keypoints} color={BLUE} translucent jointR={4} boneR={2.5}/>
        <FighterRig K={mapped.red.keypoints}  color={RED} jointR={5} boneR={3}/>

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
