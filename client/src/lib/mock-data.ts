import type {
  ProjectResponse,
  GeneratedClipResponse,
  BrandKitResponse,
  TimelineDocument,
  WordTiming,
} from '@frameflow/shared';

// ==========================================
// 1. PROJECT TYPES & MOCK DATA
// ==========================================

export interface MockProject extends ProjectResponse {
  sourceDurationSec: number;
  thumbnailUrl: string;
  channelName: string;
  clipCount: number;
  status: 'PROCESSED' | 'PROCESSING' | 'FAILED';
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'demo-1',
    title: 'The AI Hardware Revolution & Future of Silicon',
    description: 'Deep dive podcast on specialized NPUs, edge inference, and the post-GPU computing landscape with Dr. Elena Vance.',
    ownerId: 'd3b07384-d113-4602-9c91-4cf885745100',
    sourceVideoUrl: 'https://assets.frameflow.dev/samples/hardware-revolution-full.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    channelName: 'NextGen Silicon Podcast',
    sourceDurationSec: 3742, // ~62 mins
    clipCount: 8,
    status: 'PROCESSED',
    targetAspect: '9:16',
    targetLength: '30-60s',
    transcript: null,
    width: 1920,
    height: 1080,
    fps: 30.0,
    createdAt: '2026-11-19T14:22:00Z',
    updatedAt: '2026-11-20T18:10:00Z',
  },
  {
    id: 'demo-2',
    title: 'How Founders Scale from $0 to $10M ARR Without VC',
    description: 'Bootstrapping masterclass featuring actionable revenue tactics, pricing psychology, and organic viral funnels.',
    ownerId: 'd3b07384-d113-4602-9c91-4cf885745100',
    sourceVideoUrl: 'https://assets.frameflow.dev/samples/saas-bootstrapping-fireside.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    channelName: 'SaaS Zero to One',
    sourceDurationSec: 2840, // ~47 mins
    clipCount: 6,
    status: 'PROCESSED',
    targetAspect: '9:16',
    targetLength: '30-60s',
    transcript: null,
    width: 1920,
    height: 1080,
    fps: 30.0,
    createdAt: '2026-11-18T09:15:00Z',
    updatedAt: '2026-11-19T11:45:00Z',
  },
  {
    id: 'demo-3',
    title: 'Mastering Visual Storytelling: Color Science & Cinematography',
    description: 'Filmmaking workshop breaking down ACES color workflows, lighting ratios, and subconscious frame dynamics.',
    ownerId: 'd3b07384-d113-4602-9c91-4cf885745100',
    sourceVideoUrl: 'https://assets.frameflow.dev/samples/cinematography-masterclass.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    channelName: 'CineCraft Studio',
    sourceDurationSec: 4120, // ~68 mins
    clipCount: 4,
    status: 'PROCESSED',
    targetAspect: '9:16',
    targetLength: '30-60s',
    transcript: null,
    width: 3840,
    height: 2160,
    fps: 24.0,
    createdAt: '2026-11-20T22:30:00Z',
    updatedAt: '2026-11-20T23:05:00Z',
  },
  {
    id: 'demo-4',
    title: 'The Architecture of LLM Agents & Autonomous Workflows',
    description: 'Technical deep dive exploring multi-agent orchestration, function calling loops, and self-healing execution plans.',
    ownerId: 'd3b07384-d113-4602-9c91-4cf885745100',
    sourceVideoUrl: 'https://assets.frameflow.dev/samples/llm-agents-deepdive.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    channelName: 'Neural Systems Eng',
    sourceDurationSec: 3310, // ~55 mins
    clipCount: 5,
    status: 'PROCESSED',
    targetAspect: '9:16',
    targetLength: '30-60s',
    transcript: null,
    width: 1920,
    height: 1080,
    fps: 30.0,
    createdAt: '2026-11-21T00:10:00Z',
    updatedAt: '2026-11-21T00:45:00Z',
  },
];

