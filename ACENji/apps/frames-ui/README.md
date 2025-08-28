# Frames UI — ACENji Fight Encyclopedia (Storyboard & 3D Mechanics)

This app is a **viewer** for fight techniques expressed as **JSON frames**.  
Each technique is broken into frames (like animation keyframes).  
Frames describe **two fighters** (Red/Blue) via keypoints + overlays (arrows, pressure, grips), and optional **contacts** (knee on torso, chest-to-chest).  
The UI renders both a **2D debug view** and an **abstract 3D view** (rig of joints/limbs with simple torso/pelvis volumes).

----

## ⚙️ Requirements

- **Node.js**: `20.19.x` (recommended) or `22.12+`
- **npm**: `10+`

> If you don’t want to change your global Node, use a per-project version manager.

### Using nvm (recommended)
```bash
# install nvm if you don't have it yet (macOS/Linux)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh)"

# in the project folder, pin Node 20.19.0
cd acenji/apps/frames-ui
echo "20.19.0" > .nvmrc
nvm install
nvm use
```
----

## 📁 Project Layout (relevant parts). It may change over time
```
<repo-root>/
└─ acenji/
   ├─ apps/
   │  └─ frames-ui/                # Vite React app (this repo)
   │     ├─ index.html
   │     ├─ vite.config.js         # contains @frames alias
   │     ├─ package.json
   │     └─ src/
   │        ├─ main.jsx
   │        ├─ App.jsx             # wires controls + views
   │        ├─ LocalFramePlayer.jsx# simple 2D player (imports JSON directly)
   │        └─ TechniqueFrame3DPro.jsx # abstract 3D renderer (Three.js)
   └─ tools/
      └─ fight-export/
         └─ frames/
            ├─ TechniqueFrame.jsx  # 2D SVG renderer (JS-only)
            └─ data/
               ├─ 1.json
               ├─ 2.json
               └─ 3.json
```
----

## 🧰 Install
```
cd acenji/apps/frames-ui
# make sure you're on Node 20.19 (nvm use)
npm install
```
----

## Install 3D deps (already listed in package.json; run if missing):
```
npm i @react-three/fiber three @react-three/drei
```

----
## ▶️ Run (Dev)
```
cd acenji/apps/frames-ui
npm run dev
```

----

## 🏗️ Build (Prod)
```
cd acenji/apps/frames-ui
npm run build
npm run preview   # optional local preview
```

----

## 🔗 Path Alias
We import JSON frames and shared components with @frames:
vite.config.js
```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@frames': path.resolve(__dirname, '../../tools/fight-export/frames'),
    },
  },
})
```
Use it in code
```
import TechniqueFrame from "@frames/TechniqueFrame.jsx";
import f1 from "@frames/data/1.json";
```

----
## 🧩 Frame Semantics — How to Read a Fight Frame

Each frame JSON describes **two fighters** (Red / Blue) in terms of **body parts (keypoints)**, plus extra data to show motion, pressure, and attachment.  
This section explains what the numbers mean and how they are interpreted.

---

### 1. Fighters and Keypoints
- Always two fighters:  
  - `"red"` = attacker  
  - `"blue"` = defender
- Each fighter has a `"pose"` label (human-readable) and `"keypoints"` (coordinates).

