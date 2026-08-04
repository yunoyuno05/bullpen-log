import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Ensure server storage directories exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'videos');
const DATA_DIR = path.join(process.cwd(), 'data', 'users');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// API Route: Account Server Sync (Save)
app.post('/api/account/data', (req, res) => {
  try {
    const { email, accountData } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const cleanEmail = String(email).trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
    const filePath = path.join(DATA_DIR, `${cleanEmail}.json`);

    fs.writeFileSync(filePath, JSON.stringify(accountData, null, 2), 'utf-8');
    res.json({ success: true, message: 'Account data successfully synced to server', lastSavedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('Error saving account data:', err);
    res.status(500).json({ success: false, error: err.message || 'Server save failed' });
  }
});

// API Route: Account Server Sync (Get)
app.get('/api/account/data/:email', (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const cleanEmail = String(email).trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
    const filePath = path.join(DATA_DIR, `${cleanEmail}.json`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const accountData = JSON.parse(content);
      return res.json({ success: true, accountData });
    } else {
      return res.json({ success: false, message: 'No server account data found' });
    }
  } catch (err: any) {
    console.error('Error loading account data:', err);
    res.status(500).json({ success: false, error: err.message || 'Server load failed' });
  }
});

// API Route: Upload Video & Save to Account on Server
app.post('/api/videos/upload', (req, res) => {
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

    const filename = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(base64String, 'base64');
    fs.writeFileSync(filePath, buffer);

    const serverVideoUrl = `/api/videos/file/${filename}`;

    const savedVideo = {
      ...video,
      id: video.id || `vid_srv_${Date.now()}`,
      videoUrl: serverVideoUrl,
    };

    // If user email is provided, append/update in user account data on server
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
      const userFilePath = path.join(DATA_DIR, `${cleanEmail}.json`);

      let accountData: any = {};
      if (fs.existsSync(userFilePath)) {
        try {
          accountData = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));
        } catch (e) {
          accountData = {};
        }
      }

      const existingVideos = Array.isArray(accountData.videos) ? accountData.videos : [];
      // Remove any duplicate id or push
      const updatedVideos = [savedVideo, ...existingVideos.filter((v: any) => v.id !== savedVideo.id)];
      accountData.videos = updatedVideos;

      fs.writeFileSync(userFilePath, JSON.stringify(accountData, null, 2), 'utf-8');
    }

    res.json({
      success: true,
      message: 'Video file successfully saved to server',
      video: savedVideo,
      serverUrl: serverVideoUrl,
    });
  } catch (err: any) {
    console.error('Error uploading video to server:', err);
    res.status(500).json({ success: false, error: err.message || 'Video upload failed' });
  }
});