// Helper to generate a compliant timeline document for each short clip
function createMockTimelineDoc(
  clipId: string,
  projectId: string,
  title: string,
  duration: number,
  words: WordTiming[]
): GeneratedClipResponse['timelineDocument'] {
  return {
    id: `tl-${clipId}`,
    projectId,
    clipId,
    version: 1,
    fps: 30.0,
    duration,
    aspectRatio: '9:16',
    reframeConfig: {
      mode: 'auto',
      cropX: 0.5,
      cropY: 0.45,
      scale: 1.15,
      speakerTracking: true,
    },
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    captionConfig: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    brandKit: {
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      fontFamily: 'Inter',
      captionPreset: 'hormozi_pop',
      logoPosition: 'top_right',
      logoScale: 0.15,
    },
    tracks: [
      {
        id: `track-video-${clipId}`,
        type: 'VIDEO',
        name: 'Primary 9:16 Video',
        locked: false,
        muted: false,
        clips: [
          {
            id: `clip-vid-${clipId}`,
            assetId: 'asset-main-source-01',
            name: title,
            start: 0,
            duration,
            inPoint: 124.0,
            outPoint: 124.0 + duration,
            speed: 1.0,
            proxyUrl: 'https://assets.frameflow.dev/proxies/clip-01-720p.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1534972195531-a756b11269d5?auto=format&fit=crop&w=720&q=80',
            textConfig: null,
            words,
            reframe: { cropX: 0.5, cropY: 0.45, scale: 1.15 },
          },
        ],
      },
      {
        id: `track-audio-${clipId}`,
        type: 'AUDIO',
        name: 'Master Audio (Denoised)',
        locked: false,
        muted: false,
        clips: [
          {
            id: `clip-aud-${clipId}`,
            assetId: 'asset-main-source-01',
            name: 'Voice Track',
            start: 0,
            duration,
            inPoint: 124.0,
            outPoint: 124.0 + duration,
            speed: 1.0,
            proxyUrl: null,
            thumbnailUrl: null,
            textConfig: null,
          },
        ],
      },
      {
        id: `track-text-${clipId}`,
        type: 'TEXT',
        name: 'AI Dynamic Captions',
        locked: false,
        muted: false,
        clips: [
          {
            id: `clip-txt-${clipId}`,
            assetId: null,
            name: 'Animated Subtitles',
            start: 0,
            duration,
            inPoint: 0,
            outPoint: duration,
            speed: 1.0,
            proxyUrl: null,
            thumbnailUrl: null,
            textConfig: {
              text: words.map((w) => w.word).join(' '),
              fontSize: 48,
              color: '#FFFFFF',
              position: { x: 540, y: 1550 },
            },
            words,
          },
        ],
      },
    ],
    markers: [
      { id: `m1-${clipId}`, time: 0.0, label: 'Hook Impact', color: '#10B981' },
      { id: `m2-${clipId}`, time: Math.min(duration * 0.4, 15.0), label: 'Core Climax', color: '#6366F1' },
    ],
  };
}

// ==========================================
// 2. 8 RANKED VIRAL SHORT CLIPS (WITH SUB-SCORES & WORD TIMESTAMPS)
// ==========================================