**Example:**
```json
"red": {
  "pose": "side-control-right",
  "keypoints": {
    "head": [560, 280],
    "neck": [540, 300],
    "l_shoulder": [520, 320],
    "r_shoulder": [560, 320],
    "l_elbow": [500, 350],
    "r_elbow": [620, 350],
    "l_wrist": [490, 380],
    "r_wrist": [640, 380],
    "l_hip": [520, 380],
    "r_hip": [560, 380],
    "l_knee": [520, 430],
    "r_knee": [570, 430],
    "l_ankle": [520, 470],
    "r_ankle": [580, 470]
  }
}

----

## 🗂️ Frame JSON Schema (minimal)
Each *.json under acenji/tools/fight-export/frames/data/ represents one frame.
```
{
  "version": "fightframe-0.1",
  "id": "atk-kob-armtriangle-f1",
  "techniqueId": "arm-triangle-choke-from-high-knee-on-belly",
  "frameIndex": 1,
  "fps": 2,
  "durationMs": 500,
  "camera": "top",
  "mat": { "size": [1000, 600] },

  "fighters": {
    "red": {
      "pose": "side-control-right",
      "keypoints": {
        "head": [560, 280],
        "neck": [540, 300],
        "l_shoulder": [520, 320],
        "r_shoulder": [560, 320],
        "l_elbow": [500, 350],
        "r_elbow": [620, 350],
        "l_wrist": [490, 380],
        "r_wrist": [640, 380],
        "l_hip": [520, 380],
        "r_hip": [560, 380],
        "l_knee": [520, 430],
        "r_knee": [570, 430],
        "l_ankle": [520, 470],
        "r_ankle": [580, 470]
      }
    },
    "blue": {
      "pose": "supine-right-shoulder-near",
      "keypoints": {
        "head": [420, 300],
        "neck": [440, 320],
        "l_shoulder": [460, 340],
        "r_shoulder": [420, 340],
        "l_elbow": [490, 370],
        "r_elbow": [430, 370],
        "l_wrist": [510, 400],
        "r_wrist": [430, 400],
        "l_hip": [470, 400],
        "r_hip": [430, 400],
        "l_knee": [470, 460],
        "r_knee": [430, 460],
        "l_ankle": [470, 500],
        "r_ankle": [430, 500]
      }
    }
  },

  "overlays": [
    { "type": "arrow", "from": "red.r_knee", "to": [620, 350], "label": "knee slides up" },
    { "type": "label", "at": "red.r_knee", "text": "KOB entry" },
    { "type": "pin", "at": "blue.r_shoulder", "label": "shoulder line" },
    { "type": "chevrons", "at": "red.l_hip", "dir": [0.2, 0.8], "count": 2, "label": "hip drive" }
  ],

  "contacts": [
    { "type": "pinOnTorsoTop", "a": "red.r_knee", "b": "blue" },
    { "type": "chestToChest",  "a": "red",       "b": "blue" }
  ],

  "hints": [
    "From side control: begin sliding the right knee toward chest/shoulder line to establish high knee-on-belly."
  ]
}
```
Notes
Coordinates are [x, y] in pixels for now (top-down mat).
The 3D view treats them as [x, 0, depth] and centers them in 3D.
You can upgrade to true 3D by using [x, y, z] at any time.
Overlays (visual cues):
arrow — motion direction or action
label — short text near a point
chevrons / pressure — repeated cones indicating pressure direction
pin — “X” marker on a point
grip — dashed line between two points
loop — dashed path (e.g., arm wrapping the neck)
Contacts (physical constraints):
pinOnTorsoTop — snaps a keypoint (e.g., red.r_knee) onto defender torso’s top surface
chestToChest — aligns attacker chest to defender chest with a small lift (visual overlap)

----

### 🖥️ Views
2D (debug)
File: acenji/apps/frames-ui/src/LocalFramePlayer.jsx + @frames/TechniqueFrame.jsx
Renders stick figures + overlays (good for validating JSON quickly).
3D (abstract body mechanics)
File: acenji/apps/frames-ui/src/TechniqueFrame3DPro.jsx
Uses @react-three/fiber + drei:
Joints (spheres), Bones (cylinders)
Torso/Pelvis proxy boxes
Basic contacts (knee on torso, chest alignment)
Orbit camera + lights + ground grid
In App.jsx we show both: the 3D Pro view and the 2D debug view.

### ➕ Add More Frames

- Create 4.json … 10.json in acenji/tools/fight-export/frames/data/.
- Import them where needed (e.g., in App.jsx or LocalFramePlayer.jsx) and push into the frames array:
    ```
    import f4 from "@frames/data/4.json";
    // ...
    const frames = [f1, f2, f3, f4 /* … */];
    ```
- Optionally add contacts to improve physical attachment.

----

## 🧭 Authoring Guide (from language → frames)
Write the step in plain English:
“From side control, slide right knee higher to high knee-on-belly, cross-face to turn head away, feed near arm across neck…”
Pick the key moment (Frame N).
Place keypoints for Red/Blue (head, neck, shoulders, elbows, wrists, hips, knees, ankles).
Add overlays for motion/pressure/grips.
Add contacts to “snap” positions (knee on torso, chest alignment).
Preview in 2D, then 3D; tweak coordinates until it reads clearly.

----

## 🧪 Troubleshooting
Vite alias not found (@frames/...)
→ Check vite.config.js alias and restart npm run dev.
TypeScript errors in JSX
→ Make sure shared renderer is .jsx not .tsx (or add TS deps).
Node version error (Vite requires 20.19+ or 22.12+)
→ Use nvm use in acenji/apps/frames-ui/ with .nvmrc set to 20.19.0.
Nothing renders in 3D
→ Ensure @react-three/fiber three @react-three/drei are installed; check console for import paths.

## 🗺️ Roadmap (next iterations)
True 3D coordinates in frames ([x,y,z]) for depth/height.
Pressure cones and wrap volumes for clearer choke mechanics.
Tweened animation (interpolate between frames for smooth playback).
Schema validation in CI (AJV + frame.schema.json).
Export animated clips (webm/mp4) from frames.
Authoring UI (“pose mode”) for dragging joints and composing overlays visually.

## 📜 License & Placement
All code and data must remain under the acenji/ folder per your licensing rule.
The app lives at: acenji/apps/frames-ui/ and imports frames from acenji/tools/fight-export/frames/.

----

## 🙌 Credits
```
- 3D Libraries: @react-three/fiber, three, @react-three/drei
- Concept & Implementation: ACENji project — Technique as Language → JSON frames → visual mechanics
```

