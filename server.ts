import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI Client
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
당신은 메이저리그(MLB) 수준의 스포츠 과학자이자 야구 투수 전문 컨디셔닝 디렉터(Sports Scientist & Pitching Biomechanics Specialist)입니다.
다음 투수의 피칭 메트릭, 부하 지수(ACWR), 가동범위(ROM), 주관적 피로도(RPE) 데이터를 정밀 분석하여 맞춤형 주간 훈련 & 케어 리포트를 JSON으로 작성해 주세요.

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
  "biomechanicsInsight": "구속 변화, ROM 측정치, GIRD(내회전 결핍) 및 메커니즘 관점 분석",
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
투수 훈련, 피칭 바이오메카닉스, UCL(팔꿈치 내측 측부인대) 보호, ACWR(투구 부하량 관리), ROM(가동범위), 구질 개발(슬라이더, 패스트볼, 체인지업), 웜업 & 쿨다운 프로토콜에 특화된 전문가입니다.

선수/코치 질문에 한국어로 친절하고 정확하게 답하세요.
답변 시 다음을 명심하세요:
1. 투수 팔꿈치/어깨 건강 보호가 최우선
2. ACWR 부하 조절 및 구속 저하 신호에 민감하게 조언
3. 필요 시 핵심 요점을 마크다운 Bullet point로 깔끔하게 정리
4. 의료적 진단이 아닌 스포츠 과학 기반 코칭 가이드임을 자연스럽게 언급
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