export const MOCK_VIRAL_CLIPS: GeneratedClipResponse[] = [
  {
    id: 'e1011111-1111-4111-8111-111111111111',
    projectId: 'demo-1',
    title: 'Why 99% of AI Chips Will Be Obsolete in 18 Months',
    hookSummary: 'Sensational contrarian statement challenging mainstream GPU hype with immediate hardware data proof.',
    viralityScore: 97,
    scoreBreakdown: {
      hook: 99,
      flow: 96,
      topicRelevance: 96,
      reasoning: 'Exceptional open-loop opening, rapid vocal pacing with no pause in the first 3 seconds, and a contrarian tech conclusion.',
    },
    startTime: 142.0,
    endTime: 178.5,
    duration: 36.5,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    reframeMode: 'auto',
    reframeConfig: {
      mode: 'auto',
      cropX: 0.5,
      cropY: 0.45,
      scale: 1.15,
      speakerTracking: true,
    },
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-01-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-01-final.mp4',
    socialPack: {
      title: 'The AI Hardware Bubble Is About to Pop 💥',
      caption: 'Everyone is hoarding GPUs, but the real moat is in optical interconnects and custom analog compute. Here is why the current architecture hits a wall in 2027.',
      hashtags: ['#ai', '#hardware', '#techtrends', '#silicon', '#futuretech'],
    },
    createdAt: '2026-11-20T16:00:00Z',
    updatedAt: '2026-11-20T16:05:00Z',
    timelineDocument: createMockTimelineDoc(
      'e1011111-1111-4111-8111-111111111111',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Why 99% of AI Chips Will Be Obsolete in 18 Months',
      36.5,
      [
        { word: 'Nobody', start: 0.0, end: 0.38, highlighted: true, confidence: 0.99 },
        { word: 'wants', start: 0.4, end: 0.72, confidence: 0.98 },
        { word: 'to', start: 0.74, end: 0.88, confidence: 0.99 },
        { word: 'admit', start: 0.9, end: 1.25, highlighted: true, confidence: 0.99 },
        { word: 'this,', start: 1.26, end: 1.55, confidence: 0.97 },
        { word: 'but', start: 1.6, end: 1.82, confidence: 0.98 },
        { word: 'every', start: 1.84, end: 2.12, confidence: 0.99 },
        { word: 'single', start: 2.14, end: 2.5, highlighted: true, confidence: 0.99 },
        { word: 'GPU', start: 2.52, end: 2.9, highlighted: true, confidence: 0.98 },
        { word: 'cluster', start: 2.92, end: 3.35, confidence: 0.97 },
        { word: 'you', start: 3.4, end: 3.58, confidence: 0.99 },
        { word: 'bought', start: 3.6, end: 3.92, confidence: 0.98 },
        { word: 'yesterday', start: 3.95, end: 4.45, confidence: 0.99 },
        { word: 'is', start: 4.5, end: 4.68, confidence: 0.99 },
        { word: 'already', start: 4.7, end: 5.12, confidence: 0.98 },
        { word: 'bottlenecked', start: 5.15, end: 5.82, highlighted: true, confidence: 0.96 },
        { word: 'by', start: 5.85, end: 6.02, confidence: 0.99 },
        { word: 'copper', start: 6.05, end: 6.45, highlighted: true, confidence: 0.99 },
        { word: 'wire', start: 6.48, end: 6.85, confidence: 0.98 },
        { word: 'physics.', start: 6.88, end: 7.4, confidence: 0.97 },
      ]
    ),
  },
  {
    id: 'e2022222-2222-4222-8222-222222222222',
    projectId: 'demo-1',
    title: 'The Secret Power Constraint Silicon Valley Won’t Discuss',
    hookSummary: 'Reveals the actual energy grid bottleneck halting frontier AI cluster expansion.',
    viralityScore: 94,
    scoreBreakdown: {
      hook: 96,
      flow: 94,
      topicRelevance: 92,
      reasoning: 'Strong curiosity gap; connects planetary scale infrastructure with daily smartphone AI queries.',
    },
    startTime: 410.0,
    endTime: 452.0,
    duration: 42.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-02-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-02-final.mp4',
    socialPack: {
      title: 'The Real Reason AI Data Centers Are Moving to Nuclear ⚡️',
      caption: 'The problem isn’t capital or talent. It’s megawatts. Watch what happens when a single training run needs the power of a small city.',
      hashtags: ['#nuclearpower', '#energy', '#datacenter', '#technews', '#deeptech'],
    },
    createdAt: '2026-11-20T16:01:00Z',
    updatedAt: '2026-11-20T16:06:00Z',
    timelineDocument: createMockTimelineDoc(
      'e2022222-2222-4222-8222-222222222222',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'The Secret Power Constraint Silicon Valley Won’t Discuss',
      42.0,
      [
        { word: 'There', start: 0.0, end: 0.25, confidence: 0.99 },
        { word: 'is', start: 0.26, end: 0.42, confidence: 0.99 },
        { word: 'one', start: 0.45, end: 0.72, confidence: 0.98 },
        { word: 'number', start: 0.75, end: 1.15, highlighted: true, confidence: 0.99 },
        { word: 'keeping', start: 1.18, end: 1.52, confidence: 0.97 },
        { word: 'every', start: 1.54, end: 1.82, confidence: 0.99 },
        { word: 'tech', start: 1.84, end: 2.15, confidence: 0.98 },
        { word: 'CEO', start: 2.18, end: 2.58, highlighted: true, confidence: 0.99 },
        { word: 'awake', start: 2.6, end: 3.02, highlighted: true, confidence: 0.99 },
        { word: 'at', start: 3.05, end: 3.2, confidence: 0.98 },
        { word: 'three', start: 3.22, end: 3.52, confidence: 0.99 },
        { word: 'in', start: 3.54, end: 3.7, confidence: 0.99 },
        { word: 'the', start: 3.72, end: 3.85, confidence: 0.99 },
        { word: 'morning.', start: 3.88, end: 4.4, confidence: 0.97 },
      ]
    ),
  },
  {
    id: 'e3033333-3333-4333-8333-333333333333',
    projectId: 'demo-1',
    title: 'Why Analog Computing Beats Digital for Neural Nets',
    hookSummary: 'Physical demonstration of matrix multiplication done with light waves instead of transistors.',
    viralityScore: 91,
    scoreBreakdown: {
      hook: 92,
      flow: 90,
      topicRelevance: 91,
      reasoning: 'Mind-bending visual explanation; high educational save and share rate expected.',
    },
    startTime: 780.0,
    endTime: 815.0,
    duration: 35.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'keyword_highlight',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#6366F1',
      uppercase: false,
      fontSize: 46,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-03-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-03-final.mp4',
    socialPack: {
      title: 'Compute at the Speed of Light ⚡️💡',
      caption: 'Digital 1s and 0s generate massive heat. What if light did the math instantaneously? Welcome to photonic silicon.',
      hashtags: ['#physics', '#quantum', '#photonic', '#technology', '#engineering'],
    },
    createdAt: '2026-11-20T16:02:00Z',
    updatedAt: '2026-11-20T16:07:00Z',
    timelineDocument: createMockTimelineDoc(
      'e3033333-3333-4333-8333-333333333333',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Why Analog Computing Beats Digital for Neural Nets',
      35.0,
      [
        { word: 'What', start: 0.0, end: 0.22, confidence: 0.99 },
        { word: 'if', start: 0.24, end: 0.42, confidence: 0.98 },
        { word: 'I', start: 0.44, end: 0.58, confidence: 0.99 },
        { word: 'told', start: 0.6, end: 0.88, confidence: 0.98 },
        { word: 'you', start: 0.9, end: 1.05, confidence: 0.99 },
        { word: 'math', start: 1.08, end: 1.45, highlighted: true, confidence: 0.99 },
        { word: 'can', start: 1.48, end: 1.68, confidence: 0.98 },
        { word: 'happen', start: 1.7, end: 2.1, confidence: 0.99 },
        { word: 'with', start: 2.12, end: 2.35, confidence: 0.99 },
        { word: 'zero', start: 2.38, end: 2.8, highlighted: true, confidence: 0.99 },
        { word: 'electricity?', start: 2.82, end: 3.5, highlighted: true, confidence: 0.97 },
      ]
    ),
  },
  {
    id: 'e4044444-4444-4444-8444-444444444444',
    projectId: 'demo-1',
    title: 'How TSMC Won the Global Monopoly on Advanced Chips',
    hookSummary: 'Rapid-fire geopolitical history lesson explaining why one fab in Hsinchu holds modern civilization.',
    viralityScore: 89,
    scoreBreakdown: {
      hook: 91,
      flow: 89,
      topicRelevance: 87,
      reasoning: 'Extremely high retention topic; clear narrative arc with high suspense.',
    },
    startTime: 1120.0,
    endTime: 1168.0,
    duration: 48.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-04-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-04-final.mp4',
    socialPack: {
      title: 'The Most Indispensable Factory on Earth 🏭',
      caption: 'If this single fab stopped for 48 hours, global auto, phone, and aerospace production halts entirely.',
      hashtags: ['#tsmc', '#geopolitics', '#economy', '#semiconductors', '#business'],
    },
    createdAt: '2026-11-20T16:03:00Z',
    updatedAt: '2026-11-20T16:08:00Z',
    timelineDocument: createMockTimelineDoc(
      'e4044444-4444-4444-8444-444444444444',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'How TSMC Won the Global Monopoly on Advanced Chips',
      48.0,
      [
        { word: 'One', start: 0.0, end: 0.3, confidence: 0.99 },
        { word: 'building', start: 0.32, end: 0.78, highlighted: true, confidence: 0.99 },
        { word: 'holds', start: 0.8, end: 1.15, confidence: 0.98 },
        { word: 'the', start: 1.18, end: 1.32, confidence: 0.99 },
        { word: 'entire', start: 1.35, end: 1.72, highlighted: true, confidence: 0.99 },
        { word: 'global', start: 1.75, end: 2.12, confidence: 0.98 },
        { word: 'economy', start: 2.15, end: 2.7, highlighted: true, confidence: 0.99 },
        { word: 'hostage.', start: 2.72, end: 3.3, highlighted: true, confidence: 0.96 },
      ]
    ),
  },
  {
    id: 'e5055555-5555-4555-8555-555555555555',
    projectId: 'demo-1',
    title: 'The 2-Nanometer Myth: Why Gate All Around Changes Everything',
    hookSummary: 'Microscopy breakdown showing the atomic physics transition from FinFET to GAA transistors.',
    viralityScore: 87,
    scoreBreakdown: {
      hook: 88,
      flow: 86,
      topicRelevance: 87,
      reasoning: 'Crisp technical breakdown designed for enthusiastic tech audiences wanting real depth.',
    },
    startTime: 1540.0,
    endTime: 1579.0,
    duration: 39.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-05-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-05-final.mp4',
    socialPack: {
      title: 'Transistors Just Got Stacked in 3D 🔬',
      caption: 'When electrons start tunneling straight through silicon, you have to build channels like skyscrapers.',
      hashtags: ['#nanotech', '#physics', '#semiconductor', '#innovation', '#ai'],
    },
    createdAt: '2026-11-20T16:04:00Z',
    updatedAt: '2026-11-20T16:09:00Z',
    timelineDocument: createMockTimelineDoc(
      'e5055555-5555-4555-8555-555555555555',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'The 2-Nanometer Myth: Why Gate All Around Changes Everything',
      39.0,
      [
        { word: 'At', start: 0.0, end: 0.2, confidence: 0.99 },
        { word: 'two', start: 0.22, end: 0.5, confidence: 0.99 },
        { word: 'nanometers,', start: 0.52, end: 1.1, highlighted: true, confidence: 0.98 },
        { word: 'electrons', start: 1.15, end: 1.7, highlighted: true, confidence: 0.99 },
        { word: 'literally', start: 1.72, end: 2.15, confidence: 0.97 },
        { word: 'teleport', start: 2.18, end: 2.75, highlighted: true, confidence: 0.99 },
        { word: 'through', start: 2.78, end: 3.05, confidence: 0.98 },
        { word: 'walls.', start: 3.08, end: 3.55, highlighted: true, confidence: 0.97 },
      ]
    ),
  },
  {
    id: 'e6066666-6666-4666-8666-666666666666',
    projectId: 'demo-1',
    title: 'The Real Cost of 1 Second of Video Gen',
    hookSummary: 'Comparing diffusion transformer power demands against Bitcoin mining and search queries.',
    viralityScore: 85,
    scoreBreakdown: {
      hook: 87,
      flow: 85,
      topicRelevance: 83,
      reasoning: 'Shocking cost metric relatable to everyday creators using Sora or Kling.',
    },
    startTime: 2110.0,
    endTime: 2145.0,
    duration: 35.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'hormozi_pop',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#10B981',
      uppercase: true,
      fontSize: 48,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-06-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-06-final.mp4',
    socialPack: {
      title: 'How Much Power Does One Video Prompt Actually Burn? 🔥',
      caption: 'Every time you prompt high-res video, hundreds of watts turn directly into heat. Here is the math.',
      hashtags: ['#generativeai', '#videocreators', '#costofai', '#computecost', '#sora'],
    },
    createdAt: '2026-11-20T16:05:00Z',
    updatedAt: '2026-11-20T16:10:00Z',
    timelineDocument: createMockTimelineDoc(
      'e6066666-6666-4666-8666-666666666666',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'The Real Cost of 1 Second of Video Gen',
      35.0,
      [
        { word: 'That', start: 0.0, end: 0.22, confidence: 0.99 },
        { word: 'five-second', start: 0.25, end: 0.82, highlighted: true, confidence: 0.99 },
        { word: 'video', start: 0.85, end: 1.15, confidence: 0.99 },
        { word: 'you', start: 1.18, end: 1.32, confidence: 0.98 },
        { word: 'just', start: 1.35, end: 1.55, confidence: 0.99 },
        { word: 'generated', start: 1.58, end: 2.12, highlighted: true, confidence: 0.99 },
        { word: 'used', start: 2.15, end: 2.38, confidence: 0.98 },
        { word: 'more', start: 2.4, end: 2.65, confidence: 0.99 },
        { word: 'juice', start: 2.68, end: 3.0, highlighted: true, confidence: 0.97 },
        { word: 'than', start: 3.02, end: 3.2, confidence: 0.98 },
        { word: 'your', start: 3.22, end: 3.42, confidence: 0.99 },
        { word: 'fridge.', start: 3.45, end: 3.95, highlighted: true, confidence: 0.96 },
      ]
    ),
  },
  {
    id: 'e7077777-7777-4777-8777-777777777777',
    projectId: 'demo-1',
    title: 'Why On-Device AI Models Will Replace Cloud APIs',
    hookSummary: 'Demonstrating local 3B model quantized to 4-bits running at 60 tokens/sec on mobile silicon.',
    viralityScore: 82,
    scoreBreakdown: {
      hook: 84,
      flow: 83,
      topicRelevance: 79,
      reasoning: 'Privacy and zero latency angle is extremely compelling to mobile developers and creators.',
    },
    startTime: 2750.0,
    endTime: 2792.0,
    duration: 42.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'karaoke_box',
      position: 'bottom',
      primaryColor: '#FFFFFF',
      highlightColor: '#FBBF24',
      uppercase: false,
      fontSize: 48,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-07-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-07-final.mp4',
    socialPack: {
      title: 'Why Cloud AI Subscriptions Are About to Die 📱',
      caption: 'Your phone already has an 8-core NPU. Running intelligence locally is free, private, and instant.',
      hashtags: ['#ondeviceai', '#localllm', '#privacy', '#apple', '#android'],
    },
    createdAt: '2026-11-20T16:06:00Z',
    updatedAt: '2026-11-20T16:11:00Z',
    timelineDocument: createMockTimelineDoc(
      'e7077777-7777-4777-8777-777777777777',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Why On-Device AI Models Will Replace Cloud APIs',
      42.0,
      [
        { word: 'Stop', start: 0.0, end: 0.35, highlighted: true, confidence: 0.99 },
        { word: 'paying', start: 0.38, end: 0.75, highlighted: true, confidence: 0.98 },
        { word: 'twenty', start: 0.78, end: 1.15, confidence: 0.99 },
        { word: 'dollars', start: 1.18, end: 1.55, confidence: 0.99 },
        { word: 'a', start: 1.58, end: 1.68, confidence: 0.99 },
        { word: 'month', start: 1.7, end: 2.1, confidence: 0.98 },
        { word: 'for', start: 2.12, end: 2.3, confidence: 0.99 },
        { word: 'cloud', start: 2.32, end: 2.7, highlighted: true, confidence: 0.97 },
        { word: 'tokens.', start: 2.72, end: 3.25, confidence: 0.98 },
      ]
    ),
  },
  {
    id: 'e8088888-8888-4888-8888-888888888888',
    projectId: 'demo-1',
    title: 'The Day Silicon Replaced Human Sound Engineers',
    hookSummary: 'Real-time stems separation and acoustic balance demo comparing human mixing to 8ms neural DSP.',
    viralityScore: 79,
    scoreBreakdown: {
      hook: 80,
      flow: 78,
      topicRelevance: 79,
      reasoning: 'Impressive audio before/after hook; appeals to creators and podcast producers.',
    },
    startTime: 3310.0,
    endTime: 3348.0,
    duration: 38.0,
    aspectRatio: '9:16',
    captionStyle: {
      preset: 'clean_minimal',
      position: 'center',
      primaryColor: '#F4F4F5',
      highlightColor: '#6366F1',
      uppercase: false,
      fontSize: 44,
    },
    reframeMode: 'auto',
    status: 'READY',
    renderedS3Key: 'renders/a0ee/clip-08-final.mp4',
    renderedUrl: 'https://assets.frameflow.dev/renders/clip-08-final.mp4',
    socialPack: {
      title: 'Studio Quality Audio From a Coffee Shop? 🎙️',
      caption: 'Background espresso machines, chatter, reverb... erased in 8 milliseconds. Audio engineering changed forever.',
      hashtags: ['#podcastlife', '#sounddesign', '#audioproduction', '#creators', '#aiengine'],
    },
    createdAt: '2026-11-20T16:07:00Z',
    updatedAt: '2026-11-20T16:12:00Z',
    timelineDocument: createMockTimelineDoc(
      'e8088888-8888-4888-8888-888888888888',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'The Day Silicon Replaced Human Sound Engineers',
      38.0,
      [
        { word: 'Listen', start: 0.0, end: 0.42, highlighted: true, confidence: 0.99 },
        { word: 'to', start: 0.45, end: 0.62, confidence: 0.99 },
        { word: 'this', start: 0.65, end: 0.95, confidence: 0.98 },
        { word: 'background', start: 0.98, end: 1.55, confidence: 0.97 },
        { word: 'noise.', start: 1.58, end: 2.1, confidence: 0.98 },
        { word: 'Now', start: 2.2, end: 2.5, highlighted: true, confidence: 0.99 },
        { word: 'watch', start: 2.52, end: 2.85, confidence: 0.98 },
        { word: 'it', start: 2.88, end: 3.02, confidence: 0.99 },
        { word: 'completely', start: 3.05, end: 3.65, highlighted: true, confidence: 0.99 },
        { word: 'vanish.', start: 3.68, end: 4.25, highlighted: true, confidence: 0.97 },
      ]
    ),
  },
];

