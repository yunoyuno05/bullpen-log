import sys

with open('server.ts', 'r') as f:
    content = f.read()

# Replace express.json limit with multer
content = content.replace("app.use(express.json({ limit: '500mb' }));", "app.use(express.json({ limit: '10mb' }));")
content = content.replace("app.use(express.urlencoded({ limit: '500mb', extended: true }));", "app.use(express.urlencoded({ limit: '10mb', extended: true }));")

# Add multer import and config
multerCode = """import multer from 'multer';

// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// Admin Authorization Middleware
const isAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer admin-secret-token') {
    // In a real app, verify the Supabase JWT token and check if user has admin role
    return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required' });
  }
  next();
};
"""
content = content.replace("import dotenv from 'dotenv';", "import dotenv from 'dotenv';\n" + multerCode)

# Replace /api/videos/upload
oldUpload = """app.post('/api/videos/upload', (req, res) => {
  try {
    const { email, video, fileData } = req.body;
    if (!video || !fileData) {
      return res.status(400).json({ success: false, error: 'Video payload and fileData are required' });
    }

    let extension = 'webm';
    let base64String = fileData;

    if (typeof fileData === 'string' && fileData.includes('base64,')) {
      const parts = fileData.split('base64,');
      base64String = parts.pop() || '';
      const header = parts[0] || '';
      
      if (header.includes('video/mp4')) {
        extension = 'mp4';
      } else if (header.includes('video/quicktime')) {
        extension = 'mov';
      } else if (header.includes('video/x-m4v')) {
        extension = 'mp4';
      }
    }

    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filepath, Buffer.from(base64String, 'base64'));

    const publicUrl = `/uploads/videos/${filename}`;

    res.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error('Error uploading video:', err);
    res.status(500).json({ success: false, error: err.message || 'Server upload failed' });
  }
});"""

newUpload = """app.post('/api/videos/upload', upload.single('videoFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    const publicUrl = `/uploads/videos/${req.file.filename}`;
    res.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error('Error uploading video:', err);
    res.status(500).json({ success: false, error: err.message || 'Server upload failed' });
  }
});

// Serve uploaded videos statically
app.use('/uploads/videos', express.static(UPLOADS_DIR));
"""
content = content.replace(oldUpload, newUpload)

content = content.replace("app.post('/api/account/data', (req, res) => {", "app.post('/api/account/data', isAdmin, (req, res) => {")

with open('server.ts', 'w') as f:
    f.write(content)