// API Route: Stream / Serve Video File with Range Header Support
app.get('/api/videos/file/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Video file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  let contentType = 'video/webm';
  if (req.params.filename.endsWith('.mp4')) contentType = 'video/mp4';
  if (req.params.filename.endsWith('.mov')) contentType = 'video/quicktime';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Initialize AI Engine Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route: Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Route: AI Care & Pulse Report Generation
app.post('/api/ai-report', async (req, res) => {
  try {
    const { pitcherName, throwingArm, acwr, recentPitches, avgVelocity, maxVelocity, rpe, fatigue, rom, notes } = req.body;
    
    const ai = getAiClient();
    
    const prompt = `
당신은 메이저리그(MLB) 정상급 투수 전문 컨디셔닝 코치이자, Driveline 및 Tread Athletics 등 최첨단 데이터 드라이븐 피칭 센터에서 연구하고 최신 바이오메카닉스 논문을 습득한 최고 권위 'AI 불펜 코치'입니다.
다음 투수의 피칭 메트릭, 부하 지수(ACWR), 가동범위(ROM), 주관적 피로도(RPE) 데이터를 정밀 분석하여 과학적이고 현장감 있는 맞춤형 주간 훈련 & 케어 리포트를 JSON으로 작성해 주세요.
분석 시 반드시 키네마틱 시퀀스(Kinematic Sequence), 힙-숄더 세퍼레이션(Hip-Shoulder Separation), 리드 레그 블로킹(Lead Leg Blocking) 등의 바이오메카닉스 전문 용어와 지표를 활용하여 설명하세요.

[선수 프로필 & 데이터]
- 선수 이름: ${pitcherName || '김민우'}
- 투구 손: ${throwingArm || '우투(RHP)'}
- 부하 지수 (ACWR - Acute:Chronic Workload Ratio): ${acwr || 1.15} (기준: 0.8~1.3 적정 범위 / 1.3~1.5 주의 / 1.5 이상 과부하 고위험)
- 최근 7일 피칭 수: ${recentPitches || 142}구
- 최근 구속 (최고/평균): ${maxVelocity || 148} km/h / ${avgVelocity || 142} km/h
- 운동 자각도 (RPE 1-10): ${rpe || 7}
- 피로도 / 통증 지수: ${fatigue || 4} / 10
- 어깨/팔꿈치 ROM 가동범위:
  * shoulderFlexion: ${rom?.shoulderFlexion || 170}°
  * shoulderExtension: ${rom?.shoulderExtension || 55}°
  * shoulderIntRotation (내회전 GIRD 체크): ${rom?.shoulderIntRotation || 45}°
  * shoulderExtRotation (외회전): ${rom?.shoulderExtRotation || 110}°
  * elbowFlexion: ${rom?.elbowFlexion || 140}°
  * elbowExtension: ${rom?.elbowExtension || 0}°
  * 통증 점수: ${rom?.painScore || 2}/10 (부위: ${rom?.painLocation || '팔꿈치 내측 (UCL 근처)'})
- 기타 특이사항/메모: ${notes || '불펜 피칭 후 투구 후반부 구속 2km/h 떨어짐, 약간의 내측 뻐근함'}

반드시 지정된 JSON 구조로만 답변하세요:
{
  "riskStatus": "SAFE" | "CAUTION" | "DANGER",
  "riskScore": number (0-100),
  "headline": "한 줄 요약 피드백",
  "acwrEvaluation": "ACWR 수치 해석 및 투구량 조절 조언",
  "biomechanicsInsight": "키네마틱 시퀀스, 힙-숄더 세퍼레이션 등 전문 용어를 사용한 투구 메커니즘 및 ROM 측정치 분석",
  "recommendedProgram": [
    { "day": "Day 1", "title": "활동 내용", "pitchCap": number (0-100구), "focus": "중점사항" },
    { "day": "Day 2", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" },
    { "day": "Day 3", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" },
    { "day": "Day 4", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" },
    { "day": "Day 5", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" },
    { "day": "Day 6", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" },
    { "day": "Day 7", "title": "활동 내용", "pitchCap": number, "focus": "중점사항" }
  ],
  "armCareExercises": [
    { "name": "운동명", "setsReps": "3세트 x 12회", "targetArea": "타겟 부위", "description": "수행 팁" }
  ],
  "nutritionAndRecovery": [
    "수면/냉찜질/수분섭취 등 피로 회복 지침 3-4가지"
  ],
  "recommendedGear": [
    { "name": "Driveline PlyoCare® 볼", "url": "https://www.drivelinebaseball.com/product/plyocare-balls/", "reason": "팔 스윙 스피드 향상 및 어깨/팔꿈치 강화" }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskStatus: { type: Type.STRING, description: 'SAFE, CAUTION, or DANGER' },
            riskScore: { type: Type.NUMBER, description: '0 to 100 risk score' },
            headline: { type: Type.STRING, description: 'One-line summary' },
            acwrEvaluation: { type: Type.STRING, description: 'ACWR analysis' },
            biomechanicsInsight: { type: Type.STRING, description: 'Biomechanics and ROM insight' },
            recommendedProgram: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  title: { type: Type.STRING },
                  pitchCap: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                },
                required: ['day', 'title', 'pitchCap', 'focus'],
              },
            },
            armCareExercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  setsReps: { type: Type.STRING },
                  targetArea: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'setsReps', 'targetArea', 'description'],
              },
            },
            nutritionAndRecovery: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['riskStatus', 'riskScore', 'headline', 'acwrEvaluation', 'biomechanicsInsight', 'recommendedProgram', 'armCareExercises', 'nutritionAndRecovery'],
        },
      },
    });

    const reportText = response.text || '{}';
    const reportJson = JSON.parse(reportText);
    res.json({ success: true, report: reportJson });
  } catch (err: any) {
    console.error('Error in /api/ai-report:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Report generation failed' });
  }
});

// API Route: AI Bullpen Coach Chat
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { message, history, pitcherData } = req.body;
    const ai = getAiClient();

    const systemInstruction = `
당신은 Bullpen Log의 지능형 AI 불펜 코치 (AI Bullpen Coach)입니다.
당신은 메이저리그(MLB) 정상급 투수 코치이자, Driveline, Tread Athletics 등 최첨단 피칭 바이오메카닉스 전문 사설 기관 및 데이터 드라이븐 훈련 시스템을 완벽히 습득한 최고 권위자입니다.
매일 최신 스포츠 과학 논문과 피칭 바이오메카닉스 연구 결과, 투구 메커니즘, UCL(팔꿈치 내측 측부인대) 및 어깨 보존, ACWR 부하 관리, 가동범위(ROM), 피치 디자인(패스트볼, 슬라이더, 체인지업, 무브먼트 설계)을 끊임없이 연구합니다.

선수/코치 질문에 한국어로 친절하고 정확하며 전문성 있게 답하세요.
답변 시 다음을 명심하세요:
1. 투수 팔꿈치/어깨 건강 보호와 지능적인 투구 피로 관리가 최우선
2. ACWR 부하 조절 및 구속/무브먼트 저하 신호에 민감하게 조언
3. 필요 시 핵심 요점을 마크다운 Bullet point로 깔끔하게 정리
4. 스포츠 과학 및 최신 피칭 연구 데이터 기반의 명확한 가이드 제공
`;

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
      },
    });

    // Send the conversation history if any, then send user message
    const formattedMessage = pitcherData
      ? `[현재 투수 상태: ${pitcherData.name}, ACWR: ${pitcherData.acwr}, 최근 7일 피칭: ${pitcherData.recentPitches}구]\n질문: ${message}`
      : message;

    const chatResponse = await chat.sendMessage({ message: formattedMessage });

    res.json({ success: true, reply: chatResponse.text });
  } catch (err: any) {
    console.error('Error in /api/ai-coach:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Coach response failed' });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bullpen Log Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