// ==========================================
// 3. BRAND KIT MOCK DATA
// ==========================================

export const MOCK_BRAND_KIT: BrandKitResponse = {
  id: 'bk-99999999-9999-4999-8999-999999999999',
  projectId: 'demo-1',
  primaryColor: '#FFFFFF',
  highlightColor: '#10B981',
  fontFamily: 'Inter',
  captionPreset: 'hormozi_pop',
  captionPosition: 'bottom',
  logoUrl: 'https://assets.frameflow.dev/branding/frameflow-watermark.svg',
  logoPosition: 'top_right',
  logoScale: 0.15,
  createdAt: '2026-11-19T14:22:00Z',
  updatedAt: '2026-11-20T17:30:00Z',
};

// ==========================================
// 4. EXPORTS MOCK DATA
// ==========================================

export type ExportStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ExportItem {
  id: string;
  projectId: string;
  clipId: string;
  clipTitle: string;
  resolution: string;
  fps: number;
  format: 'mp4' | 'mov' | 'webm';
  status: ExportStatus;
  progress: number; // 0 - 100
  fileSizeMb?: number;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  aspectRatio: string;
  durationSec?: number;
  aiTitle?: string;
  hashtags?: string[];
}

export const MOCK_EXPORTS: ExportItem[] = [
  {
    id: 'exp-01',
    projectId: 'demo-1',
    clipId: 'e1011111-1111-4111-8111-111111111111',
    clipTitle: 'Why 99% of AI Chips Will Be Obsolete in 18 Months',
    resolution: '1080x1920',
    fps: 30,
    format: 'mp4',
    status: 'COMPLETED',
    progress: 100,
    fileSizeMb: 42.4,
    durationSec: 38,
    downloadUrl: 'https://assets.frameflow.dev/renders/clip-01-final.mp4',
    createdAt: '2026-11-20T17:10:00Z',
    completedAt: '2026-11-20T17:11:24Z',
    aspectRatio: '9:16',
    aiTitle: 'The $100 Billion AI Hardware Trap Nobody Is Warning You About 🤯',
    hashtags: ['#AIHardware', '#NVIDIA', '#Semiconductors', '#TechPodcast', '#FutureTech', '#SiliconValley'],
  },
  {
    id: 'exp-02',
    projectId: 'demo-1',
    clipId: 'e2022222-2222-4222-8222-222222222222',
    clipTitle: 'The Secret Power Constraint Silicon Valley Won’t Discuss',
    resolution: '1080x1920',
    fps: 30,
    format: 'mp4',
    status: 'COMPLETED',
    progress: 100,
    fileSizeMb: 48.1,
    durationSec: 44,
    downloadUrl: 'https://assets.frameflow.dev/renders/clip-02-final.mp4',
    createdAt: '2026-11-20T17:15:00Z',
    completedAt: '2026-11-20T17:16:40Z',
    aspectRatio: '9:16',
    aiTitle: 'Data Centers Are Secretly Running Out Of Electricity (Here is Why) ⚡',
    hashtags: ['#DataCenter', '#EnergyCrisis', '#TechNews', '#NuclearEnergy', '#CleanTech'],
  },
  {
    id: 'exp-03',
    projectId: 'demo-1',
    clipId: 'e3033333-3333-4333-8333-333333333333',
    clipTitle: 'Why Analog Computing Beats Digital for Neural Nets',
    resolution: '1080x1920',
    fps: 30,
    format: 'mp4',
    status: 'PROCESSING',
    progress: 68,
    durationSec: 32,
    createdAt: '2026-11-20T23:40:00Z',
    aspectRatio: '9:16',
    aiTitle: 'Physics Just Solved the Biggest Flaw in Digital Computers 🧬',
    hashtags: ['#QuantumComputing', '#Physics', '#ComputerScience', '#FutureOfAI'],
  },
  {
    id: 'exp-04',
    projectId: 'demo-1',
    clipId: 'e4044444-4444-4444-8444-444444444444',
    clipTitle: 'How TSMC Won the Global Monopoly on Advanced Chips',
    resolution: '1080x1920',
    fps: 30,
    format: 'mp4',
    status: 'QUEUED',
    progress: 0,
    durationSec: 51,
    createdAt: '2026-11-20T23:42:00Z',
    aspectRatio: '9:16',
    aiTitle: 'The 3-Nanometer Island Guarding the Entire Global Economy 🌐',
    hashtags: ['#TSMC', '#Taiwan', '#Geopolitics', '#Hardware', '#Economics'],
  },
];

