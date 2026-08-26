# ⚡ Joel's AR Studio — Enterprise Multi-Client WebAR Platform

An end-to-end, self-contained Web Augmented Reality (WebAR) platform built by **Joel kumar.J**. 

This platform turns physical photographs, wedding albums, memory frames, and marketing materials into interactive AR video experiences directly inside mobile web browsers with **zero external cloud accounts, zero credit cards, and zero app downloads required**.

---

## 👨‍💻 Author & Credits

* **Platform Architect & Creator:** [Joel kumar.J](https://github.com/Joel2528)
* **Core AR Tracking Engine Attribution:** Powered by the open-source [MindAR.js](https://github.com/hiukim/mind-ar-js) engine by Hiukim.

---

## ✨ Key Features

* 📷 **Instant WebAR Scanning:** Point any mobile camera at a registered photograph to stream overlay videos in real-time.
* 🏥 **Figma Healthcare-Inspired Admin Dashboard:** Corporate White & Dark Blue UI with client directory management, frame target toggles, and live AR preview drawer.
* 💾 **Built-in Local Media Engine:** Zero external cloud accounts needed. Videos and targets are stored and streamed directly via Node.js.
* 🔒 **Signed Token Security:** Backend API issues short-lived signed tokens (`GET /api/frames/:id/video`) to prevent unauthorized media streaming.
* 🎥 **Virtual Camera Simulator for PC:** Test AR feature tracking and video overlays on PCs without webcams using canvas stream capture.

---

## 🛠️ Project Architecture

```
joel-ar-studio/
├── examples/
│   └── image-tracking/
│       ├── admin.html       <-- Enterprise Admin Dashboard (Figma Healthcare Theme)
│       ├── brand-ar.html    <-- Branded Mobile WebAR Scanner App (HUD Viewfinder)
│       ├── compile.html     <-- Target Photo Compiler (.jpg -> .mind)
│       └── assets/          <-- Local target models & overlay videos
├── src/
│   └── server.js            <-- Node.js Backend API & Media Server (Port 3000)
├── uploads/                 <-- Local Video & Media Storage Engine
│   └── clients/
│       ├── C001/
│       │   └── F001/
│       │       └── video.mp4
│       └── C002/
│           └── F002/
│               └── video.mp4
└── package.json
```

---

## 🚀 Quickstart Guide

### 1. Install Dependencies & Start Dev Servers

```bash
# Install node dependencies
npm install

# Start Vite Frontend Server (Port 8080)
npm run dev

# Start Node API & Media Server (Port 3000)
node src/server.js
```

### 2. Access Applications

* **Enterprise Admin Dashboard:** [http://localhost:8080/examples/image-tracking/admin.html](http://localhost:8080/examples/image-tracking/admin.html)
* **Branded AR Mobile Scanner:** [http://localhost:8080/examples/image-tracking/brand-ar.html](http://localhost:8080/examples/image-tracking/brand-ar.html)
* **Target Photo Compiler:** [http://localhost:8080/examples/image-tracking/compile.html](http://localhost:8080/examples/image-tracking/compile.html)

---

## 📖 How to Use the Platform

### Step 1: Add Client Account
Open the **Admin Dashboard** (`admin.html`) $\rightarrow$ Click **+ Add Client Account** $\rightarrow$ Fill in Client Name (e.g., `John Wedding Studio`).

### Step 2: Compile Photograph Target
Open the **Target Compiler** (`compile.html`) $\rightarrow$ Drop target photo $\rightarrow$ Click **Start** $\rightarrow$ Download generated `.mind` feature target file (e.g. `frame001.mind`).

### Step 3: Register Target & Store Video
In **Admin Dashboard**, click **+ Add Target Frame** $\rightarrow$ Select Client `C001` $\rightarrow$ Specify video filename (`wedding_final.mp4`) $\rightarrow$ Save video inside `uploads/clients/C001/F001/video.mp4`.

### Step 4: Scan Photograph
Open **AR Scanner** (`brand-ar.html`) on mobile $\rightarrow$ Point camera at photograph $\rightarrow$ Video automatically streams on top of photograph!

---

## 🌐 Production Deployment (100% Free)

* **Frontend Web App (Vercel / Cloudflare Pages):** Deploy repository root. Set entry points to `brand-ar.html` and `admin.html`.
* **Backend API & Media Server (Render / Railway):** Deploy Node web service with Start Command `node src/server.js`.

---

## 📄 License & Credits

Designed & Developed by **Joel kumar.J**.  
Core AR Image Tracking powered by [MindAR.js](https://github.com/hiukim/mind-ar-js) (MIT License).
