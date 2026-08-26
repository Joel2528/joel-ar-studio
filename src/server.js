import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const PORT = 3000;

// Supabase Cloud Storage Engine Configuration
let storageConfig = {
  engine: 'Supabase Object Storage',
  projectId: 'kbcfmvcaantevnywykso',
  bucketName: 'ar-videos',
  baseUrl: 'https://kbcfmvcaantevnywykso.supabase.co/storage/v1/object/public/ar-videos',
  active: true
};

// In-Memory Database Store (Mirroring Relational Schema)
const db = {
  clients: [
    { id: 'C001', name: "Joel's AR Studio (Primary)", email: 'joel@joelar.com', plan: 'Enterprise', createdAt: new Date().toISOString() },
    { id: 'C002', name: "Sarah's Birthday Party", email: 'sarah@example.com', plan: 'Pro', createdAt: new Date().toISOString() },
    { id: 'C003', name: "Kumar Memorial Event", email: 'kumar@example.com', plan: 'Starter', createdAt: new Date().toISOString() }
  ],
  frames: [
    { id: 'F001', clientId: 'C001', name: 'Wedding Main Frame', targetFile: 'frame001.mind', active: true, createdAt: new Date().toISOString() },
    { id: 'F002', clientId: 'C001', name: 'Reception Gala Frame', targetFile: 'frame002.mind', active: true, createdAt: new Date().toISOString() },
    { id: 'F003', clientId: 'C002', name: 'Birthday Memory Frame', targetFile: 'frame003.mind', active: false, createdAt: new Date().toISOString() }
  ],
  videos: [
    { id: 'V001', frameId: 'F001', storageKey: 'clients/C001/F001/video.mp4', filename: 'wedding_final.mp4', duration: 15, sizeMb: '4.2 MB' },
    { id: 'V002', frameId: 'F002', storageKey: 'clients/C001/F002/video.mp4', filename: 'reception_recap.mp4', duration: 24, sizeMb: '8.7 MB' },
    { id: 'V003', frameId: 'F003', storageKey: 'clients/C002/F003/video.mp4', filename: 'bday_highlights.mp4', duration: 18, sizeMb: '5.1 MB' }
  ]
};

// Signed & Direct Token Generator for Supabase Media Storage Access
function generateSignedUrl(storageKey, expiresInSeconds = 3600) {
  if (storageConfig.baseUrl && storageKey) {
    return `${storageConfig.baseUrl}/${storageKey}`;
  }
  const timestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const mockSignature = Buffer.from(`${storageKey}_${timestamp}`).toString('hex').slice(0, 16);
  return `./assets/frame001.mp4?sig=${mockSignature}&exp=${timestamp}`;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Root Health & System Status Endpoint
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: "Joel's AR Studio Backend API",
      version: '1.0.0',
      systemHealth: '100% Operational',
      endpoints: {
        adminDashboard: '/api/admin/dashboard',
        scannerVideo: '/api/frames/F001/video',
        storageDirectory: '/uploads/'
      }
    }));
    return;
  }

  // Serve static files from /uploads/ directory
  if (pathname.startsWith('/uploads/') && req.method === 'GET') {
    const relativePath = pathname.replace('/uploads/', '');
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(process.cwd(), 'uploads', safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.mp4' ? 'video/mp4' : (ext === '.mind' ? 'application/octet-stream' : 'application/octet-stream');
      res.writeHead(200, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes' });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found in local storage' }));
      return;
    }
  }

  // 1. GET /api/frames/:frameId/video - Public AR Scanner API
  if (pathname.match(/^\/api\/frames\/([^\/]+)\/video$/) && req.method === 'GET') {
    const frameId = pathname.split('/')[3];
    const frame = db.frames.find(f => f.id === frameId);

    if (!frame) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Frame not found' }));
      return;
    }

    if (!frame.active) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Frame is currently disabled by account administrator' }));
      return;
    }

    const video = db.videos.find(v => v.frameId === frameId);
    if (!video) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No video assigned to this frame target' }));
      return;
    }

    const signedUrl = generateSignedUrl(video.storageKey);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      frameId: frame.id,
      frameName: frame.name,
      clientId: frame.clientId,
      storageKey: video.storageKey,
      signedUrl: signedUrl,
      storageEngine: storageConfig.engine,
      expiresIn: 3600
    }));
    return;
  }

  // 2. GET /api/admin/dashboard - Complete Admin Metrics & Directory
  if (pathname === '/api/admin/dashboard' && req.method === 'GET') {
    const clientsWithData = db.clients.map(client => {
      const clientFrames = db.frames.filter(f => f.clientId === client.id).map(frame => {
        const video = db.videos.find(v => v.frameId === frame.id);
        return { ...frame, video: video || null };
      });
      return { ...client, frames: clientFrames };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      clientsCount: db.clients.length,
      framesCount: db.frames.length,
      activeFramesCount: db.frames.filter(f => f.active).length,
      storageConfig: storageConfig,
      data: clientsWithData
    }));
    return;
  }

  // 3. POST /api/admin/frames/:frameId/toggle - Toggle Frame Active State
  if (pathname.match(/^\/api\/admin\/frames\/([^\/]+)\/toggle$/) && req.method === 'POST') {
    const frameId = pathname.split('/')[4];
    const frame = db.frames.find(f => f.id === frameId);
    if (frame) {
      frame.active = !frame.active;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, frame }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Frame not found' }));
    }
    return;
  }

  // 4. POST /api/admin/clients - Add New Client
  if (pathname === '/api/admin/clients' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const newId = `C${String(db.clients.length + 1).padStart(3, '0')}`;
        const newClient = {
          id: newId,
          name: payload.name || 'New Client',
          email: payload.email || 'client@example.com',
          plan: payload.plan || 'Pro',
          createdAt: new Date().toISOString()
        };
        db.clients.push(newClient);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, client: newClient }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      }
    });
    return;
  }

  // 5. POST /api/admin/frames - Add New Frame & Video Assignment
  if (pathname === '/api/admin/frames' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const newFrameId = `F${String(db.frames.length + 1).padStart(3, '0')}`;
        const newVideoId = `V${String(db.videos.length + 1).padStart(3, '0')}`;
        
        const newFrame = {
          id: newFrameId,
          clientId: payload.clientId || 'C001',
          name: payload.name || 'Custom Frame Target',
          targetFile: `${newFrameId.toLowerCase()}.mind`,
          active: true,
          createdAt: new Date().toISOString()
        };

        const newVideo = {
          id: newVideoId,
          frameId: newFrameId,
          storageKey: `uploads/clients/${newFrame.clientId}/${newFrameId}/video.mp4`,
          filename: payload.filename || 'video.mp4',
          duration: payload.duration || 15,
          sizeMb: '6.4 MB'
        };

        db.frames.push(newFrame);
        db.videos.push(newVideo);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, frame: newFrame, video: newVideo }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Self-Contained WebAR Backend Server running on http://localhost:${PORT}`);
});