// ==========================================
// 5. AI PROVIDERS MOCK DATA
// ==========================================

export interface AIProviderConfig {
  id: string;
  name: string;
  category: 'Transcription' | 'LLM Analysis' | 'Voiceover' | 'Vision & Framing';
  model: string;
  status: 'connected' | 'not_configured' | 'error';
  apiKeyMasked?: string;
  latencyMs: number;
  costPerMin?: string;
  description: string;
}

export const MOCK_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'prov-openai-whisper',
    name: 'OpenAI Whisper v3 Large',
    category: 'Transcription',
    model: 'whisper-large-v3-turbo',
    status: 'connected',
    apiKeyMasked: 'sk-proj-...8a7F',
    latencyMs: 140,
    costPerMin: '$0.006 / min',
    description: 'Word-level timestamp precision with automatic punctuation, disfluency filtering, and 99+ language support.',
  },
  {
    id: 'prov-deepgram',
    name: 'Deepgram Nova-2',
    category: 'Transcription',
    model: 'nova-2-general',
    status: 'connected',
    apiKeyMasked: 'dg-live-...994b',
    latencyMs: 78,
    costPerMin: '$0.0043 / min',
    description: 'Ultra-fast speech-to-text with conversational diarization and real-time streaming audio ingestion.',
  },
  {
    id: 'prov-gemini-pro',
    name: 'Google Gemini 1.5 Pro',
    category: 'LLM Analysis',
    model: 'gemini-1.5-pro-002',
    status: 'connected',
    apiKeyMasked: 'AIzaSy...Xk90',
    latencyMs: 310,
    costPerMin: '$0.002 / 1k tokens',
    description: '2M token multimodal context window analyzing full video audio and frame semantics for hook detection and virality scoring.',
  },
  {
    id: 'prov-anthropic',
    name: 'Anthropic Claude 3.5 Sonnet',
    category: 'LLM Analysis',
    model: 'claude-3-5-sonnet-20241022',
    status: 'connected',
    apiKeyMasked: 'sk-ant-api...339A',
    latencyMs: 290,
    costPerMin: '$0.003 / 1k tokens',
    description: 'High-reasoning prompt generator for hook rewriting, dynamic viral title creation, and SEO hashtags.',
  },
  {
    id: 'prov-elevenlabs',
    name: 'ElevenLabs Voice Engine',
    category: 'Voiceover',
    model: 'multilingual-v2',
    status: 'connected',
    apiKeyMasked: 'xi-api-...4aB2',
    latencyMs: 220,
    costPerMin: '$0.15 / 1k chars',
    description: 'Ultra-realistic voice synthesis and voice cloning for AI intro hooks, voice dubbing, and narrative stitch.',
  },
  {
    id: 'prov-yolo-reframe',
    name: 'MediaPipe & YOLOv8 Face Tracking',
    category: 'Vision & Framing',
    model: 'yolov8n-face-onnx',
    status: 'connected',
    apiKeyMasked: 'Local ONNX Engine',
    latencyMs: 18,
    costPerMin: 'Local GPU / Free',
    description: 'Real-time face detection and active speaker tracking to dynamically reframe 16:9 landscape to 9:16 vertical shorts.',
  },
];

// ==========================================
// 6. BYOK (BRING YOUR OWN KEY) AI PROVIDERS
// ==========================================

export interface BYOKProvider {
  id: string;
  name: string;
  badge: string;
  category: 'Fast Whisper & LLM' | 'Multimodal AI' | 'Free Model Router' | 'GitHub Compute' | 'Local Inference';
  description: string;
  apiKeyPlaceholder: string;
  apiKey: string;
  models: { id: string; name: string }[];
  selectedModel: string;
  latencyMs: number;
  costNote: string;
  status: 'connected' | 'not_configured' | 'error';
}

export const MOCK_BYOK_PROVIDERS: BYOKProvider[] = [
  {
    id: 'byok-groq',
    name: 'Groq Cloud',
    badge: 'Free Whisper + LPU',
    category: 'Fast Whisper & LLM',
    description: 'Lightning-speed LPU inference delivering Whisper transcription in ~120ms and instant 70B parameter hook discovery.',
    apiKeyPlaceholder: 'gsk_...',
    apiKey: 'gsk_prod_9941aB88xQ...',
    models: [
      { id: 'whisper-large-v3-turbo', name: 'Whisper Large v3 Turbo (Transcription)' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Hook Discovery)' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Context Routing)' },
    ],
    selectedModel: 'whisper-large-v3-turbo',
    latencyMs: 42,
    costNote: 'Free Tier (30 Requests / Min)',
    status: 'connected',
  },
  {
    id: 'byok-google-ai',
    name: 'Google AI Studio',
    badge: 'Gemini Free Tier',
    category: 'Multimodal AI',
    description: 'Generous free tier with 2M token context window, natively analyzing long video frames and audio timestamps.',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKey: 'AIzaSyBNm88x...',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Super Fast Multimodal)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Hook Reasoning)' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' },
    ],
    selectedModel: 'gemini-1.5-flash',
    latencyMs: 165,
    costNote: 'Free Tier (15 RPM / 1M Tokens/Min)',
    status: 'connected',
  },
  {
    id: 'byok-openrouter',
    name: 'OpenRouter Free Models',
    badge: ':free Router',
    category: 'Free Model Router',
    description: 'Access community & sponsor-subsidized open models with zero credit card required.',
    apiKeyPlaceholder: 'sk-or-v1-...',
    apiKey: 'sk-or-v1-99af33...',
    models: [
      { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (:free)' },
      { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (:free)' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (:free)' },
    ],
    selectedModel: 'google/gemini-2.0-flash-thinking-exp:free',
    latencyMs: 210,
    costNote: '100% Free / Subsidized',
    status: 'connected',
  },
  {
    id: 'byok-github-models',
    name: 'GitHub Models',
    badge: 'GitHub Marketplace',
    category: 'GitHub Compute',
    description: 'Use your GitHub Personal Access Token (PAT) to call frontier and open models on Microsoft Azure infrastructure.',
    apiKeyPlaceholder: 'ghp_... or github_pat_...',
    apiKey: 'ghp_44aBc88921...',
    models: [
      { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini (GitHub)' },
      { id: 'meta-llama-3.1-70b', name: 'Meta Llama 3.1 70B (GitHub)' },
      { id: 'phi-3.5-mini-instruct', name: 'Microsoft Phi 3.5 Mini (GitHub)' },
    ],
    selectedModel: 'gpt-4o-mini',
    latencyMs: 145,
    costNote: 'Free via GitHub Developer Account',
    status: 'connected',
  },
  {
    id: 'byok-ollama',
    name: 'Local Ollama',
    badge: '100% Private / Local GPU',
    category: 'Local Inference',
    description: 'Self-hosted local runner on http://localhost:11434. Zero latency fee, zero data leaves your machine.',
    apiKeyPlaceholder: 'http://localhost:11434',
    apiKey: 'http://localhost:11434',
    models: [
      { id: 'llama3.2:latest', name: 'Ollama Llama 3.2 (Local)' },
      { id: 'qwen2.5:7b', name: 'Ollama Qwen 2.5 7B (Local)' },
      { id: 'mistral:latest', name: 'Ollama Mistral (Local)' },
    ],
    selectedModel: 'llama3.2:latest',
    latencyMs: 12,
    costNote: 'Completely Free / Unlimited Local VRAM',
    status: 'connected',
  },
];
