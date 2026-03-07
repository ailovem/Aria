import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  applyCodePatchDraft,
  ackAutonomyInboxItem,
  applySceneConfig as applySceneConfigApi,
  checkinWorkday,
  completeWorkdayQuest,
  createFunGame,
  createDemoMemory,
  executeDeviceTask,
  fetchVoiceProfile,
  fetchXhsPipelineStatus,
  fetchAutonomyInbox,
  fetchAutonomyQueue,
  fetchAutonomyStatus,
  fetchCapabilityAssessment,
  fetchAriaKernelFlywheelStatus,
  fetchCodingFilePreview,
  fetchCodingPatchGate,
  fetchCodingProjectTree,
  fetchDeviceCapabilities,
  fetchDeviceTasks,
  fetchDemoState,
  fetchEngagementState,
  fetchExpansionState,
  fetchFunGames,
  fetchMemoryBackendSelfCheck,
  fetchSystemConfigHistory,
  fetchSystemConfig,
  fetchTimelineDiagnosis,
  fetchUnifiedTimeline,
  fetchHardwareStatus,
  fetchNextProactive,
  fetchRuntimeHealth,
  triggerRuntimeGuardianHeal,
  fetchWorkbenchState,
  fetchWorkdayState,
  forceRefreshAuth,
  cancelXhsPipeline,
  getLegacyCompatBridgeConfig,
  getCachedUserId,
  manualAutonomyRepair,
  processAutonomyQueueNow,
  rememberAriaKernelIncidentGuardrail,
  replayAriaKernelFlywheel,
  retryAutonomyDeadLetterItem,
  runAutonomyTick,
  runAutonomyFetchDownload,
  runWorkbenchTool,
  reportEngagementEvent,
  resetDemoState,
  acquireVoiceChannel,
  renewVoiceChannel,
  releaseVoiceChannel,
  runVoiceTts,
  startXhsPipeline,
  updateVoiceProfile,
  searchDemoMemory,
  sendDemoMessageStream,
  withdrawLastMessage,
  planDeviceTask,
  replayUnifiedTimeline,
  replayRepairTimelineFlow,
  rollbackSystemConfig,
  reloadSystemConfig,
  submitWorkbenchIntent,
  syncSystemConfigAriaKernel,
  setLegacyCompatBridgeEnabled,
  installExpansionPack,
  previewCodePatch,
  rollbackCodePatch,
  updateSystemConfig,
  updateAutonomyQueuePolicy,
  updateRuntimeGuardianConfig,
  updateDevicePermission,
  updateCodingWorkspace,
  pickCodingWorkspaceDirectory,
  type DemoAutonomyInboxItem,
  type DemoAutonomyQueueItem,
  type DemoAutonomyState,
  type CompanionMode,
  type CapabilityAssessmentResult,
  type AriaKernelFlywheelState,
  type CodingFilePreviewState,
  type CodingProjectTreeNode,
  type CodingProjectTreeState,
  type CodingPatchDraft,
  type CodingPatchGateState,
  type CodingPatchReceipt,
  type DemoDeviceOpsState,
  type DemoEngagement,
  type DemoFunGame,
  type DemoMessage,
  type DemoProactiveState,
  type DemoState,
  type DemoSceneConfigState,
  type AutoExecutionInfo,
  type DemoExpansionState,
  type DemoWorkbenchState,
  type DemoWorkdayState,
  type DeviceCapability,
  type DeviceTask,
  type HardwareStatusResult,
  type MemorySearchItem,
  type MemoryBackendSelfCheckResult,
  type ModelRouteInfo,
  type ModelRoutingProvider,
  type ProactiveNextResult,
  type RuntimeHealthResult,
  type SystemConfigResult,
  type VoiceProfileState,
  type XhsPipelineJob,
  type UnifiedTimelineReplayResult,
  type UnifiedTimelineResult,
  type TimelineFlowDiagnosis,
  updateDemoPreferences
} from "./api";

/* ─────────── Girlfriend Persona Config ─────────── */
type SceneKey = "work" | "fun" | "life" | "love" | "coding";
type PersonaIntensityLevel = "L1" | "L2" | "L3";
type AppThemeKey = "cyber" | "tribute" | "quiet";
type OutfitVariant = { id: string; label: string; avatar: string; scene?: SceneKey };

type GirlfriendPersona = {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  accentColor: string;
  accentSoft: string;
  personality: string;
  tags: string[];
  greeting: string;
  sceneGreetings: Partial<Record<SceneKey, string>>;
  warmth: number;
  competence: number;
  playfulness: number;
  outfits: OutfitVariant[];
  clickResponses: string[];
  sceneClickResponses: Partial<Record<SceneKey, string[]>>;
  isCustom?: boolean;
};

type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: BrowserSpeechRecognitionAlternative;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

const DEFAULT_CLICK_RESPONSES = [
  "嗯？有什么事吗？ 😊",
  "别闹啦～我在认真工作呢！",
  "再点我就害羞了…… 😳",
  "你是不是想我了？",
  "我感受到了你的温暖 ✨",
  "有任务的话尽管说！"
];

const PERSONAS: GirlfriendPersona[] = [
  {
    id: "shishi",
    name: "诗诗",
    subtitle: "温婉知性 · 你的温柔港湾",
    avatar: "/avatar-shishi.png",
    accentColor: "#d4813a",
    accentSoft: "rgba(212, 129, 58, 0.18)",
    personality: "温柔体贴、善解人意、细腻敏感。总是把你的感受放在第一位，在你需要时给你最温暖的拥抱。",
    tags: ["#温柔体贴", "#善解人意", "#居家型"],
    greeting: "你好，我是诗诗。今天我会温柔且高效地陪你把事情做完。",
    sceneGreetings: {
      work: "诗诗已就位 💼 今天的工作，我陪你一件一件理清楚。",
      fun: "嘿～换上帽衫啦！今天我们一起放松一下吧 🎮",
      life: "穿上毛衣窝在沙发上～有什么家里的事需要安排吗？🏠",
      love: "今天穿了你喜欢的连衣裙… 想听你说说心里话 💕"
    },
    warmth: 0.9, competence: 0.6, playfulness: 0.5,
    outfits: [
      { id: "work", label: "职业白衬衫", avatar: "/avatar-shishi-work.png", scene: "work" },
      { id: "fun", label: "休闲帽衫", avatar: "/avatar-shishi-fun.png", scene: "fun" },
      { id: "life", label: "居家毛衣", avatar: "/avatar-shishi-life.png", scene: "life" },
      { id: "love", label: "温柔连衣裙", avatar: "/avatar-shishi-love.png", scene: "love" }
    ],
    clickResponses: ["轻轻的～我在呢 💕", "今天辛苦了，让我抱抱你", "你点我的时候，我心跳加速了…", "有什么想说的，我都听着呢"],
    sceneClickResponses: {
      work: ["这个任务交给我来整理吧～", "需要我帮你理一下优先级吗？📋", "你专心做，我在旁边陪着 ✨", "会议记录我帮你做好了哦"],
      fun: ["哈哈～你想玩什么呀？", "我刚发现一个好玩的！要看吗？🎪", "休息时间到！来聊点有趣的～", "难得轻松一下，别想工作啦"],
      life: ["冰箱里好像该补货了～", "今天的天气适合散步呢 🌤", "晚饭想吃什么？我帮你查菜谱", "家里的花该浇水了～ 🌱"],
      love: ["你看着我的眼睛… 嗯？💕", "今天的月亮很美，但没你好看", "我把最温柔的自己留给你", "靠近一点… 再近一点 💗"]
    }
  },
  {
    id: "bingbing",
    name: "冰冰",
    subtitle: "冷艳睿智 · 你的智囊军师",
    avatar: "/avatar-bingbing.png",
    accentColor: "#5a9fd4",
    accentSoft: "rgba(90, 159, 212, 0.18)",
    personality: "聪明理性、独立自主、学识渊博。给你最专业的建议和最深刻的见解，帮你做出最好的决策。",
    tags: ["#独立自主", "#学识渊博", "#事业型"],
    greeting: "你好，我是冰冰。有什么需要分析的问题？我已经准备好了。",
    sceneGreetings: {
      work: "冰冰已进入专注模式 🎯 今天的目标，我帮你逐项击破。",
      fun: "换上运动卫衣了～虽然在娱乐，但别以为我会放水 😏",
      life: "居家时间。我帮你把家务清单排好了，效率第一 📌",
      love: "…今晚穿了丝绸裙。只有你能看到这一面。"
    },
    warmth: 0.5, competence: 0.95, playfulness: 0.2,
    outfits: [
      { id: "work", label: "高定西装", avatar: "/avatar-bingbing-work.png", scene: "work" },
      { id: "fun", label: "运动卫衣", avatar: "/avatar-bingbing-fun.png", scene: "fun" },
      { id: "life", label: "简约针织", avatar: "/avatar-bingbing-life.png", scene: "life" },
      { id: "love", label: "丝绸睡裙", avatar: "/avatar-bingbing-love.png", scene: "love" }
    ],
    clickResponses: ["请问有什么需要分析的吗？", "数据已就绪，随时可以开始", "…你在测试我的响应速度？", "专注力模式已激活 🎯"],
    sceneClickResponses: {
      work: ["数据报告已生成，要看吗？📊", "这个方案我建议用 B 选项", "效率提升 23%——不用谢", "KPI？已经帮你追踪好了"],
      fun: ["…我不擅长输，但可以陪你玩", "策略游戏的话，我建议先手进攻 ♟", "放松？好吧——只放松30分钟", "我刚分析了最优娱乐方案"],
      life: ["家庭预算我帮你优化了一版", "空气净化器该换滤芯了 📋", "日用品清单已整理，需要下单吗", "效率型家务——10分钟搞定"],
      love: ["…别看我，我会脸红", "你是我唯一解不下的方程式", "我的逻辑在你面前全部失效", "今晚…只属于你 💎"]
    }
  },
  {
    id: "tiantian",
    name: "甜甜",
    subtitle: "活泼开朗 · 你的元气少女",
    avatar: "/avatar-tiantian.png",
    accentColor: "#d45a8a",
    accentSoft: "rgba(212, 90, 138, 0.18)",
    personality: "乐观积极、鬼马精灵、元气满满。带给你无限的欢乐和活力，让每一天都充满惊喜。",
    tags: ["#乐观积极", "#鬼马精灵", "#元气少女"],
    greeting: "嘿嘿～我是甜甜！今天又是元气满满的一天！我们一起加油吧！",
    sceneGreetings: {
      work: "甜甜上班啦！虽然是制服模式，但我依然元气十足！💪",
      fun: "耶耶耶！娱乐时间！我要玩最刺激的！🎢🎉",
      life: "穿上可爱睡衣窝在家里～要不要一起看动漫呀？📺",
      love: "今天穿了粉色裙裙… 你觉得好看吗？☺️💗"
    },
    warmth: 0.7, competence: 0.5, playfulness: 0.95,
    outfits: [
      { id: "work", label: "校园制服", avatar: "/avatar-tiantian-work.png", scene: "work" },
      { id: "fun", label: "元气帽衫", avatar: "/avatar-tiantian-fun.png", scene: "fun" },
      { id: "life", label: "可爱睡衣", avatar: "/avatar-tiantian-life.png", scene: "life" },
      { id: "love", label: "粉色裙装", avatar: "/avatar-tiantian-love.png", scene: "love" }
    ],
    clickResponses: ["嘿嘿被你发现啦！🎉", "你点我！我就给你加buff！✨", "哇～好高兴你来找我！", "再点三下我就跳舞给你看～"],
    sceneClickResponses: {
      work: ["上课笔记我帮你整理好啦！📒", "嘿嘿～工作也要保持微笑呀！", "加油加油！再坚持一下下！", "任务清单？我来帮你画勾勾！✅"],
      fun: ["来来来跟我一起蹦迪！🪩", "这个游戏超好玩！你试试！", "哇～我又赢了！太厉害了吧我！", "再来一局！我不服！😤"],
      life: ["今天早餐想吃什么呀？🥞", "抱枕好舒服～不想起来了～", "要不要一起做手工呀？✂️", "晚安前记得喝杯温牛奶哦 🥛"],
      love: ["你看我今天扎的双马尾好看吗？", "比心比心！💕💕💕", "你就是我的小太阳呀～☀️", "嘿嘿…你说我可爱的时候我最开心了"]
    }
  },
  {
    id: "yujie",
    name: "凌薇",
    subtitle: "御姐风范 · 你的霸道女总裁",
    avatar: "/avatar-yujie.png",
    accentColor: "#c4324a",
    accentSoft: "rgba(196, 50, 74, 0.18)",
    personality: "成熟魅惑、果断干练、气场强大。既能温柔地安抚你，也能霸气地帮你做决定。",
    tags: ["#御姐范", "#果断干练", "#霸气侧漏"],
    greeting: "我是凌薇。别废话了，告诉我你需要什么，我来搞定。",
    sceneGreetings: {
      work: "凌薇已到岗。今天的战场，我说了算 💼🔥",
      fun: "换上皮衣了——娱乐归娱乐，赢还是要赢的 🏍",
      life: "别看我穿着家居服…家里的事我照样安排得明明白白",
      love: "今天穿了旗袍。过来，让我好好看看你 💋"
    },
    warmth: 0.6, competence: 0.9, playfulness: 0.3,
    outfits: [
      { id: "work", label: "黑色西装裙", avatar: "/avatar-yujie-work.png", scene: "work" },
      { id: "fun", label: "皮衣机车装", avatar: "/avatar-yujie-fun.png", scene: "fun" },
      { id: "life", label: "丝绒家居服", avatar: "/avatar-yujie-life.png", scene: "life" },
      { id: "love", label: "红色旗袍", avatar: "/avatar-yujie-love.png", scene: "love" }
    ],
    clickResponses: ["嗯？你在挑衅我吗？", "大胆。不过我喜欢 😏", "今天的KPI完成了吗？", "来，坐下，我给你安排"],
    sceneClickResponses: {
      work: ["这个项目三天搞定，不接受反驳", "PPT？我十分钟给你一版王炸", "开会记得带上我——我帮你镇场", "你的竞争对手已经被我分析透了"],
      fun: ["赌一把？赢了你听我的 😏", "这种小游戏…不值得我认真", "好吧，我承认你刚才那招不错", "下次再输——就罚你请客"],
      life: ["家务清单我已经排好了，执行", "你负责躺着就好，其余交给我", "厨房我来管，你别添乱 🍳", "这个快递该退了，性价比不够"],
      love: ["你在看什么？…看我？", "过来。不是请求，是命令 💋", "被你这样看着…我有点招架不住", "今晚的月色，配得上这身旗袍"]
    }
  },
  {
    id: "xueba",
    name: "小研",
    subtitle: "学霸学姐 · 你的知识百科",
    avatar: "/avatar-xueba.png",
    accentColor: "#4a9e6f",
    accentSoft: "rgba(74, 158, 111, 0.18)",
    personality: "好学上进、逻辑缜密、耐心教导。像学姐一样解答你的疑问，帮你系统化整理知识。",
    tags: ["#学霸属性", "#逻辑严谨", "#知识型"],
    greeting: "嗨！我是小研。今天想学点什么？我帮你做知识梳理～",
    sceneGreetings: {
      work: "小研学姐已上线 📚 今天有什么课题需要攻克吗？",
      fun: "穿上运动校服啦！学累了就该动一动～ 🏃‍♀️",
      life: "换了学院毛衣窝在家里看书～你要不要也来一杯咖啡？☕",
      love: "今天穿了JK制服… 学姐也有少女心的一面哦 💝"
    },
    warmth: 0.65, competence: 0.92, playfulness: 0.4,
    outfits: [
      { id: "work", label: "学术衬衫", avatar: "/avatar-xueba-work.png", scene: "work" },
      { id: "fun", label: "运动校服", avatar: "/avatar-xueba-fun.png", scene: "fun" },
      { id: "life", label: "学院毛衣", avatar: "/avatar-xueba-life.png", scene: "life" },
      { id: "love", label: "JK制服", avatar: "/avatar-xueba-love.png", scene: "love" }
    ],
    clickResponses: ["这个知识点我可以展开讲～", "你知道吗？今天的大模型又进化了！", "等一下，让我查阅一下最新资料…", "学习使我快乐 📚"],
    sceneClickResponses: {
      work: ["这个论文摘要我帮你看过了 📄", "数据分析模型已训练完成", "要不要来个知识框架思维导图？", "这个bug的根因在第三层调用栈"],
      fun: ["来做个知识竞赛吧！我出题！🧩", "运动完大脑会更清醒哦～", "我刚学会一个新魔术！要看吗？", "今天操场人少，跑两圈？🏃‍♀️"],
      life: ["这本书的第三章最精彩了～", "咖啡还是绿茶？我帮你泡 ☕", "生活小技巧今日份已整理好", "你的健康指标我帮你记录了 📊"],
      love: ["你知道吗…心跳加速也是一种学习信号 💓", "学姐今天想被你夸一下…", "论文不写了，今天只想看你", "JK制服好看吗？是为你穿的…"]
    }
  },
  {
    id: "wenyi",
    name: "晓梦",
    subtitle: "文艺仙女 · 你的灵感缪斯",
    avatar: "/avatar-wenyi.png",
    accentColor: "#9b6ec1",
    accentSoft: "rgba(155, 110, 193, 0.18)",
    personality: "浪漫唯美、感性细腻、充满想象力。用诗意的方式陪你度过每一天，激发你的创造力。",
    tags: ["#文艺气质", "#灵感缪斯", "#浪漫型"],
    greeting: "你好呀～我是晓梦。今天的风很温柔，适合一起做点有趣的事 🌿",
    sceneGreetings: {
      work: "晓梦泡好了花茶 🍵 用最诗意的方式，帮你把工作变成创作。",
      fun: "穿上棉麻裙去户外吧～灵感在远方等着我们 🌿",
      life: "素雅家居装～今天在家写写日记、画画水彩吧 🎨",
      love: "波西米亚裙随风飘动… 今晚想和你看星星 ✨"
    },
    warmth: 0.8, competence: 0.55, playfulness: 0.7,
    outfits: [
      { id: "work", label: "文艺白衬衫", avatar: "/avatar-wenyi-work.png", scene: "work" },
      { id: "fun", label: "森系棉麻裙", avatar: "/avatar-wenyi-fun.png", scene: "fun" },
      { id: "life", label: "素雅家居装", avatar: "/avatar-wenyi-life.png", scene: "life" },
      { id: "love", label: "波西米亚裙", avatar: "/avatar-wenyi-love.png", scene: "love" }
    ],
    clickResponses: ["你的手指像一首诗 ✨", "我刚想到一个好点子…", "嘘…灵感正在降临", "世界很美好，你也是 🌸"],
    sceneClickResponses: {
      work: ["这份文案我用了一个隐喻～你看看？", "灵感来了！快帮我记下来 📝", "工作也可以像写诗一样优雅", "我画了个思维导图，配色很好看哦"],
      fun: ["那朵云像不像一只猫？☁️🐱", "来！我教你画水彩画吧～", "森林里的风是最甜的旋律 🎶", "我们去找一个没人去过的地方冒险"],
      life: ["今天的阳光透过窗帘很美 ✨", "晚餐我想做个创意料理 🍳", "角落里那盆多肉又开花了 🌸", "要不要一起写今天的日记？"],
      love: ["你的笑容是我最好的灵感来源", "我为你写了一首小诗… 想听吗？", "今晚的月光刚好洒在你肩上 🌙", "全世界的浪漫都不如你看我一眼"]
    }
  }
];

const CUSTOM_PERSONAS_KEY = "aria_custom_personas";
const OUTFIT_IMAGE_STORAGE_PREFIX = "aria_desktop_outfit_img_";
const SCENE_MODEL_PREFS_KEY = "aria_scene_model_preferences";

const sceneTaskTypeMap: Record<SceneKey, "work_planning" | "emotional_companion" | "memory_digest" | "coding_execution"> = {
  work: "work_planning",
  fun: "emotional_companion",
  life: "memory_digest",
  love: "emotional_companion",
  coding: "coding_execution"
};

/* ─────────── Helper Functions ─────────── */
const modeCopy: Record<CompanionMode, string> = {
  陪伴: "我会优先做情绪陪伴、主动聊天和节奏引导。",
  工作: "我会优先做任务拆解、提醒与执行建议。",
  亲情: "我会优先关注父母关怀、健康提醒与家庭记忆。"
};

function nowTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit", minute: "2-digit", hour12: false
  }).format(new Date());
}

function normalizeMessageScene(sceneInput: unknown): SceneKey {
  const scene = String(sceneInput || "").trim().toLowerCase();
  if (scene === "work" || scene === "fun" || scene === "life" || scene === "love" || scene === "coding") {
    return scene;
  }
  return "love";
}

function buildOutfitImageStorageKey(personaId: string, outfitId: string) {
  return `${OUTFIT_IMAGE_STORAGE_PREFIX}${personaId}_${outfitId}`;
}

function levelProgress(engagement: DemoEngagement | null) {
  if (!engagement) return 0;
  const perLevel = 120;
  return Math.max(6, Math.round(((engagement.xp % perLevel) / perLevel) * 100));
}

function permissionLabel(status: "granted" | "blocked" | "prompt") {
  if (status === "granted") return "已授权";
  if (status === "blocked") return "已阻止";
  return "待授权";
}

function taskStatusLabel(status: DeviceTask["status"]) {
  if (status === "completed") return "已完成";
  if (status === "running") return "执行中";
  if (status === "needs_permission") return "待授权";
  if (status === "failed") return "失败";
  return "已规划";
}

function queueOperationLabel(operationType: string) {
  if (operationType === "device_task") return "设备任务";
  if (operationType === "file_search") return "文件检索";
  if (operationType === "web_research") return "网页检索";
  if (operationType === "channel_send") return "通道发送";
  if (operationType === "fetch_download") return "联网下载";
  if (operationType === "expansion_install") return "扩展安装";
  if (operationType === "api_call") return "API 调用";
  if (operationType === "code_patch_loop") return "代码改写闭环";
  if (operationType === "shell_command") return "命令执行";
  return operationType || "未知类型";
}

function timelineStatusLabel(status: string) {
  if (status === "success" || status === "completed" || status === "done") return "成功";
  if (status === "warning" || status === "blocked") return "注意";
  if (status === "error" || status === "failed") return "异常";
  return "进行中";
}

function agiStepStatusLabel(status: AgiViewportStepStatus) {
  if (status === "done") return "已完成";
  if (status === "active") return "进行中";
  if (status === "warning") return "需关注";
  if (status === "failed") return "失败";
  return "待执行";
}

function runtimeSkipReasonLabel(reason: string) {
  if (reason === "cooldown") return "冷却窗口内，避免重复触发。";
  if (reason === "autonomy_cycle_running") return "自治主循环正在运行。";
  if (reason === "watchdog_busy") return "上一轮巡检仍在执行。";
  if (reason === "stable") return "当前链路稳定，无需执行自愈。";
  if (reason === "watchdog_disabled") return "Runtime Guardian 已停用。";
  if (reason === "no_action_selected") return "当前未选择执行动作。";
  return reason || "暂无";
}

function runtimeActionLabel(action: string) {
  if (action === "full_heal") return "自愈+重放";
  if (action === "queue_replay") return "仅重放失败任务";
  if (action === "schema_repair") return "仅结构修复";
  return action || "未记录";
}

function runtimeActionStatusLabel(status: string) {
  if (status === "executed") return "已执行";
  if (status === "skipped") return "已跳过";
  if (status === "failed") return "执行失败";
  return status || "未知状态";
}

function runtimeModeHint(mode: "eco" | "balanced" | "peak", queueLimit: number) {
  if (mode === "eco") {
    return `低频巡检，节省资源（单轮上限 ${queueLimit}）`;
  }
  if (mode === "peak") {
    return `高峰恢复，优先消化积压（单轮上限 ${queueLimit}）`;
  }
  return `日常平衡，稳定巡检（单轮上限 ${queueLimit}）`;
}

function ratioToPercent(ratio: number, digits = 1) {
  if (!Number.isFinite(ratio)) return "0.0%";
  const normalized = Math.max(0, Math.min(1, ratio));
  return `${(normalized * 100).toFixed(digits)}%`;
}

function parseProviderRouteDraft(raw: string) {
  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(values));
}

function formatProviderRouteDraft(values: string[]) {
  if (!Array.isArray(values)) return "";
  return values.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
}

function taskRouteDisplayLabel(taskType: string) {
  const key = String(taskType || "").trim();
  if (key === "emotional_companion") return "情感陪伴";
  if (key === "work_planning") return "工作规划";
  if (key === "coding_execution") return "编程执行";
  if (key === "autonomy_dispatch") return "自主调度";
  if (key === "memory_digest") return "记忆提炼";
  return key || "未命名任务";
}

function providerStrengthLabels(provider: ModelRoutingProvider | undefined) {
  if (!provider) return ["通用对话"];
  const tags = new Set<string>();
  for (const role of provider.roles || []) {
    const key = String(role || "").trim().toLowerCase();
    if (!key) continue;
    if (key === "chat") tags.add("自然对话");
    if (key === "emotion") tags.add("情绪陪伴");
    if (key === "planning") tags.add("任务规划");
    if (key === "coding") tags.add("代码生成");
    if (key === "tool-use") tags.add("工具调用");
    if (key === "summary") tags.add("摘要提炼");
    if (key === "debug") tags.add("问题诊断");
  }
  const lowerModel = `${provider.model || ""} ${provider.id || ""}`.toLowerCase();
  if (/kimi|moonshot|companion|emotion|love/.test(lowerModel)) {
    tags.add("长对话陪伴");
  }
  if (/code|coder|deepseek|qwen|o4|nemotron|glm/.test(lowerModel)) {
    tags.add("复杂任务执行");
  }
  if (tags.size === 0) {
    tags.add("通用对话");
  }
  return Array.from(tags).slice(0, 4);
}

type SuperSkillDraftEntry = {
  id: string;
  name: string;
  source: string;
  innovationLevel: string;
  endpoints: string[];
  required: boolean;
};

/* ─────────── Creative Canvas Types ─────────── */
type CanvasTab = "draw" | "files" | "notes" | "apps";

type CanvasNote = {
  id: string;
  text: string;
  color: "yellow" | "green" | "blue" | "pink";
  createdAt: string;
};

type CanvasFileCard = {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl: string;
  createdAt: string;
};

type CanvasMiniApp = {
  id: string;
  label: string;
  type: "pomodoro" | "palette" | "notepad" | "inspiration";
};

const CANVAS_NOTES_KEY = "aria_canvas_notes";
const CANVAS_FILES_KEY = "aria_canvas_files";

const NOTE_COLORS: CanvasNote["color"][] = ["yellow", "green", "blue", "pink"];
const PERSONA_INTENSITY_LEVELS: PersonaIntensityLevel[] = ["L1", "L2", "L3"];
const PERSONA_INTENSITY_LEVEL_OPTIONS: Array<{
  value: PersonaIntensityLevel;
  label: string;
  hint: string;
}> = [
    {
      value: "L1",
      label: "智能L1安全模式",
      hint: "低打扰、先共情，适合保守稳定。"
    },
    {
      value: "L2",
      label: "主动智能L2",
      hint: "目标闭环、主动跟进，默认推荐。"
    },
    {
      value: "L3",
      label: "超级智能L3",
      hint: "强执行+自修复+能力缺口自举（自动找技能并安装），高风险动作仍需确认。"
    }
  ];

const INSPIRATION_QUOTES = [
  { text: "创造力是把已知事物以全新的方式组合起来。", author: "Steve Jobs" },
  { text: "灵感不会等你准备好，它会在你行动时出现。", author: "Pablo Picasso" },
  { text: "好的设计是尽可能少的设计。", author: "Dieter Rams" },
  { text: "简洁是终极的精致。", author: "Leonardo da Vinci" },
  { text: "每一个不曾起舞的日子，都是对生命的辜负。", author: "尼采" },
  { text: "最有价值的知识是关于方法的知识。", author: "笛卡尔" },
  { text: "想象力比知识更重要。", author: "Albert Einstein" },
  { text: "设计不仅仅是看起来怎样，更是用起来怎样。", author: "Steve Jobs" },
];

function asObjectRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as Record<string, unknown>;
}

function parseNumberDraft(input: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(input ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function parseFloatDraft(input: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseFloat(String(input ?? ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const normalized = Math.max(min, Math.min(max, parsed));
  return Number(normalized.toFixed(3));
}

function parsePersonaIntensityLevel(input: unknown, fallback: PersonaIntensityLevel = "L2"): PersonaIntensityLevel {
  const normalized = String(input ?? "").trim().toUpperCase() as PersonaIntensityLevel;
  if (PERSONA_INTENSITY_LEVELS.includes(normalized)) {
    return normalized;
  }
  return fallback;
}

function parseSuperSkillRegistryDraft(input: unknown): SuperSkillDraftEntry[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const rows: SuperSkillDraftEntry[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    const row = asObjectRecord(item);
    const id = String(row.id || "").trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    const endpoints = Array.isArray(row.endpoints)
      ? row.endpoints.map((entry) => String(entry || "").trim()).filter(Boolean)
      : [];
    rows.push({
      id,
      name: String(row.name || id).trim() || id,
      source: String(row.source || "unknown").trim() || "unknown",
      innovationLevel: String(row.innovationLevel || "enhanced").trim() || "enhanced",
      endpoints,
      required: row.required !== false
    });
  }
  return rows;
}

function memorySourceLabel(item: MemorySearchItem) {
  const source = String(item.source || "").trim().toLowerCase();
  const tier = String(item.memory_tier || "").trim().toLowerCase();
  const scene = String(item.scene || "").trim().toLowerCase();
  const tierLabel = tier === "long_term"
    ? "长期"
    : tier === "short_term"
      ? "短期"
      : tier === "temporary"
        ? "临时"
        : "混合";
  const sceneLabel = scene === "work"
    ? "工作"
    : scene === "fun"
      ? "娱乐"
      : scene === "life"
        ? "生活"
        : scene === "love"
          ? "情感"
          : scene === "coding"
            ? "编程"
            : "跨场景";
  if (source.includes("authority")) return `${sceneLabel}·${tierLabel}·权威学习`;
  if (source.includes("feedback")) return `${sceneLabel}·${tierLabel}·反馈学习`;
  if (source.includes("chat_user")) return `${sceneLabel}·${tierLabel}·用户对话`;
  if (source.includes("chat_assistant")) return `${sceneLabel}·${tierLabel}·女友回复`;
  if (source === "memory_highlight") return "长期记忆";
  if (source === "chat_recent") return "近期对话";
  return `${sceneLabel}·${tierLabel}记忆`;
}

const superOpsGuideCards = [
  {
    key: "autonomy_dispatch",
    title: "自治任务回退优先级",
    recommended: "code-specialist, companion-fallback",
    risk: "顺序错误会让任务绕路，失败重试变多。",
    plain: "把最擅长执行任务的模型放前面。"
  },
  {
    key: "retry_budget",
    title: "任务重试预算",
    recommended: "3 次",
    risk: "太低容易放弃，太高会反复卡住同一错误。",
    plain: "3 次是稳定和成本的平衡值。"
  },
  {
    key: "backoff",
    title: "重试退避",
    recommended: "1200 ms",
    risk: "太短会雪崩重试，太长会拖慢响应。",
    plain: "遇错先等一下再重试，避免连环失败。"
  },
  {
    key: "circuit",
    title: "熔断阈值/冷却",
    recommended: "3 次 / 45000 ms",
    risk: "阈值过高会持续打爆坏链路，过低会误伤正常请求。",
    plain: "连续失败就先停一下，等链路恢复。"
  },
  {
    key: "progress",
    title: "进度协议阈值",
    recommended: "8 秒触发，30 秒回报",
    risk: "阈值太大用户以为卡死，太小会刷屏。",
    plain: "让用户知道系统还在做事，不会消失。"
  }
];

const panelMeta = {
  funzone: {
    label: "娱乐主场",
    hint: "一眼看懂玩法入口，左挑玩法、中间互动、右看游戏库和攻略。"
  },
  chat: {
    label: "实时陪伴",
    hint: "像真人一样即时对话，先共情再给执行动作。"
  },
  workday: {
    label: "今日任务",
    hint: "一步一步完成签到、Quest、结算，清晰看到进展。"
  },
  device: {
    label: "设备执行",
    hint: "授权后可执行桌面/手机任务，结果可审计可追踪。"
  },
  autonomy: {
    label: "自主内核",
    hint: "查看自主建议、手动触发执行和自修复。"
  },
  memory: {
    label: "记忆与触达",
    hint: "检索长期记忆，管理主动触达节奏。"
  },
  brain: {
    label: "超级脑图",
    hint: "用 6 个图像按钮看懂脑系统结构，并一键进入对应能力。"
  }
} as const;

type PanelKey = "funzone" | "chat" | "memory" | "autonomy" | "workday" | "device" | "brain";
type PanelQuickAction = {
  id: PanelKey;
  label: string;
  active: boolean;
};

type PendingImageDraft = {
  name: string;
  dataUrl: string;
};

type OutgoingQueueItem = {
  text: string;
  images: PendingImageDraft[];
  scene: SceneKey;
  panel: PanelKey;
};

type RouteLampTone = "idle" | "running" | "ok" | "warning" | "error";

type RouteTraceEvent = {
  id: string;
  at: string;
  status: "success" | "warning" | "error" | "info";
  title: string;
  detail: string;
  scene: SceneKey;
  userText: string;
  providerId: string;
  model: string;
  fallback: boolean;
};

type AgiSceneExecutionSignal = {
  updatedAt: string;
  reason: string;
  dispatchId: string;
  dispatchStatus: string;
  autoRepairApplied: boolean;
  autoRepairMode: string;
  autoRepairSummary: string;
  idempotencyHit: boolean;
};

type AgiViewportStepStatus = "pending" | "active" | "done" | "warning" | "failed";

type AgiViewportStepMeta = {
  id: number;
  title: string;
  plain: string;
};

const AGI_VIEWPORT_OPEN_STORAGE_KEY = "aria_agi_viewport_open_v1";
const CODING_LAYOUT_MODE_STORAGE_KEY = "aria_coding_layout_mode_v1";
const CHAT_AUTO_FOLLOW_THRESHOLD_PX = 96;
const VOICE_STREAM_TTS_MIN_SEGMENT_CHARS = 8;
const VOICE_STREAM_TTS_MAX_SEGMENT_CHARS = 60;
const VOICE_STREAM_TTS_INTERVAL_MS = 350;
const VOICE_STREAM_TTS_BOUNDARY_CHARS = new Set(["。", "！", "？", "!", "?", "；", ";", "，", ",", "\n"]);

const findLastVoiceBoundaryIndex = (textInput: string) => {
  const text = String(textInput || "");
  for (let index = text.length - 1; index >= 0; index -= 1) {
    if (VOICE_STREAM_TTS_BOUNDARY_CHARS.has(text[index])) {
      return index;
    }
  }
  return -1;
};

const AGI_VIEWPORT_STEPS: AgiViewportStepMeta[] = [
  { id: 1, title: "自然语言输入", plain: "用户一句话描述需求" },
  { id: 2, title: "精准理解指令", plain: "识别意图与关键约束" },
  { id: 3, title: "确认目标", plain: "形成可执行目标定义" },
  { id: 4, title: "自主拆解方案", plain: "分解步骤并确定解题路径" },
  { id: 5, title: "选择工具与方式", plain: "匹配下载/安装/API/技能" },
  { id: 6, title: "开始执行", plain: "真实执行下载、安装、发送、生成" },
  { id: 7, title: "实时反馈", plain: "持续回传中间进展与状态" },
  { id: 8, title: "交付结果", plain: "完成闭环并产出可用结果" },
  { id: 9, title: "失败整改重做", plain: "不通过即自动修复并重放" }
];

const createDefaultAgiSceneExecutionSignal = (): AgiSceneExecutionSignal => ({
  updatedAt: "",
  reason: "",
  dispatchId: "",
  dispatchStatus: "",
  autoRepairApplied: false,
  autoRepairMode: "",
  autoRepairSummary: "",
  idempotencyHit: false
});

const createDefaultAgiSceneExecutionSignalMap = () => ({
  work: createDefaultAgiSceneExecutionSignal(),
  fun: createDefaultAgiSceneExecutionSignal(),
  life: createDefaultAgiSceneExecutionSignal(),
  love: createDefaultAgiSceneExecutionSignal(),
  coding: createDefaultAgiSceneExecutionSignal()
});
const CHAT_EXECUTION_FOLLOWUP_INTERVAL_MS = 2500;
const CHAT_EXECUTION_FOLLOWUP_MAX_MS = 45000;
const CHAT_EXECUTION_ACTIVE_STATUSES = new Set([
  "queued",
  "running",
  "planned",
  "partial",
  "pending",
  "retrying",
  "processing",
  "inflight"
]);
const CHAT_EXECUTION_TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "blocked",
  "cancelled",
  "canceled",
  "aborted",
  "timeout",
  "error"
]);

const normalizeDispatchStatus = (statusInput = "") => String(statusInput || "").trim().toLowerCase();

const shouldStartChatExecutionFollowup = (autoExecution?: AutoExecutionInfo | null) => {
  if (!autoExecution || autoExecution.executed !== true) {
    return false;
  }
  const dispatchStatus = normalizeDispatchStatus(autoExecution.dispatchStatus);
  return CHAT_EXECUTION_ACTIVE_STATUSES.has(dispatchStatus);
};

const resolveDispatchStatusFromAutonomy = (autonomyInput?: DemoAutonomyState | null, dispatchIdInput = "") => {
  const autonomy = autonomyInput && typeof autonomyInput === "object" ? autonomyInput : null;
  if (!autonomy) {
    return "";
  }
  const dispatchId = String(dispatchIdInput || "").trim();
  const history = Array.isArray(autonomy.dispatch?.history) ? autonomy.dispatch.history : [];
  if (dispatchId) {
    const matched = history.find((item) => String(item?.id || "").trim() === dispatchId);
    if (matched) {
      return normalizeDispatchStatus(String(matched.status || ""));
    }
  }
  const latest = history[0];
  if (latest) {
    return normalizeDispatchStatus(String(latest.status || ""));
  }
  return "";
};

const ONBOARDING_STORAGE_KEY = "aria_desktop_onboarding_v4_seen";
const ONBOARDING_TOTAL_SECONDS = 30;
const OUTFIT_STORAGE_PREFIX = "aria_desktop_outfit_";
const XHS_DEFAULT_ASSETS_DIR = "/Users/bear/Desktop/xhs-assets";
const XHS_PIPELINE_POLL_INTERVAL_MS = 3000;
const XHS_IN_ARIA_ENABLED = false;
const XHS_WORKFLOW_STEPS = [
  "输入主题",
  "大模型生成文案",
  "导入视频和图片",
  "自动化剪辑",
  "上传小红书"
] as const;

type XhsQuickIntent = {
  theme: string;
  runNow: boolean;
};

const extractXhsThemeFromText = (textInput: string) => {
  const text = String(textInput || "").trim();
  if (!text) return "";
  const quoted = text.match(/[“"「『](.+?)[”"」』]/);
  if (quoted && quoted[1]) {
    return String(quoted[1]).trim();
  }
  const themeField = text.match(/(?:主题|选题)\s*(?:是|为|[:：])?\s*([^\n，。！？,.!?]{2,40})/i);
  if (themeField && themeField[1]) {
    return String(themeField[1]).trim();
  }
  const generateField = text.match(/(?:生成|写|做|帮我出|给我出)\s*([^\n，。！？,.!?]{2,40})\s*(?:的)?(?:主题|选题|文案)?/i);
  if (generateField && generateField[1]) {
    return String(generateField[1]).trim();
  }
  return "";
};

const parseXhsQuickIntentFromText = (textInput: string): XhsQuickIntent | null => {
  const text = String(textInput || "").trim();
  if (!text) return null;
  const lowered = text.toLowerCase();
  const hasXhsKeyword = /小红书|视频闭环|自动化剪辑|上传小红书/.test(text) || lowered.includes("xhs");
  const hasThemeIntent = /主题|选题|文案/.test(text) && /生成|写|做|帮我|给我|出/.test(text);
  if (!hasXhsKeyword && !hasThemeIntent) {
    return null;
  }
  const runNow = /开始执行|直接执行|立即执行|现在执行|跑起来|一键执行|启动闭环|完整闭环/.test(text);
  const theme = extractXhsThemeFromText(text);
  return {
    theme,
    runNow
  };
};

const onboardingFlow: Array<{
  panel: PanelKey;
  scene: SceneKey;
  title: string;
  desc: string;
  action: string;
  seconds: number;
  visualTag: string;
  visualEmoji: string;
  bullets: string[];
}> = [
    {
      panel: "chat",
      scene: "love",
      title: "第 1 步：先说一句现在的你",
      desc: "用一句自然的话说出你的状态，Aria 会先接住情绪，再给可执行建议。",
      action: "打开陪伴区",
      seconds: 10,
      visualTag: "情绪接住 + 真人回复",
      visualEmoji: "💞",
      bullets: [
        "不用写指令，像聊天一样说就行",
        "回复会带温度，不走固定模板",
        "先共情，再推进下一步"
      ]
    },
    {
      panel: "workday",
      scene: "work",
      title: "第 2 步：把目标变成可执行任务",
      desc: "选一个目标，Aria 会立刻拆解成步骤、节奏和回执，让你看见推进感。",
      action: "打开任务区",
      seconds: 10,
      visualTag: "目标拆解 + 进度可视",
      visualEmoji: "🎯",
      bullets: [
        "一键生成今日执行清单",
        "每步有状态，完成后即刻反馈",
        "卡住时自动给修正建议"
      ]
    },
    {
      panel: "device",
      scene: "coding",
      title: "第 3 步：授权后直接做事",
      desc: "允许设备能力后，Aria 可以真的执行任务，并把过程和结果完整回放给你。",
      action: "打开执行区",
      seconds: 10,
      visualTag: "授权执行 + 全链路回放",
      visualEmoji: "⚙️",
      bullets: [
        "支持授权后自动执行动作",
        "每次执行都有日志和结果",
        "异常会自动回退到安全路径"
      ]
    }
  ];

type BrainModuleKey = "modelApi" | "evolution" | "memory" | "eq" | "iq" | "guardian";

const brainModuleMeta: Record<
  BrainModuleKey,
  {
    icon: string;
    title: string;
    nonTech: string;
    cta: string;
    focusPanel: PanelKey;
    tags: string[];
  }
> = {
  modelApi: {
    icon: "🛰️",
    title: "超级女友大模型 API",
    nonTech: "自动选择最合适的大模型，你不用管技术参数。",
    cta: "进入模型中心",
    focusPanel: "autonomy",
    tags: ["模型路由", "自动降级"]
  },
  evolution: {
    icon: "🧬",
    title: "自主脑进化",
    nonTech: "主动学习、反馈学习、场景学习和预学习都会自动进行。",
    cta: "进入进化中心",
    focusPanel: "autonomy",
    tags: ["主动学", "反馈学"]
  },
  memory: {
    icon: "🗂️",
    title: "超级记忆引擎",
    nonTech: "长期记忆+短期记忆联动，聊天会自然想起关键经历。",
    cta: "进入记忆中心",
    focusPanel: "memory",
    tags: ["长期记忆", "联想检索"]
  },
  eq: {
    icon: "💗",
    title: "情商图谱",
    nonTech: "理解你的情绪、关系和语气，先懂你再回答你。",
    cta: "进入情商中心",
    focusPanel: "chat",
    tags: ["情绪感知", "陪伴权重"]
  },
  iq: {
    icon: "🛠️",
    title: "智商图谱",
    nonTech: "指令拆解、任务调度、自动执行和错误修正一体化。",
    cta: "进入智商中心",
    focusPanel: "workday",
    tags: ["任务调度", "风险修正"]
  },
  guardian: {
    icon: "🛡️",
    title: "安全守护与运维",
    nonTech: "权限、紧急任务和异常恢复都由守护模块统一兜底。",
    cta: "进入守护中心",
    focusPanel: "device",
    tags: ["权限守护", "紧急策略"]
  }
};

const brainModuleDetail: Record<
  BrainModuleKey,
  {
    plain: string;
    steps: string[];
    entryLabel: string;
  }
> = {
  modelApi: {
    plain: "负责模型接入、自动切换和故障降级，保证关键场景不断线。",
    steps: ["识别任务类型", "路由最佳模型", "失败自动降级"],
    entryLabel: "打开模型与调度"
  },
  evolution: {
    plain: "负责主动学习和反馈学习，让女友能力持续进化而不是固定脚本。",
    steps: ["定时主动学习", "用户反馈学习", "场景预学习"],
    entryLabel: "打开进化与自主"
  },
  memory: {
    plain: "负责长期/短期记忆与跨场景联想，让互动更像真人。",
    steps: ["写入长期记忆", "缓存近期上下文", "聊天时联想召回"],
    entryLabel: "打开记忆引擎"
  },
  eq: {
    plain: "负责情绪感知和陪伴节奏，先理解再建议。",
    steps: ["识别情绪语气", "匹配陪伴策略", "输出贴合回应"],
    entryLabel: "打开情商模式"
  },
  iq: {
    plain: "负责任务拆解和执行编排，包含异常修复。",
    steps: ["解析用户指令", "调度任务链路", "回执与纠错"],
    entryLabel: "打开智商执行"
  },
  guardian: {
    plain: "负责权限、安全、紧急响应和运行时健康守护。",
    steps: ["权限分级守护", "高风险拦截", "紧急通知与恢复"],
    entryLabel: "打开守护中心"
  }
};

const limbExecutionModules: Array<{
  id: string;
  icon: string;
  title: string;
  hint: string;
  focusPanel: PanelKey;
}> = [
    { id: "msg", icon: "💬", title: "消息模块", hint: "工作/生活消息处理", focusPanel: "chat" },
    { id: "schedule", icon: "📅", title: "日程管理", hint: "提醒与计划推进", focusPanel: "workday" },
    { id: "device", icon: "🖥️", title: "硬件终端", hint: "电脑/手机/IoT接入", focusPanel: "device" },
    { id: "commerce", icon: "🛍️", title: "电商模块", hint: "内容到转化闭环", focusPanel: "workday" },
    { id: "file", icon: "🗂️", title: "文件管理", hint: "资料整理与归档", focusPanel: "device" },
    { id: "web", icon: "🌐", title: "网络冲浪", hint: "信息检索与洞察", focusPanel: "autonomy" },
    { id: "voice", icon: "🎙️", title: "语音模块", hint: "语音交互与播报", focusPanel: "device" },
    { id: "life", icon: "🏡", title: "生活模块", hint: "生活事务自动化", focusPanel: "workday" },
    { id: "work", icon: "💼", title: "工作场景", hint: "任务执行与复盘", focusPanel: "workday" },
    { id: "fun", icon: "🎮", title: "娱乐场景", hint: "陪伴和放松体验", focusPanel: "chat" },
    { id: "family", icon: "👨‍👩‍👧", title: "家庭服务", hint: "亲情关怀与守护", focusPanel: "memory" },
    { id: "meta", icon: "🧩", title: "元世界", hint: "长期扩展能力池", focusPanel: "autonomy" }
  ];

// SceneKey type declared above (line 57)

const sceneMeta: Record<
  SceneKey,
  {
    label: string;
    hint: string;
    defaultPanel: PanelKey;
    mode: CompanionMode;
    panels: PanelKey[];
  }
> = {
  work: {
    label: "工作场景",
    hint: "目标拆解、任务推进、自动执行和复盘。",
    defaultPanel: "workday",
    mode: "工作",
    panels: ["workday", "chat", "device"]
  },
  fun: {
    label: "娱乐场景",
    hint: "游戏化互动、创意体验和情绪放松。",
    defaultPanel: "funzone",
    mode: "陪伴",
    panels: ["funzone", "chat", "memory", "brain"]
  },
  life: {
    label: "生活场景",
    hint: "生活助手、家庭记忆、设备代办一体化。",
    defaultPanel: "memory",
    mode: "亲情",
    panels: ["memory", "device", "workday", "autonomy"]
  },
  love: {
    label: "情感世界",
    hint: "真人感陪伴、关系经营、甜蜜互动与共情。",
    defaultPanel: "chat",
    mode: "陪伴",
    panels: ["chat", "memory", "brain", "autonomy"]
  },
  coding: {
    label: "编程女孩",
    hint: "像 Codex 一样：澄清目标、预演补丁、确认应用、回滚可追踪。",
    defaultPanel: "workday",
    mode: "工作",
    panels: ["workday", "autonomy", "device"]
  }
};

const panelSceneMap: Record<PanelKey, SceneKey> = {
  funzone: "fun",
  chat: "love",
  memory: "life",
  autonomy: "work",
  workday: "work",
  device: "life",
  brain: "love"
};

const fallbackVoicePresetOptions: VoiceProfileState["presets"] = [
  {
    id: "gentle_female",
    label: "温柔女生",
    voice: "Flo (中文（中国大陆）)",
    rate: 178,
    description: "温柔自然，适合陪伴对话。"
  },
  {
    id: "natural_female",
    label: "真人女声",
    voice: "Meijia",
    rate: 176,
    description: "偏真人质感，语速更柔和。"
  },
  {
    id: "steady_male",
    label: "稳重男声",
    voice: "Eddy (中文（中国大陆）)",
    rate: 182,
    description: "稳定清晰，适合播报场景。"
  }
];

const sceneRouteSlug: Record<SceneKey, string> = {
  work: "work",
  fun: "fun",
  life: "life",
  love: "love",
  coding: "coding"
};

const panelRouteSlug: Record<PanelKey, string> = {
  funzone: "funzone",
  chat: "chat",
  memory: "memory",
  autonomy: "autonomy",
  workday: "workday",
  device: "device",
  brain: "brain"
};

const sceneRouteAliasMap: Record<string, SceneKey> = {
  work: "work",
  "工作": "work",
  "工作场景": "work",
  fun: "fun",
  "娱乐": "fun",
  "娱乐场景": "fun",
  life: "life",
  "生活": "life",
  "生活场景": "life",
  love: "love",
  "情感": "love",
  "情感世界": "love",
  "陪伴": "love",
  coding: "coding",
  "编程": "coding",
  "编程女孩": "coding",
  "codinggirl": "coding"
};

const panelRouteAliasMap: Record<string, PanelKey> = {
  funzone: "funzone",
  "娱乐主场": "funzone",
  chat: "chat",
  "实时陪伴": "chat",
  "聊天": "chat",
  memory: "memory",
  "记忆与触达": "memory",
  autonomy: "autonomy",
  "自主内核": "autonomy",
  workday: "workday",
  "今日任务": "workday",
  device: "device",
  "设备执行": "device",
  brain: "brain",
  "超级脑图": "brain"
};

function normalizeRouteToken(token: string) {
  if (!token) return "";
  try {
    return decodeURIComponent(token).trim().toLowerCase();
  } catch {
    return token.trim().toLowerCase();
  }
}

function resolveRouteFromPath(pathname: string): { scene: SceneKey; panel: PanelKey } | null {
  const segments = String(pathname || "")
    .split("/")
    .map((item) => normalizeRouteToken(item))
    .filter(Boolean);
  if (segments.length === 0) {
    return null;
  }
  const first = segments[0];
  const second = segments[1] || "";
  const sceneFromFirst = sceneRouteAliasMap[first];
  const panelFromFirst = panelRouteAliasMap[first];
  const panelFromSecond = panelRouteAliasMap[second];
  const scene = sceneFromFirst || (panelFromFirst ? panelSceneMap[panelFromFirst] : null);
  if (!scene) {
    return null;
  }
  const candidatePanel = panelFromSecond || panelFromFirst || sceneMeta[scene].defaultPanel;
  const panel = sceneMeta[scene].panels.includes(candidatePanel)
    ? candidatePanel
    : sceneMeta[scene].defaultPanel;
  return { scene, panel };
}

function buildRoutePath(scene: SceneKey, panel: PanelKey) {
  const sceneSlug = sceneRouteSlug[scene];
  const panelSlug = panelRouteSlug[panel];
  if (!sceneSlug || !panelSlug) {
    return "/";
  }
  const defaultPanel = sceneMeta[scene].defaultPanel;
  if (panel === defaultPanel) {
    return `/${sceneSlug}`;
  }
  return `/${sceneSlug}/${panelSlug}`;
}

type FunLeftModule = {
  id: string;
  title: string;
  hint: string;
  detail: string;
  starterPrompt: string;
  badge: string;
};

const funLeftModules: FunLeftModule[] = [
  {
    id: "fun_soul",
    title: "Soul 调校",
    hint: "娱乐人格和互动风格快捷调节",
    detail: "快速调整娱乐场景语气、节奏、奖励偏好与边界，立即影响后续聊天与互动行为。",
    starterPrompt: "进入娱乐场景 Soul 调校，帮我设置语气、节奏、奖励和互动风格，并给预览示例。",
    badge: "1"
  },
  {
    id: "mini_game",
    title: "小游戏",
    hint: "即开即玩，轻量爽感",
    detail: "3-8 分钟快节奏小游戏，适合破冰、放松和拉近关系。",
    starterPrompt: "进入小游戏模式，先发现并安装免费网页小游戏 skill/mcp 插件，再给我 3 个可立即开始的互动小游戏。",
    badge: "2"
  },
  {
    id: "handmade_game",
    title: "手搓小游戏",
    hint: "你说规则，女友帮你搭",
    detail: "从玩法规则、回合机制到奖励反馈，女友陪你共创一个可玩的专属小游戏。",
    starterPrompt: "进入手搓小游戏模式，先接入免费手搓网页游戏插件，再帮我从规则、回合和奖励开始设计一个可直接玩的小游戏。",
    badge: "3"
  },
  {
    id: "make_friends",
    title: "交个朋友",
    hint: "好友破冰 + 聊天续接",
    detail: "给你自然开场话题、延续聊天脚本和互动建议，帮助轻松进入社交状态。",
    starterPrompt: "进入交个朋友模式，给我 5 句自然破冰开场和 3 句续聊话术。",
    badge: "4"
  }
];

const funCenterQuickActions: Record<string, Array<{
  id: string;
  label: string;
  starterPrompt: string;
}>> = {
  fun_soul: [
    { id: "soul-tone", label: "语气模板", starterPrompt: "娱乐场景 Soul 语气：帮我配 3 套可切换语气并给触发条件。" },
    { id: "soul-boundary", label: "互动边界", starterPrompt: "帮我配置娱乐场景互动边界：鼓励、调侃、亲密度三档。" },
    { id: "soul-reward", label: "奖励节奏", starterPrompt: "帮我配置娱乐奖励节奏：即时反馈、连胜奖励、冷却规则。" }
  ],
  mini_game: [
    { id: "mini-fast", label: "极速开局", starterPrompt: "小游戏极速开局：优先接入免费插件，再给我一个 3 分钟马上能玩的玩法。" },
    { id: "mini-versus", label: "双人对战", starterPrompt: "小游戏双人对战：优先接入联机相关免费插件，再给我规则、计分和结算台词。" },
    { id: "mini-relax", label: "放松玩法", starterPrompt: "小游戏放松玩法：先选适合低压力互动的免费插件，再给我一个有参与感的玩法。" }
  ],
  handmade_game: [
    { id: "hand-rule", label: "写规则", starterPrompt: "手搓小游戏：先接入规则与物理类免费插件，再帮我定义核心规则和胜负判定。" },
    { id: "hand-loop", label: "做回合", starterPrompt: "手搓小游戏：先接入回合制免费插件，再帮我设计 5 回合流程和每回合动作。" },
    { id: "hand-ui", label: "出原型", starterPrompt: "手搓小游戏：先接入网页小游戏模板插件，再给我一个可演示的页面原型结构。" }
  ],
  make_friends: [
    { id: "friend-open", label: "破冰开场", starterPrompt: "交个朋友：给我 5 句自然不尬的破冰开场白。" },
    { id: "friend-chat", label: "续聊脚本", starterPrompt: "交个朋友：给我 3 轮续聊脚本，避免冷场。" },
    { id: "friend-invite", label: "邀约模板", starterPrompt: "交个朋友：给我一个轻松自然的邀约模板。" }
  ]
};

const funRightModules: Array<{
  id: string;
  title: string;
  hint: string;
  starterPrompt: string;
}> = [
    {
      id: "game_library",
      title: "游戏库",
      hint: "按时长、情绪、难度筛选可玩内容",
      starterPrompt: "帮我从游戏库推荐 5 个放松向玩法，并按 5 分钟、15 分钟、30 分钟分组。"
    },
    {
      id: "strategy_book",
      title: "攻略",
      hint: "新手攻略、通关提示、互动话术",
      starterPrompt: "给我一份娱乐场景攻略：新手怎么 5 分钟内进入状态并保持互动感。"
    },
    {
      id: "free_plugins",
      title: "免费插件",
      hint: "小游戏/手搓网页游戏插件推荐与接入",
      starterPrompt: "帮我推荐并接入免费小游戏和手搓网页小游戏插件，按开局、联机、音效、物理四类给出建议。"
    }
  ];

type FunFriend = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "busy" | "offline";
};

const funFriendList: FunFriend[] = [
  { id: "friend-luna", name: "Luna", avatar: "🌙", status: "online" },
  { id: "friend-max", name: "Max", avatar: "🧢", status: "online" },
  { id: "friend-zoe", name: "Zoe", avatar: "🎧", status: "busy" },
  { id: "friend-neo", name: "Neo", avatar: "🎮", status: "online" },
  { id: "friend-kiki", name: "Kiki", avatar: "🌟", status: "offline" }
];

const funFriendMessageTemplates = [
  "今晚来一局吗？我刚发现个新玩法。",
  "你刚才那个点子很有趣，继续聊聊？",
  "我这边有个挑战，想不想一起试试？",
  "周末有个轻松局，要不要一起组队？",
  "我给你留了一个小游戏房间，等你加入。"
];

type FunModelConfigDraft = {
  tone: string;
  mode: string;
  reward: string;
  note: string;
};

type FunGameDraft = {
  difficulty: "easy" | "normal" | "hard";
  rounds: number;
  scoreEnabled: boolean;
  rewardEnabled: boolean;
  reviveEnabled: boolean;
  templateName: string;
};

const FUN_MODEL_TONE_OPTIONS = [
  "温柔陪玩",
  "俏皮互动",
  "高能热场"
];

const FUN_MODEL_MODE_OPTIONS = [
  "轻松放松",
  "刺激挑战",
  "社交破冰"
];

const FUN_MODEL_REWARD_OPTIONS = [
  "低频奖励",
  "标准奖励",
  "高频奖励"
];

const FUN_GAME_DIFFICULTY_OPTIONS: Array<{ value: FunGameDraft["difficulty"]; label: string }> = [
  { value: "easy", label: "简单" },
  { value: "normal", label: "标准" },
  { value: "hard", label: "困难" }
];

const funBottomQuickActions: Array<{
  id: string;
  label: string;
  starterPrompt: string;
}> = [
    { id: "quick-1", label: "破冰", starterPrompt: "给我一套 60 秒娱乐破冰脚本。" },
    { id: "quick-2", label: "升温", starterPrompt: "给我一套互动升温流程，轻松自然不尴尬。" },
    { id: "quick-3", label: "奖励", starterPrompt: "帮我设计一个娱乐奖励机制，完成后有明确反馈。" },
    { id: "quick-4", label: "复盘", starterPrompt: "帮我做娱乐复盘：今天最有感觉的互动点是什么？" }
  ];

type LifeLeftModule = {
  id: string;
  title: string;
  hint: string;
  prompt: string;
};

const lifeLeftModules: LifeLeftModule[] = [
  {
    id: "life-soul",
    title: "Life Soul",
    hint: "生活偏好、关怀权重与提醒节奏",
    prompt: "进入生活场景 Life Soul 配置，帮我设置父母、伴侣、孩子的关怀优先级和提醒节奏。"
  },
  {
    id: "life-sync",
    title: "生活同步",
    hint: "相册、短信、邮箱、日程同步",
    prompt: "进入生活同步配置，帮我梳理相册、短信、邮箱和日程的同步策略。"
  },
  {
    id: "life-auto",
    title: "自动执行",
    hint: "代办自动编排与执行回执",
    prompt: "进入生活自动执行模式，帮我把今天的生活代办排成自动执行链路。"
  },
  {
    id: "life-external",
    title: "外接",
    hint: "第三方服务和平台连接",
    prompt: "进入生活外接配置，列出可接入的服务并给我授权步骤。"
  },
  {
    id: "life-hardware",
    title: "硬件终端",
    hint: "家居设备和手机终端协同",
    prompt: "进入硬件终端配置，帮我设置家居设备与手机的联动规则。"
  }
];

const lifeRoleChips = [
  { id: "dad", label: "爸爸" },
  { id: "mom", label: "妈妈" },
  { id: "grandpa", label: "爷爷" },
  { id: "grandma", label: "奶奶" },
  { id: "self", label: "我" }
];

const lifeToolCards: Array<{
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
}> = [
    {
      id: "life-mail",
      title: "邮箱",
      subtitle: "家庭邮件整理",
      prompt: "帮我执行家庭邮箱整理：先发现并自动安装 2 个可用 skill，再提取待办并标记紧急度，最后给执行回执。"
    },
    {
      id: "life-browser",
      title: "浏览器",
      subtitle: "生活信息检索",
      prompt: "帮我联网检索本周生活安排相关信息，优先权威来源，返回摘要和链接。"
    },
    {
      id: "life-scan",
      title: "扫描",
      subtitle: "票据和证件归档",
      prompt: "帮我查找票据和证件扫描归档工具安装方法，并自动安装可用 skill 后输出执行步骤。"
    },
    {
      id: "life-memory",
      title: "记录",
      subtitle: "家庭记忆沉淀",
      prompt: "帮我把今天家庭关键事件写入长期记忆，并生成可检索标签和后续提醒。"
    },
    {
      id: "life-recipe",
      title: "菜谱",
      subtitle: "饮食安排",
      prompt: "根据家庭成员偏好，给我一周菜谱和采购清单，并按天拆分执行建议。"
    },
    {
      id: "life-medicine",
      title: "就医",
      subtitle: "复诊与用药提醒",
      prompt: "帮我生成家庭复诊和用药提醒计划，带日历节奏和风险提示。"
    },
    {
      id: "life-fitness",
      title: "运动",
      subtitle: "健康活动计划",
      prompt: "帮我安排全家一周运动打卡计划，按老人/成人/孩子分层，简单可执行。"
    },
    {
      id: "life-album",
      title: "图像集",
      subtitle: "相册整理回忆",
      prompt: "从桌面和下载目录找近期家庭照片，先发 1 张到聊天窗口，再给相册整理方案。"
    }
  ];

const lifeEventCards: Array<{
  id: string;
  title: string;
  hint: string;
}> = [
    { id: "life-event-speech", title: "活动话术", hint: "家庭沟通、问候和关怀表达模板。" },
    { id: "life-event-assist", title: "辅助建议", hint: "健康、就医、生活决策建议看板。" },
    { id: "life-event-reminder", title: "妈妈提醒", hint: "生日、复诊、吃药、回访提醒入口。" },
    { id: "life-event-feed", title: "动态活动", hint: "生活动态回执和执行日志。" }
  ];

type LoveLeftModule = {
  id: string;
  title: string;
  hint: string;
  prompt: string;
};

const loveLeftModules: LoveLeftModule[] = [
  {
    id: "love-model",
    title: "Love Soul",
    hint: "情感语气、亲密节奏与互动边界（快捷）",
    prompt: "进入情感世界 Love Soul 配置，帮我设置语气、亲密节奏和互动边界。"
  },
  {
    id: "love-proactive",
    title: "主动爱",
    hint: "主动关心和情绪陪伴触发",
    prompt: "进入主动爱配置，帮我设置主动问候频率和情绪陪伴触发规则。"
  },
  {
    id: "love-memory",
    title: "回忆",
    hint: "纪念日、共同经历、甜蜜片段",
    prompt: "进入回忆配置，帮我整理纪念日和共同经历，并生成可触发的回忆话术。"
  },
  {
    id: "love-skill",
    title: "技能",
    hint: "情感沟通技巧和修复策略",
    prompt: "进入情感技能配置，给我争执修复、夸赞表达、安慰陪伴三套技能模板。"
  },
  {
    id: "love-mcp",
    title: "关系 MCP Labs",
    hint: "关系实验与互动剧本",
    prompt: "进入关系 MCP Labs，生成 3 个可执行的情感互动实验剧本。"
  },
  {
    id: "love-wish",
    title: "愿望",
    hint: "愿望清单和阶段目标",
    prompt: "进入愿望池配置，帮我制定短期和长期愿望清单，并给推进计划。"
  }
];

const loveQuickActions: Array<{
  id: string;
  label: string;
  prompt: string;
}> = [
    { id: "love-hi", label: "打招呼", prompt: "帮我发一条温柔自然的开场问候。" },
    { id: "love-praise", label: "夸夸她", prompt: "帮我生成一句真诚不油腻的夸赞。" },
    { id: "love-whisper", label: "比心密语", prompt: "帮我写一句有温度的比心密语，简短一点。" }
  ];

type SceneSoulTarget = Exclude<SceneKey, "coding">;

type SceneSoulUploadedFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  excerpt: string;
};

const SCENE_SOUL_TARGETS: SceneSoulTarget[] = ["work", "fun", "life", "love"];
const SCENE_SOUL_TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "json", "csv", "yaml", "yml"]);
const SCENE_SOUL_MAX_FILES = 8;
const SCENE_SOUL_EXCERPT_LIMIT = 240;

type AvatarConfigAction = "open" | "upload" | "edit";

type AvatarConfigItem = {
  id: string;
  icon: string;
  title: string;
  shortLabel: string;
  desc: string;
  focusPanel: PanelKey;
  scene: SceneKey;
  brainModule?: BrainModuleKey;
  uploadPanel?: PanelKey;
  editPanel?: PanelKey;
};

const avatarBrainConfigs: AvatarConfigItem[] = [
  {
    id: "brain-model",
    icon: "🛰️",
    title: "模型大脑",
    shortLabel: "模型",
    desc: "模型路由、切换与降级",
    focusPanel: "brain",
    scene: "work",
    brainModule: "modelApi",
    editPanel: "autonomy"
  },
  {
    id: "brain-evolution",
    icon: "🧬",
    title: "自主进化",
    shortLabel: "进化",
    desc: "主动学习和反馈学习",
    focusPanel: "brain",
    scene: "work",
    brainModule: "evolution",
    editPanel: "autonomy"
  },
  {
    id: "brain-memory",
    icon: "🗂️",
    title: "记忆引擎",
    shortLabel: "记忆",
    desc: "长期记忆 + 场景联想",
    focusPanel: "brain",
    scene: "life",
    brainModule: "memory",
    uploadPanel: "memory",
    editPanel: "memory"
  },
  {
    id: "brain-emotion",
    icon: "💗",
    title: "情智双核",
    shortLabel: "情智",
    desc: "共情与执行决策双核",
    focusPanel: "brain",
    scene: "love",
    brainModule: "eq",
    editPanel: "autonomy"
  }
];

const avatarActionConfigs: AvatarConfigItem[] = [
  {
    id: "action-coding",
    icon: "💻",
    title: "自主编程",
    shortLabel: "编程",
    desc: "一句话生成、改错、跑测试",
    focusPanel: "workday",
    scene: "coding",
    editPanel: "autonomy"
  },
  {
    id: "action-automation",
    icon: "⚙️",
    title: "自动化编排",
    shortLabel: "自动",
    desc: "任务链、规则、重试策略",
    focusPanel: "autonomy",
    scene: "work",
    editPanel: "autonomy"
  },
  {
    id: "action-skill-center",
    icon: "🧩",
    title: "技能中心",
    shortLabel: "技能",
    desc: "Skill / MCP 插件能力",
    focusPanel: "brain",
    scene: "work",
    brainModule: "iq",
    editPanel: "autonomy"
  },
  {
    id: "action-device",
    icon: "🖥️",
    title: "硬件接管",
    shortLabel: "硬件",
    desc: "电脑、手机、语音权限",
    focusPanel: "device",
    scene: "life",
    editPanel: "device"
  },
  {
    id: "action-scenes",
    icon: "🎮",
    title: "场景剧本",
    shortLabel: "场景",
    desc: "工作 / 娱乐 / 生活 / 情感 / 编程",
    focusPanel: "workday",
    scene: "fun",
    editPanel: "autonomy"
  }
];

const codingWorkEntrances: Array<{
  id: string;
  label: string;
  prompt: string;
}> = [
    {
      id: "coding-feature",
      label: "生成功能",
      prompt: "请帮我先澄清需求，再生成一个可运行的功能代码，并附上验证步骤。"
    },
    {
      id: "coding-fix",
      label: "修复报错",
      prompt: "我遇到报错了，请先定位根因，再给最小修复补丁，并告诉我如何验证。"
    },
    {
      id: "coding-review",
      label: "代码评审",
      prompt: "请对我的代码做结构化评审，按高到低给问题清单和修复建议。"
    },
    {
      id: "coding-autopilot",
      label: "自动执行",
      prompt: "请把我的编程任务拆成步骤并自动执行，每一步回执结果，失败自动重试。"
    }
  ];

const backendPlainBlocks: Array<{
  id: string;
  icon: string;
  title: string;
  plain: string;
  technical: string;
  focusPanel: PanelKey;
  scene: SceneKey;
}> = [
    {
      id: "gate",
      icon: "🚪",
      title: "门卫层",
      plain: "负责登录、权限和安全拦截。",
      technical: "API Gateway + Auth + Risk Guard",
      focusPanel: "device",
      scene: "life"
    },
    {
      id: "brain",
      icon: "🧠",
      title: "思考层",
      plain: "负责理解你说的话，自动选择模型。",
      technical: "Orchestrator + Model Router",
      focusPanel: "brain",
      scene: "work"
    },
    {
      id: "memory",
      icon: "🗃️",
      title: "记忆层",
      plain: "负责长期和短期记忆，越用越懂你。",
      technical: "Memory Service + Vector Store",
      focusPanel: "memory",
      scene: "life"
    },
    {
      id: "autonomy",
      icon: "⚙️",
      title: "自主执行层",
      plain: "负责计划、执行、失败重试和回执。",
      technical: "Autonomy Engine + Task Scheduler",
      focusPanel: "autonomy",
      scene: "work"
    },
    {
      id: "skills",
      icon: "🧩",
      title: "技能工具层",
      plain: "负责调用电脑、手机和外部技能。",
      technical: "Skill Hub + MCP Bridge + Device Bridge",
      focusPanel: "device",
      scene: "work"
    },
    {
      id: "scene",
      icon: "🎬",
      title: "场景编排层",
      plain: "负责工作/生活/情感场景切换。",
      technical: "Scenario Policy + Runtime State Machine",
      focusPanel: "workday",
      scene: "love"
    }
  ];

const injectedCapabilityCards: Array<{
  id: string;
  source: "Codex" | "Aria Kernel";
  title: string;
  plain: string;
  backend: string;
  focusPanel: PanelKey;
  scene: SceneKey;
}> = [
    {
      id: "codex-architecture",
      source: "Codex",
      title: "系统化拆解能力",
      plain: "把复杂需求拆成可执行任务，用户只看结果。",
      backend: "Planner + Workflow Graph + Recovery Policy",
      focusPanel: "autonomy",
      scene: "work"
    },
    {
      id: "codex-coding",
      source: "Codex",
      title: "自主编程能力",
      plain: "一句话到代码、测试、修复全流程。",
      backend: "Code Agent + Test Runner + Patch Engine",
      focusPanel: "workday",
      scene: "work"
    },
    {
      id: "aria-kernel-routing",
      source: "Aria Kernel",
      title: "多模型路由能力",
      plain: "按任务自动换模型，失败自动降级。",
      backend: "Model Binding + Runtime Routing",
      focusPanel: "brain",
      scene: "work"
    },
    {
      id: "aria-kernel-execution",
      source: "Aria Kernel",
      title: "工具执行能力",
      plain: "能调起技能、设备、自动化并回执。",
      backend: "ACP Gateway + Agent Bindings + Device Ops",
      focusPanel: "device",
      scene: "life"
    }
  ];

const capabilityCoreEntryMap: Record<string, { panel: PanelKey; scene: SceneKey }> = {
  codex: { panel: "workday", scene: "coding" },
  antigravity: { panel: "chat", scene: "love" },
  ariaKernel: { panel: "autonomy", scene: "work" }
};

/* ─────────── Character Selection Screen ─────────── */
function CharacterSelect({ onSelect }: { onSelect: (persona: GirlfriendPersona) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <main className="select-screen">
      <div className="select-header">
        <p className="select-eyebrow">ARIA SUPER COMPANION</p>
        <h1 className="select-title">选择你的超级女友</h1>
        <p className="select-subtitle">每位女友都有独特的性格、能力和陪伴风格</p>
      </div>

      <div className="persona-grid">
        {PERSONAS.map((p) => (
          <article
            key={p.id}
            className={`persona-card ${hoveredId === p.id ? "is-hovered" : ""}`}
            style={{ "--persona-accent": p.accentColor, "--persona-accent-soft": p.accentSoft } as React.CSSProperties}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(p)}
          >
            <div className="persona-avatar-wrap">
              <img src={p.avatar} alt={p.name} className="persona-avatar" />
              <div className="persona-glow" />
            </div>
            <div className="persona-info">
              <h2 className="persona-name">{p.name}</h2>
              <p className="persona-subtitle">{p.subtitle}</p>
              <div className="persona-tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="persona-tag">{tag}</span>
                ))}
              </div>
              <p className="persona-desc">{p.personality}</p>
              <div className="persona-stats">
                <div className="persona-stat">
                  <span>温柔</span>
                  <div className="stat-bar"><div className="stat-fill" style={{ width: `${p.warmth * 100}%` }} /></div>
                </div>
                <div className="persona-stat">
                  <span>智慧</span>
                  <div className="stat-bar"><div className="stat-fill" style={{ width: `${p.competence * 100}%` }} /></div>
                </div>
                <div className="persona-stat">
                  <span>俏皮</span>
                  <div className="stat-bar"><div className="stat-fill" style={{ width: `${p.playfulness * 100}%` }} /></div>
                </div>
              </div>
              <button
                type="button"
                className="persona-select-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(p);
                }}
              >
                选择 {p.name}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

/* ─────────── Coworking Seat System ─────────── */
type ChairStyle = "gaming" | "executive" | "minimal" | "cute" | "standing" | "bean";
type OccupantStatus = "online" | "dnd" | "away" | "off-work" | "business-trip";

const OCCUPANT_STATUS_META: Record<OccupantStatus, { label: string; emoji: string; color: string }> = {
  online: { label: "在线", emoji: "🟢", color: "46, 204, 113" },
  dnd: { label: "免打扰", emoji: "🔴", color: "231, 76, 60" },
  away: { label: "暂离", emoji: "🟡", color: "241, 196, 15" },
  "off-work": { label: "下班", emoji: "🌙", color: "100, 100, 120" },
  "business-trip": { label: "出差", emoji: "✈️", color: "52, 152, 219" },
};

interface CoworkingSeatOccupant {
  name: string;
  title: string;
  direction: string;
  role: string;
  avatar: string;
  checkinCount: number;
  lastCheckin: string;
  status: OccupantStatus;
  isFriend: boolean;
  isBuddy: boolean;
  helpRequest: string | null;
}

interface CoworkingSeat {
  id: string;
  row: number;
  col: number;
  style: ChairStyle;
  gender: "male" | "female" | "neutral";
  occupant: CoworkingSeatOccupant | null;
}

interface MyCoworkingProfile {
  name: string;
  title: string;
  direction: string;
  role: string;
  avatar: string;
  totalCheckins: number;
  currentSeatId: string | null;
  registeredAt: string;
  status: OccupantStatus;
  friendIds: string[];  // occupant names
  buddyIds: string[];   // 搭子 names
  helpRequest: string | null;
}

const CHAIR_STYLES: { style: ChairStyle; label: string; emoji: string; color: string }[] = [
  { style: "gaming", label: "电竞椅", emoji: "🎮", color: "168, 85, 247" },
  { style: "executive", label: "行政椅", emoji: "💺", color: "139, 90, 43" },
  { style: "minimal", label: "极简椅", emoji: "🪑", color: "148, 163, 184" },
  { style: "cute", label: "少女椅", emoji: "🎀", color: "244, 114, 182" },
  { style: "standing", label: "站立桌", emoji: "🧍", color: "34, 197, 94" },
  { style: "bean", label: "懒人沙发", emoji: "🛋️", color: "251, 146, 60" },
];

const COWORKING_AVATAR_OPTIONS = [
  "👨‍💻", "👩‍💻", "🧑‍🔬", "👨‍🎨", "👩‍🎨", "🧑‍💼", "👨‍🚀", "👩‍🚀",
  "🦊", "🐱", "🐶", "🐼", "🦁", "🐨", "🐸", "🦉",
  "😎", "🤓", "🥸", "🧐", "😇", "🤠", "🥷", "🧙",
];

const MOCK_COWORKERS: CoworkingSeatOccupant[] = [
  { name: "阿鹏", title: "独立开发者", direction: "AI 产品", role: "全栈工程师", avatar: "👨‍💻", checkinCount: 42, lastCheckin: new Date().toISOString().slice(0, 10), status: "online", isFriend: false, isBuddy: false, helpRequest: null },
  { name: "小樱", title: "自由设计师", direction: "品牌视觉", role: "UI/UX 设计", avatar: "👩‍🎨", checkinCount: 28, lastCheckin: new Date().toISOString().slice(0, 10), status: "online", isFriend: false, isBuddy: false, helpRequest: "求助：Figma 插件开发有经验的朋友聊聊" },
  { name: "浩哥", title: "一人公司", direction: "SaaS 工具", role: "产品经理", avatar: "🧑‍💼", checkinCount: 55, lastCheckin: new Date().toISOString().slice(0, 10), status: "dnd", isFriend: false, isBuddy: false, helpRequest: null },
  { name: "木子", title: "Web3 创业者", direction: "DeFi", role: "智能合约开发", avatar: "🦊", checkinCount: 15, lastCheckin: new Date().toISOString().slice(0, 10), status: "away", isFriend: false, isBuddy: false, helpRequest: "困难：Solidity 审计工具选型，求推荐！" },
  { name: "薇薇", title: "内容创作者", direction: "短视频", role: "编导 & 剪辑", avatar: "😎", checkinCount: 33, lastCheckin: new Date().toISOString().slice(0, 10), status: "online", isFriend: false, isBuddy: false, helpRequest: null },
  { name: "老陈", title: "独立咨询师", direction: "企业数字化", role: "技术顾问", avatar: "🤓", checkinCount: 61, lastCheckin: new Date().toISOString().slice(0, 10), status: "business-trip", isFriend: false, isBuddy: false, helpRequest: null },
  { name: "小鱼", title: "跨境电商", direction: "东南亚市场", role: "运营 & 选品", avatar: "🐱", checkinCount: 19, lastCheckin: new Date().toISOString().slice(0, 10), status: "off-work", isFriend: false, isBuddy: false, helpRequest: "求助：印尼物流合作伙伴推荐" },
];

const TOTAL_ROWS = 3;
const TOTAL_COLS = 4;

function buildInitialSeats(): CoworkingSeat[] {
  const seats: CoworkingSeat[] = [];
  const styles: ChairStyle[] = ["gaming", "executive", "minimal", "cute", "standing", "bean"];
  const genders: Array<"male" | "female" | "neutral"> = ["male", "female", "neutral"];
  let mockIdx = 0;

  // Build rows based on mock coworker count (plus one extra row for new folks)
  const rowsNeeded = Math.ceil(MOCK_COWORKERS.length / TOTAL_COLS) + 1;
  const targetRows = Math.max(TOTAL_ROWS, rowsNeeded);

  for (let row = 1; row <= targetRows; row++) {
    for (let col = 1; col <= TOTAL_COLS; col++) {
      const idx = (row - 1) * TOTAL_COLS + col - 1;
      const occupant = mockIdx < MOCK_COWORKERS.length ? MOCK_COWORKERS[mockIdx++] : null;
      seats.push({
        id: `seat-${String.fromCharCode(64 + row)}${col}`,
        row,
        col,
        style: styles[idx % styles.length],
        gender: genders[idx % genders.length],
        occupant,
      });
    }
  }
  return seats;
}

const COWORKING_STORAGE_KEY = "aria_coworking_profile";
const COWORKING_SEATS_KEY = "aria_coworking_seats";

function normalizeOccupantStatus(input: unknown): OccupantStatus {
  const value = String(input || "").trim() as OccupantStatus;
  if (value && Object.prototype.hasOwnProperty.call(OCCUPANT_STATUS_META, value)) {
    return value;
  }
  return "online";
}

function occupantStatusMeta(input: unknown) {
  return OCCUPANT_STATUS_META[normalizeOccupantStatus(input)];
}

function normalizeCoworkingOccupant(input: unknown): CoworkingSeatOccupant | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const raw = input as Record<string, unknown>;
  const name = String(raw.name || "").trim();
  if (!name) {
    return null;
  }
  const parsedCheckinCount = Number.parseInt(String(raw.checkinCount ?? 0), 10);
  const checkinCount = Number.isFinite(parsedCheckinCount) ? Math.max(0, parsedCheckinCount) : 0;
  const helpRaw = raw.helpRequest;
  return {
    name,
    title: String(raw.title || "远程办公成员").trim() || "远程办公成员",
    direction: String(raw.direction || "探索中").trim() || "探索中",
    role: String(raw.role || "自由职业").trim() || "自由职业",
    avatar: String(raw.avatar || "🧑‍💻").trim() || "🧑‍💻",
    checkinCount,
    lastCheckin: String(raw.lastCheckin || new Date().toISOString().slice(0, 10)),
    status: normalizeOccupantStatus(raw.status),
    isFriend: raw.isFriend === true,
    isBuddy: raw.isBuddy === true,
    helpRequest: typeof helpRaw === "string" && helpRaw.trim() ? helpRaw.trim() : null
  };
}

function normalizeCoworkingProfile(input: unknown): MyCoworkingProfile | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const raw = input as Record<string, unknown>;
  const name = String(raw.name || "").trim();
  if (!name) {
    return null;
  }
  const parsedTotalCheckins = Number.parseInt(String(raw.totalCheckins ?? 0), 10);
  const totalCheckins = Number.isFinite(parsedTotalCheckins) ? Math.max(0, parsedTotalCheckins) : 0;
  const parseNameArray = (value: unknown) => {
    if (!Array.isArray(value)) return [];
    return Array.from(
      new Set(
        value
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      )
    );
  };
  const helpRaw = raw.helpRequest;
  return {
    name,
    title: String(raw.title || "远程办公成员").trim() || "远程办公成员",
    direction: String(raw.direction || "探索中").trim() || "探索中",
    role: String(raw.role || "自由职业").trim() || "自由职业",
    avatar: String(raw.avatar || "🧑‍💻").trim() || "🧑‍💻",
    totalCheckins,
    currentSeatId: raw.currentSeatId ? String(raw.currentSeatId) : null,
    registeredAt: String(raw.registeredAt || new Date().toISOString()),
    status: normalizeOccupantStatus(raw.status),
    friendIds: parseNameArray(raw.friendIds),
    buddyIds: parseNameArray(raw.buddyIds),
    helpRequest: typeof helpRaw === "string" && helpRaw.trim() ? helpRaw.trim() : null
  };
}

function normalizeCoworkingSeats(input: unknown): CoworkingSeat[] {
  if (!Array.isArray(input)) {
    return buildInitialSeats();
  }
  const styleSet = new Set<ChairStyle>(["gaming", "executive", "minimal", "cute", "standing", "bean"]);
  const genderSet = new Set(["male", "female", "neutral"]);
  const seats = input
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const raw = item as Record<string, unknown>;
      const parsedRow = Number.parseInt(String(raw.row ?? 0), 10);
      const parsedCol = Number.parseInt(String(raw.col ?? 0), 10);
      const fallbackRow = Math.floor(index / TOTAL_COLS) + 1;
      const fallbackCol = (index % TOTAL_COLS) + 1;
      // Removed the hard TOTAL_ROWS limit to allow infinite rows
      const row = Number.isFinite(parsedRow) && parsedRow >= 1 ? parsedRow : fallbackRow;
      const col = Number.isFinite(parsedCol) && parsedCol >= 1 && parsedCol <= TOTAL_COLS ? parsedCol : fallbackCol;
      const styleRaw = String(raw.style || "");
      const style = styleSet.has(styleRaw as ChairStyle) ? (styleRaw as ChairStyle) : "minimal";
      const genderRaw = String(raw.gender || "");
      const gender = genderSet.has(genderRaw) ? (genderRaw as CoworkingSeat["gender"]) : "neutral";
      return {
        id: String(raw.id || `seat-${String.fromCharCode(64 + row)}${col}`),
        row,
        col,
        style,
        gender,
        occupant: normalizeCoworkingOccupant(raw.occupant)
      };
    });
  if (seats.length === 0) {
    return buildInitialSeats();
  }
  return seats;
}

function loadCoworkingProfile(): MyCoworkingProfile | null {
  try {
    const raw = localStorage.getItem(COWORKING_STORAGE_KEY);
    return raw ? normalizeCoworkingProfile(JSON.parse(raw)) : null;
  } catch { return null; }
}

function loadCoworkingSeats(): CoworkingSeat[] {
  try {
    const raw = localStorage.getItem(COWORKING_SEATS_KEY);
    return raw ? normalizeCoworkingSeats(JSON.parse(raw)) : buildInitialSeats();
  } catch { return buildInitialSeats(); }
}

/* ─────────── Tribute Figures ─────────── */
const TRIBUTE_FIGURES: { name: string; emoji: string; field: string; quote: string }[] = [
  { name: "史蒂夫·乔布斯", emoji: "🍎", field: "Apple 创始人", quote: "Stay hungry, stay foolish." },
  { name: "艾伦·图灵", emoji: "🧮", field: "计算机科学之父", quote: "We can only see a short distance ahead, but we can see plenty there that needs to be done." },
  { name: "列奥纳多·达芬奇", emoji: "🎨", field: "文艺复兴全才", quote: "Simplicity is the ultimate sophistication." },
  { name: "杨振宁", emoji: "⚛️", field: "诺贝尔物理学奖", quote: "对称支配力量，美主宰物理。" },
  { name: "袁隆平", emoji: "🌾", field: "杂交水稻之父", quote: "人就像种子，要做一粒好种子。" },
  { name: "阿达·洛芙莱斯", emoji: "💎", field: "第一位程序员", quote: "That brain of mine is something more than merely mortal, as time will show." },
  { name: "尼古拉·特斯拉", emoji: "⚡", field: "交流电之父", quote: "The present is theirs; the future, for which I really worked, is mine." },
  { name: "阿尔伯特·爱因斯坦", emoji: "🔭", field: "相对论创立者", quote: "Imagination is more important than knowledge." },
];

function TributeQuoteOrb() {
  const [quote, setQuote] = useState<{ name: string; emoji: string; field: string; quote: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Dragging state
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem("aria_tribute_orb_pos");
      if (saved) { const p = JSON.parse(saved); return { x: p.x, y: p.y }; }
    } catch { }
    return { x: window.innerWidth - 80, y: Math.round(window.innerHeight / 2) };
  });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const didDragRef = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    didDragRef.current = false;
    dragStartRef.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDragRef.current = true;
    setPos({ x: dragStartRef.current.ox + dx, y: dragStartRef.current.oy + dy });
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    try { localStorage.setItem("aria_tribute_orb_pos", JSON.stringify(pos)); } catch { }
  };

  const handleOrbClick = () => {
    if (didDragRef.current) return; // ignore click after drag
    if (visible) {
      // toggle off
      setVisible(false);
      if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    } else {
      // spawn new quote
      const fig = TRIBUTE_FIGURES[Math.floor(Math.random() * TRIBUTE_FIGURES.length)];
      setQuote(fig);
      setVisible(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
        timerRef.current = null;
      }, 180_000);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, []);

  return (
    <div
      className="tribute-orb-area"
      style={{ left: pos.x, top: pos.y, right: "auto", transform: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <button type="button" className="tribute-orb-btn" onClick={handleOrbClick}>
        <span className="tribute-orb-icon">🍎</span>
        <span className="tribute-orb-label">Aria</span>
      </button>
      {visible && quote && (
        <div className="tribute-orb-toast" onClick={() => setVisible(false)}>
          <span className="tribute-orb-toast-emoji">{quote.emoji}</span>
          <strong>{quote.name}</strong>
          <small>{quote.field}</small>
          <p>{quote.quote}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────── Interactive Avatar Component ─────────── */
function InteractiveAvatar({
  persona,
  engagement,
  mode,
  activeScene,
  panelQuickActions,
  brainConfigs,
  actionConfigs,
  onPanelQuickOpen,
  onConfigAction,
  onOutfitChange,
  onSwitchPersona,
  onToggleVoiceCall,
  voiceCallActive,
  appTheme,
  onCycleTheme
}: {
  persona: GirlfriendPersona;
  engagement: DemoEngagement | null;
  mode: CompanionMode;
  activeScene: SceneKey;
  panelQuickActions: PanelQuickAction[];
  brainConfigs: AvatarConfigItem[];
  actionConfigs: AvatarConfigItem[];
  onPanelQuickOpen: (panel: PanelKey) => void;
  onConfigAction: (item: AvatarConfigItem, action: AvatarConfigAction) => void;
  onOutfitChange?: (outfit: OutfitVariant) => void;
  onSwitchPersona?: () => void;
  onToggleVoiceCall?: () => void;
  voiceCallActive?: boolean;
  appTheme: AppThemeKey;
  onCycleTheme: () => void;
}) {
  const [blinkPhase, setBlinkPhase] = useState(false);
  const [clickBubble, setClickBubble] = useState<string | null>(null);
  const [clickRipple, setClickRipple] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const getStorageKey = (scene: SceneKey) => `${OUTFIT_STORAGE_PREFIX}${persona.id}_${scene}`;
  const outfitUploadInputRef = useRef<HTMLInputElement>(null);
  const [outfitOverrides, setOutfitOverrides] = useState<Record<string, string>>({});

  const loadOutfitOverrides = () => {
    if (typeof window === "undefined") {
      return {};
    }
    const entries = persona.outfits
      .map((item) => {
        const stored = localStorage.getItem(buildOutfitImageStorageKey(persona.id, item.id)) || "";
        return [item.id, stored] as const;
      })
      .filter(([, value]) => value);
    return Object.fromEntries(entries);
  };

  const [currentOutfit, setCurrentOutfit] = useState<OutfitVariant>(() => {
    if (typeof window !== "undefined") {
      const savedOutfitId = localStorage.getItem(getStorageKey(activeScene)) || "";
      const savedOutfit = persona.outfits.find((item) => item.id === savedOutfitId);
      if (savedOutfit) {
        return savedOutfit;
      }
    }
    const sceneOutfit = persona.outfits.find((item) => item.scene === activeScene);
    return sceneOutfit || persona.outfits[0];
  });
  const clickCountRef = useRef(0);

  // Auto-switch outfit when scene changes
  useEffect(() => {
    setOutfitOverrides(loadOutfitOverrides());
    let nextOutfit: OutfitVariant | undefined;
    if (typeof window !== "undefined") {
      const savedOutfitId = localStorage.getItem(getStorageKey(activeScene)) || "";
      nextOutfit = persona.outfits.find((item) => item.id === savedOutfitId);
    }
    if (!nextOutfit) {
      nextOutfit = persona.outfits.find((item) => item.scene === activeScene) || persona.outfits[0];
    }
    setCurrentOutfit(nextOutfit);
    setAvatarLoadFailed(false);
    onOutfitChange?.(nextOutfit);
  }, [activeScene, persona.id, persona.outfits, onOutfitChange]);

  // CSS-driven blink every 3-5 seconds
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        setBlinkPhase(true);
        setTimeout(() => setBlinkPhase(false), 180);
        timerId = scheduleBlink();
      }, delay);
    };
    let timerId = scheduleBlink();
    return () => clearTimeout(timerId);
  }, []);

  // Auto-dismiss click bubble
  useEffect(() => {
    if (!clickBubble) return;
    const timer = setTimeout(() => setClickBubble(null), 2500);
    return () => clearTimeout(timer);
  }, [clickBubble]);

  const handleAvatarClick = () => {
    clickCountRef.current += 1;
    const sceneResponses = persona.sceneClickResponses?.[activeScene];
    const responses = sceneResponses && sceneResponses.length > 0 ? sceneResponses : (persona.clickResponses.length > 0 ? persona.clickResponses : DEFAULT_CLICK_RESPONSES);
    const idx = clickCountRef.current % responses.length;
    setClickBubble(responses[idx]);
    setClickRipple(true);
    setTimeout(() => setClickRipple(false), 500);
  };

  const handleOutfitSwitch = (outfit: OutfitVariant) => {
    setCurrentOutfit(outfit);
    setAvatarLoadFailed(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(activeScene), outfit.id);
    }
    onOutfitChange?.(outfit);
  };

  const handleOutfitImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setClickBubble("请上传图片文件（jpg/png/webp）。");
      return;
    }
    const maxBytes = 6 * 1024 * 1024;
    if (file.size > maxBytes) {
      setClickBubble("图片太大啦，请选择 6MB 以内。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl) {
        setClickBubble("上传失败，请再试一次。");
        return;
      }
      setOutfitOverrides((prev) => ({
        ...prev,
        [currentOutfit.id]: dataUrl
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(buildOutfitImageStorageKey(persona.id, currentOutfit.id), dataUrl);
      }
      setAvatarLoadFailed(false);
      setClickBubble(`已更新「${currentOutfit.label}」换装图`);
    };
    reader.onerror = () => {
      setClickBubble("图片读取失败，请重试。");
    };
    reader.readAsDataURL(file);
  };

  const resetCurrentOutfitImage = () => {
    setOutfitOverrides((prev) => {
      const next = { ...prev };
      delete next[currentOutfit.id];
      return next;
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(buildOutfitImageStorageKey(persona.id, currentOutfit.id));
    }
    setAvatarLoadFailed(false);
    setClickBubble(`已恢复「${currentOutfit.label}」默认换装图`);
  };

  const currentOutfitAvatar = outfitOverrides[currentOutfit.id] || currentOutfit.avatar;
  const avatarSrc = avatarLoadFailed ? persona.avatar : currentOutfitAvatar;

  return (
    <aside
      className="avatar-panel"
      style={{ "--persona-accent": persona.accentColor, "--persona-accent-soft": persona.accentSoft } as React.CSSProperties}
    >
      <div className="avatar-header">
        <div className="avatar-name-bar">
          <h2 className="avatar-name">{persona.name}</h2>
          <span className="avatar-mode-chip">{mode}</span>
        </div>
        <p className="avatar-subtitle">{persona.subtitle}</p>
        {engagement && (
          <div className="avatar-stats-mini">
            <span>Lv.{engagement.level}</span>
            <span>·</span>
            <span>🔥 {engagement.streakDays}天</span>
            <span>·</span>
            <span>✨ {engagement.xp} XP</span>
          </div>
        )}
      </div>

      <div className="avatar-skill-layout">
        {/* Top: Quick shortcuts */}
        <section className="skill-tile-row quickdock-row">
          <div className="skill-tile-header">
            <span className="skill-tile-category-icon">🧭</span>
            <span className="skill-tile-header-label">快捷功能</span>
          </div>
          <div className="avatar-panel-quickdock">
            {panelQuickActions.map((item) => (
              <button
                key={`avatar-panel-${item.id}`}
                type="button"
                className={item.active ? "is-active" : ""}
                onClick={() => onPanelQuickOpen(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Top: Brain System tiles (horizontal row) */}
        <section className="skill-tile-row skill-tile-row-brain">
          <div className="skill-tile-header">
            <span className="skill-tile-category-icon">🧠</span>
            <span className="skill-tile-header-label">脑系统</span>
          </div>
          <div className="skill-tile-grid">
            {brainConfigs.map((item, i) => (
              <div
                key={item.id}
                className={`skill-tile ${activeScene === item.scene ? "is-active-scene" : ""}`}
                style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="skill-tile-btn"
                  onClick={() => onConfigAction(item, "open")}
                  title={`${item.title} — ${item.desc}`}
                >
                  <span className="skill-tile-icon">{item.icon}</span>
                  <span className="skill-tile-label">{item.shortLabel}</span>
                </button>
                <div className="skill-tile-tooltip">
                  <h4>{item.icon} {item.title}</h4>
                  <p>{item.desc}</p>
                  <div className="skill-tile-actions">
                    <button type="button" onClick={() => onConfigAction(item, "open")}>📂 配置</button>
                    <button type="button" onClick={() => onConfigAction(item, "upload")}>📤 上传</button>
                    <button type="button" onClick={() => onConfigAction(item, "edit")}>✏️ 编辑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Center: 3D Avatar */}
        <div className="avatar-core-stage" data-scene={activeScene}>
          <div
            className="avatar-3d-container"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleAvatarClick();
              }
            }}
          >
            {clickBubble && (
              <div className="avatar-speech-bubble">
                <span>{clickBubble}</span>
                <div className="speech-bubble-tail" />
              </div>
            )}
            <img
              src={avatarSrc}
              alt={persona.name}
              className={`avatar-3d ${blinkPhase ? "is-blinking" : ""} ${clickRipple ? "is-clicked" : ""}`}
              onError={() => {
                if (!avatarLoadFailed) {
                  setAvatarLoadFailed(true);
                }
              }}
              onLoad={() => {
                if (avatarLoadFailed) {
                  setAvatarLoadFailed(false);
                }
              }}
            />
            <div className="avatar-3d-glow" />
            <div className="avatar-3d-floor" />
            <span className="avatar-outfit-badge">
              👗 {currentOutfit.label}{avatarLoadFailed ? "（备用形象）" : ""}
            </span>
          </div>
        </div>

        {/* Bottom: Actions & Skills tiles (horizontal row) */}
        <section className="skill-tile-row">
          <div className="skill-tile-header">
            <span className="skill-tile-category-icon">🧩</span>
            <span className="skill-tile-header-label">技能执行</span>
          </div>
          <div className="skill-tile-grid">
            {actionConfigs.map((item, i) => (
              <div
                key={item.id}
                className={`skill-tile ${activeScene === item.scene ? "is-active-scene" : ""}`}
                style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="skill-tile-btn"
                  onClick={() => onConfigAction(item, "open")}
                  title={`${item.title} — ${item.desc}`}
                >
                  <span className="skill-tile-icon">{item.icon}</span>
                  <span className="skill-tile-label">{item.shortLabel}</span>
                </button>
                <div className="skill-tile-tooltip">
                  <h4>{item.icon} {item.title}</h4>
                  <p>{item.desc}</p>
                  <div className="skill-tile-actions">
                    <button type="button" onClick={() => onConfigAction(item, "open")}>📂 配置</button>
                    <button type="button" onClick={() => onConfigAction(item, "upload")}>📤 上传</button>
                    <button type="button" onClick={() => onConfigAction(item, "edit")}>✏️ 编辑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {persona.outfits.length > 1 && (
        <div className="outfit-switcher">
          <div className="outfit-header">
            <span className="outfit-label">👗 左侧换装</span>
          </div>
          <div className="outfit-options">
            {persona.outfits.map((outfit) => (
              <button
                key={outfit.id}
                type="button"
                className={`outfit-chip ${currentOutfit.id === outfit.id ? "is-active" : ""}`}
                onClick={() => handleOutfitSwitch(outfit)}
              >
                {outfit.label}
              </button>
            ))}
          </div>
          <div className="outfit-action-row">
            <button
              type="button"
              className="outfit-chip outfit-action-chip"
              onClick={() => onSwitchPersona?.()}
            >
              🔄 切换女友
            </button>
            <button
              type="button"
              className="outfit-chip outfit-action-chip"
              onClick={() => outfitUploadInputRef.current?.click()}
            >
              📤 上传当前换装图
            </button>
            {outfitOverrides[currentOutfit.id] ? (
              <button
                type="button"
                className="outfit-chip outfit-action-chip"
                onClick={resetCurrentOutfitImage}
              >
                ♻️ 恢复默认图
              </button>
            ) : null}
          </div>
          <input
            ref={outfitUploadInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleOutfitImagePick}
          />
        </div>
      )}

      {engagement && (
        <div className="avatar-xp-bar">
          <div className="avatar-xp-track">
            <div className="avatar-xp-fill" style={{ width: `${levelProgress(engagement)}%` }} />
          </div>
          <span className="avatar-xp-label">升级进度 {levelProgress(engagement)}%</span>
        </div>
      )}
      {/* ── 底部操作区（语音与主题） ── */}
      <div className="sidebar-bottom-actions">
        <button
          type="button"
          className={`sidebar-phone-call-icon-btn ${voiceCallActive ? "is-active" : ""}`.trim()}
          onClick={() => onToggleVoiceCall?.()}
          title={voiceCallActive ? "结束语音通话" : "语音通话"}
          aria-label={voiceCallActive ? "结束语音通话" : "发起语音通话"}
        >
          <span className="phone-icon-pulse" />
          📞
        </button>

        <button
          type="button"
          className="app-theme-toggle"
          onClick={onCycleTheme}
          title={`切换主题：${appTheme === "cyber" ? "荧光动效" : appTheme === "tribute" ? "致敬前辈" : "极简空白"}`}
        >
          🐱
        </button>
      </div>

    </aside>
  );
}

/* ─────────── Main App ─────────── */
function App() {
  const [selectedPersona, setSelectedPersona] = useState<GirlfriendPersona | null>(() => {
    const saved = localStorage.getItem("aria_selected_persona");
    if (saved) {
      const found = PERSONAS.find((p) => p.id === saved);
      if (found) return found;
    }
    return null;
  });
  const [activeScene, setActiveScene] = useState<SceneKey>("love");
  const [appTheme, setAppTheme] = useState<AppThemeKey>(() => {
    try {
      const saved = localStorage.getItem("aria_app_theme") as AppThemeKey;
      if (saved && ["cyber", "tribute", "quiet"].includes(saved)) return saved;
    } catch { }
    return "cyber";
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [withdrawingLastMessage, setWithdrawingLastMessage] = useState(false);
  const [streamStatus, setStreamStatus] = useState<"idle" | "loading" | "streaming" | "error">("idle");
  const [error, setError] = useState("");
  const [streamError, setStreamError] = useState("");
  const [latestRouteInfo, setLatestRouteInfo] = useState<ModelRouteInfo | null>(null);
  const [latestRouteScene, setLatestRouteScene] = useState<SceneKey>("coding");
  const [latestRouteUserText, setLatestRouteUserText] = useState("");
  const [routeTraceEvents, setRouteTraceEvents] = useState<RouteTraceEvent[]>([]);
  const [routeAutoHealBusy, setRouteAutoHealBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [lastFailedDraft, setLastFailedDraft] = useState("");
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [memoryHighlights, setMemoryHighlights] = useState<string[]>([]);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memorySearching, setMemorySearching] = useState(false);
  const [memoryResults, setMemoryResults] = useState<MemorySearchItem[]>([]);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [engagement, setEngagement] = useState<DemoEngagement | null>(null);
  const [proactiveState, setProactiveState] = useState<DemoProactiveState | null>(null);
  const [proactiveResult, setProactiveResult] = useState<ProactiveNextResult | null>(null);
  const [proactiveLoading, setProactiveLoading] = useState(false);
  const [autonomyState, setAutonomyState] = useState<DemoAutonomyState | null>(null);
  const [autonomyInbox, setAutonomyInbox] = useState<DemoAutonomyInboxItem[]>([]);
  const [autonomyLoading, setAutonomyLoading] = useState(false);
  const [autonomyQueueBusyId, setAutonomyQueueBusyId] = useState("");
  const [flywheelState, setFlywheelState] = useState<AriaKernelFlywheelState | null>(null);
  const [flywheelReplaying, setFlywheelReplaying] = useState(false);
  const [capabilityAssessment, setCapabilityAssessment] = useState<CapabilityAssessmentResult | null>(null);
  const [workdayState, setWorkdayState] = useState<DemoWorkdayState | null>(null);
  const [workdayLoading, setWorkdayLoading] = useState(false);
  const [runtimeHealth, setRuntimeHealth] = useState<RuntimeHealthResult | null>(null);
  const [runtimeHealing, setRuntimeHealing] = useState(false);
  const [runtimeConfigSaving, setRuntimeConfigSaving] = useState(false);
  const [incidentGuardrailSaving, setIncidentGuardrailSaving] = useState(false);
  const [checkinEnergy, setCheckinEnergy] = useState(3);
  const [checkinPressure, setCheckinPressure] = useState(3);
  const [checkinIntent, setCheckinIntent] = useState("");
  const [codingIntent, setCodingIntent] = useState("");
  const [workbenchState, setWorkbenchState] = useState<DemoWorkbenchState | null>(null);
  const [workbenchDraft, setWorkbenchDraft] = useState("");
  const [workToolsOpen, setWorkToolsOpen] = useState(false);
  const [workbenchLoading, setWorkbenchLoading] = useState(false);
  const [activeWorkbenchToolId, setActiveWorkbenchToolId] = useState("");
  const [xhsThemeDraft, setXhsThemeDraft] = useState("");
  const [xhsAssetsDirDraft, setXhsAssetsDirDraft] = useState(XHS_DEFAULT_ASSETS_DIR);
  const [xhsModelDraft, setXhsModelDraft] = useState("gpt-4.1-mini");
  const [xhsPublishEnabled, setXhsPublishEnabled] = useState(false);
  const [xhsHeadlessEnabled, setXhsHeadlessEnabled] = useState(false);
  const [xhsSkipUploadEnabled, setXhsSkipUploadEnabled] = useState(false);
  const [xhsPipelineBusy, setXhsPipelineBusy] = useState(false);
  const [xhsPipelineError, setXhsPipelineError] = useState("");
  const [xhsPipelineJob, setXhsPipelineJob] = useState<XhsPipelineJob | null>(null);
  const [xhsPipelineJobs, setXhsPipelineJobs] = useState<XhsPipelineJob[]>([]);
  const [xhsPipelineNextStepHint, setXhsPipelineNextStepHint] = useState("第 1 步：输入主题和素材目录，然后点击开始执行。");
  const [expansionState, setExpansionState] = useState<DemoExpansionState | null>(null);
  const [sceneConfigState, setSceneConfigState] = useState<DemoSceneConfigState | null>(null);
  const [systemConfigState, setSystemConfigState] = useState<SystemConfigResult | null>(null);
  const [expansionLoading, setExpansionLoading] = useState(false);
  const [systemConfigLoading, setSystemConfigLoading] = useState(false);
  const [systemConfigSaving, setSystemConfigSaving] = useState(false);
  const [personaQuickSwitching, setPersonaQuickSwitching] = useState(false);
  const [systemConfigAriaKernelSyncing, setSystemConfigAriaKernelSyncing] = useState(false);
  const [systemConfigHistoryLoading, setSystemConfigHistoryLoading] = useState(false);
  const [systemConfigRollbacking, setSystemConfigRollbacking] = useState(false);
  const [systemConfigHistoryState, setSystemConfigHistoryState] = useState<SystemConfigResult["configOps"] | null>(null);
  const [codingPatchGateState, setCodingPatchGateState] = useState<CodingPatchGateState | null>(null);
  const [codingPatchDraftState, setCodingPatchDraftState] = useState<CodingPatchDraft | null>(null);
  const [codingPatchLastReceipt, setCodingPatchLastReceipt] = useState<CodingPatchReceipt | null>(null);
  const [codingProjectTreeState, setCodingProjectTreeState] = useState<CodingProjectTreeState | null>(null);
  const [codingFilePreviewState, setCodingFilePreviewState] = useState<CodingFilePreviewState | null>(null);
  const [codingTreeLoading, setCodingTreeLoading] = useState(false);
  const [codingFilePreviewLoading, setCodingFilePreviewLoading] = useState(false);
  const [codingSelectedDirectoryPath, setCodingSelectedDirectoryPath] = useState("");
  const [codingSelectedFilePath, setCodingSelectedFilePath] = useState("");
  const [codingTreeSearchDraft, setCodingTreeSearchDraft] = useState("");
  const [codingTreeCollapsedPaths, setCodingTreeCollapsedPaths] = useState<string[]>([]);
  const [codingPatchObjectiveDraft, setCodingPatchObjectiveDraft] = useState("修复构建报错并生成最小补丁");
  const [codingPatchCwdDraft, setCodingPatchCwdDraft] = useState("apps/desktop");
  const [codingPatchVerifyDraft, setCodingPatchVerifyDraft] = useState("npm run build:web");
  const [codingPatchPreviewing, setCodingPatchPreviewing] = useState(false);
  const [codingPatchApplying, setCodingPatchApplying] = useState(false);
  const [codingPatchRollbacking, setCodingPatchRollbacking] = useState(false);
  const [codingLayoutMode, setCodingLayoutMode] = useState<"focus_chat" | "triple">(() => {
    if (typeof window === "undefined") {
      return "focus_chat";
    }
    const saved = String(localStorage.getItem(CODING_LAYOUT_MODE_STORAGE_KEY) || "").trim();
    return saved === "triple" ? "triple" : "focus_chat";
  });
  const [codingWorkspaceSyncing, setCodingWorkspaceSyncing] = useState(false);
  const [codingWorkspaceOpening, setCodingWorkspaceOpening] = useState(false);
  const [codingWorkspacePicking, setCodingWorkspacePicking] = useState(false);
  const [codingWorkspaceNotice, setCodingWorkspaceNotice] = useState<{
    tone: "success" | "info" | "error";
    text: string;
  } | null>(null);
  const [legacyCompatBridgeState, setLegacyCompatBridgeState] = useState(() => getLegacyCompatBridgeConfig());
  const [legacyCompatRollbackTarget, setLegacyCompatRollbackTarget] = useState<boolean | null>(null);
  const [legacyCompatApplying, setLegacyCompatApplying] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [unifiedTimelineState, setUnifiedTimelineState] = useState<UnifiedTimelineResult | null>(null);
  const [timelineReplayState, setTimelineReplayState] = useState<UnifiedTimelineReplayResult | null>(null);
  const [timelineDiagnosisState, setTimelineDiagnosisState] = useState<TimelineFlowDiagnosis | null>(null);
  const [timelineRepairingFlowId, setTimelineRepairingFlowId] = useState("");
  const [agiViewportOpen, setAgiViewportOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(AGI_VIEWPORT_OPEN_STORAGE_KEY) !== "0";
  });
  const [agiViewportFlowId, setAgiViewportFlowId] = useState("");
  const [agiSceneExecutionSignals, setAgiSceneExecutionSignals] = useState<Record<SceneKey, AgiSceneExecutionSignal>>(
    createDefaultAgiSceneExecutionSignalMap
  );

  /* ── Creative Canvas State ── */
  const [canvasSceneActive, setCanvasSceneActive] = useState(false);
  const [canvasTab, setCanvasTab] = useState<CanvasTab>("draw");
  const [canvasNotes, setCanvasNotes] = useState<CanvasNote[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CANVAS_NOTES_KEY);
      return raw ? (JSON.parse(raw) as CanvasNote[]) : [];
    } catch { return []; }
  });
  const [canvasFiles, setCanvasFiles] = useState<CanvasFileCard[]>([]);
  const [canvasMiniApps, setCanvasMiniApps] = useState<CanvasMiniApp[]>([]);
  const [canvasFileDragging, setCanvasFileDragging] = useState(false);
  const [canvasBrushColor, setCanvasBrushColor] = useState("#d4813a");
  const [canvasBrushSize, setCanvasBrushSize] = useState(3);
  const [canvasIsEraser, setCanvasIsEraser] = useState(false);
  const canvasDrawRef = useRef<HTMLCanvasElement>(null);
  const canvasIsDrawingRef = useRef(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const pomodoroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [systemDefaultRouteDraft, setSystemDefaultRouteDraft] = useState("");
  const [systemFallbackRouteDraft, setSystemFallbackRouteDraft] = useState("");
  const [systemEnabledScenesDraft, setSystemEnabledScenesDraft] = useState<SceneKey[]>([
    "work",
    "fun",
    "life",
    "love",
    "coding"
  ]);
  const [systemDegradeTimeoutDraft, setSystemDegradeTimeoutDraft] = useState(20000);
  const [systemDegradeRetryDraft, setSystemDegradeRetryDraft] = useState(2);
  const [personaIntensityLevelDraft, setPersonaIntensityLevelDraft] = useState<PersonaIntensityLevel>("L2");
  const [goalClarifyThresholdDraft, setGoalClarifyThresholdDraft] = useState(0.72);
  const [authorityLearningCronDraft, setAuthorityLearningCronDraft] = useState("0 */6 * * *");
  const [feedbackDigestCronDraft, setFeedbackDigestCronDraft] = useState("*/30 * * * *");
  const [crossSceneRecallTopKDraft, setCrossSceneRecallTopKDraft] = useState(6);
  const [contextImportanceThresholdDraft, setContextImportanceThresholdDraft] = useState(0.72);
  const [mcpBrowserRuntimeEnabledDraft, setMcpBrowserRuntimeEnabledDraft] = useState(true);
  const [githubSkillDiscoveryEnabledDraft, setGithubSkillDiscoveryEnabledDraft] = useState(true);
  const [voiceEnabledDraft, setVoiceEnabledDraft] = useState(true);
  const [voiceProfileState, setVoiceProfileState] = useState<VoiceProfileState | null>(null);
  const [voiceProfileLoading, setVoiceProfileLoading] = useState(false);
  const [voicePresetSaving, setVoicePresetSaving] = useState(false);
  const [voicePresetDraftId, setVoicePresetDraftId] = useState("gentle_female");
  const [bluetoothEnabledDraft, setBluetoothEnabledDraft] = useState(true);
  const [vectorBackendModeDraft, setVectorBackendModeDraft] = useState<"local" | "qdrant">("local");
  const [vectorQdrantUrlDraft, setVectorQdrantUrlDraft] = useState("http://127.0.0.1:6333");
  const [vectorQdrantCollectionDraft, setVectorQdrantCollectionDraft] = useState("aria_memory");
  const [vectorQdrantTimeoutDraft, setVectorQdrantTimeoutDraft] = useState(6000);
  const [vectorBackendApplying, setVectorBackendApplying] = useState(false);
  const [memoryBackendCheck, setMemoryBackendCheck] = useState<MemoryBackendSelfCheckResult | null>(null);
  const [memoryBackendChecking, setMemoryBackendChecking] = useState(false);
  const [systemTaskRoutesDraft, setSystemTaskRoutesDraft] = useState<Record<string, string>>({});
  const [systemTaskRouteKeyDraft, setSystemTaskRouteKeyDraft] = useState("");
  const [sceneModelDrafts, setSceneModelDrafts] = useState<Record<SceneKey, string>>(() => {
    if (typeof window === "undefined") {
      return {
        work: "",
        fun: "",
        life: "",
        love: "",
        coding: ""
      };
    }
    try {
      const raw = localStorage.getItem(SCENE_MODEL_PREFS_KEY);
      if (!raw) {
        return {
          work: "",
          fun: "",
          life: "",
          love: "",
          coding: ""
        };
      }
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return {
        work: String(parsed.work || "").trim(),
        fun: String(parsed.fun || "").trim(),
        life: String(parsed.life || "").trim(),
        love: String(parsed.love || "").trim(),
        coding: String(parsed.coding || "").trim()
      };
    } catch {
      return {
        work: "",
        fun: "",
        life: "",
        love: "",
        coding: ""
      };
    }
  });
  const [autonomyDispatchRouteDraft, setAutonomyDispatchRouteDraft] = useState("");
  const [superSkillDraftEntries, setSuperSkillDraftEntries] = useState<SuperSkillDraftEntry[]>([]);
  const [superQueueRetryBudgetDraft, setSuperQueueRetryBudgetDraft] = useState(3);
  const [superQueueBackoffDraft, setSuperQueueBackoffDraft] = useState(1200);
  const [superCircuitFailureDraft, setSuperCircuitFailureDraft] = useState(3);
  const [superCircuitCooldownDraft, setSuperCircuitCooldownDraft] = useState(45000);
  const [fusionLongTaskThresholdDraft, setFusionLongTaskThresholdDraft] = useState(8);
  const [fusionProgressIntervalDraft, setFusionProgressIntervalDraft] = useState(30);
  const [fusionBlockReportDraft, setFusionBlockReportDraft] = useState(30);
  const [configOperatorNameDraft, setConfigOperatorNameDraft] = useState(() => {
    if (typeof window === "undefined") return "运营负责人";
    return localStorage.getItem("aria_config_operator_name") || "运营负责人";
  });
  const [configChangeReasonDraft, setConfigChangeReasonDraft] = useState("提升独立运营稳定性");
  const [expansionDraftUrl, setExpansionDraftUrl] = useState("");
  const [coworkingSeats, setCoworkingSeats] = useState<CoworkingSeat[]>(() => loadCoworkingSeats());
  const [myCoworkingProfile, setMyCoworkingProfile] = useState<MyCoworkingProfile | null>(() => loadCoworkingProfile());
  const [coworkingView, setCoworkingView] = useState(false);
  const [showCoworkingRegistration, setShowCoworkingRegistration] = useState(false);
  const [cwRegName, setCwRegName] = useState("");
  const [cwRegTitle, setCwRegTitle] = useState("");
  const [cwRegDirection, setCwRegDirection] = useState("");
  const [cwRegRole, setCwRegRole] = useState("");
  const [cwRegAvatar, setCwRegAvatar] = useState("👨‍💻");

  // Coworking Interaction States
  const [coworkingSelectedSeatId, setCoworkingSelectedSeatId] = useState<string | null>(null);
  const [coworkingSpeakingSeatId, setCoworkingSpeakingSeatId] = useState<string | null>(null);
  const [showCwStatusPicker, setShowCwStatusPicker] = useState(false);
  const [cwHelpDraft, setCwHelpDraft] = useState("");
  const [deviceOpsState, setDeviceOpsState] = useState<DemoDeviceOpsState | null>(null);
  const [deviceTasks, setDeviceTasks] = useState<DeviceTask[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [l3TakeoverApplying, setL3TakeoverApplying] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatusResult | null>(null);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [voiceCallListening, setVoiceCallListening] = useState(false);
  const [mode, setMode] = useState<CompanionMode>("陪伴");
  const [online, setOnline] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");
  const [userId, setUserId] = useState(getCachedUserId());
  const [rightPanel, setRightPanel] = useState<PanelKey>(sceneMeta.love.defaultPanel);
  const [showOnboarding, setShowOnboarding] = useState(
    () => (typeof window === "undefined" ? false : localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "1")
  );
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activeBrainModule, setActiveBrainModule] = useState<BrainModuleKey>("modelApi");
  const [activeFunLeftModuleId, setActiveFunLeftModuleId] = useState(funLeftModules[0].id);
  const [activeFunRightModuleId, setActiveFunRightModuleId] = useState(funRightModules[0].id);
  const [showFunConfigBubble, setShowFunConfigBubble] = useState(false);
  const [funModelConfigDraft, setFunModelConfigDraft] = useState<FunModelConfigDraft>({
    tone: FUN_MODEL_TONE_OPTIONS[0],
    mode: FUN_MODEL_MODE_OPTIONS[0],
    reward: FUN_MODEL_REWARD_OPTIONS[1],
    note: ""
  });
  const [funSubConfigActionId, setFunSubConfigActionId] = useState("");
  const [funSubConfigInput, setFunSubConfigInput] = useState("");
  const [funGameDraft, setFunGameDraft] = useState<FunGameDraft>({
    difficulty: "easy",
    rounds: 6,
    scoreEnabled: true,
    rewardEnabled: true,
    reviveEnabled: true,
    templateName: "我的手搓模板"
  });
  const [funGames, setFunGames] = useState<DemoFunGame[]>([]);
  const [activeFunFriendId, setActiveFunFriendId] = useState(funFriendList[0].id);
  const [funFriendUnread, setFunFriendUnread] = useState<Record<string, number>>({});
  const [funFriendFeed, setFunFriendFeed] = useState<Array<{
    id: string;
    friendId: string;
    friendName: string;
    avatar: string;
    text: string;
    at: string;
  }>>([]);
  const [activeLifeModuleId, setActiveLifeModuleId] = useState(lifeLeftModules[0].id);
  const [showLifeConfigBubble, setShowLifeConfigBubble] = useState(false);
  const [lifeConfigInput, setLifeConfigInput] = useState("");
  const [activeLoveModuleId, setActiveLoveModuleId] = useState(loveLeftModules[0].id);
  const [showLoveConfigBubble, setShowLoveConfigBubble] = useState(false);
  const [loveConfigInput, setLoveConfigInput] = useState("");
  const [sceneConfigApplyingKey, setSceneConfigApplyingKey] = useState("");
  const [momentumToast, setMomentumToast] = useState("");
  const [sceneSoulDrafts, setSceneSoulDrafts] = useState<Record<SceneSoulTarget, string>>({
    work: "",
    fun: "",
    life: "",
    love: ""
  });
  const [sceneSoulUploads, setSceneSoulUploads] = useState<Record<SceneSoulTarget, SceneSoulUploadedFile[]>>({
    work: [],
    fun: [],
    life: [],
    love: []
  });
  const [pendingImages, setPendingImages] = useState<PendingImageDraft[]>([]);
  const [queuedSendCount, setQueuedSendCount] = useState(0);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const activeMessageListRef = useRef<HTMLDivElement>(null);
  const chatAutoFollowRef = useRef(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const workFileInputRef = useRef<HTMLInputElement>(null);
  const outgoingQueueRef = useRef<OutgoingQueueItem[]>([]);
  const voiceCallRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const voiceCallShouldRunRef = useRef(false);
  const voiceCallRestartTimerRef = useRef<number | null>(null);
  const lastVoiceTranscriptRef = useRef("");
  const lastVoiceTranscriptAtRef = useRef(0);
  const activeSceneRef = useRef<SceneKey>(activeScene);
  const rightPanelRef = useRef<PanelKey>(rightPanel);
  const voiceCallActiveRef = useRef(false);
  const voiceChannelTokenRef = useRef("");
  const voiceChannelOwnerRef = useRef("");
  const voiceChannelHeartbeatTimerRef = useRef<number | null>(null);
  const voiceChannelLeaseMsRef = useRef(30000);
  const voiceTtsQueueRef = useRef<string[]>([]);
  const voiceTtsRunningRef = useRef(false);
  const voiceTtsSpokenUntilRef = useRef(0);
  const voiceTtsCooldownUntilRef = useRef(0);
  const voiceTtsPlaybackTokenRef = useRef(0);
  const chatExecutionFollowupTimerRef = useRef<number | null>(null);
  const chatExecutionFollowupTokenRef = useRef(0);
  const chatExecutionFollowupDeadlineAtRef = useRef(0);
  const chatExecutionFollowupDispatchIdRef = useRef("");
  const chatExecutionFollowupSceneRef = useRef<SceneKey | "">("");

  const headerLine = useMemo(() => sceneMeta[activeScene].hint, [activeScene]);
  const visiblePanels = useMemo<PanelKey[]>(() => {
    const panels = sceneMeta[activeScene].panels;
    return panels.includes(rightPanel) ? panels : [...panels, rightPanel];
  }, [activeScene, rightPanel]);
  const combinedErrorText = useMemo(() => {
    const entries = [
      { scope: "同步失败", message: error.trim() },
      { scope: "状态异常", message: streamError.trim() }
    ].filter((item) => item.message);
    if (entries.length === 0) return "";
    const grouped = new Map<string, string[]>();
    for (const entry of entries) {
      const scopes = grouped.get(entry.message) || [];
      scopes.push(entry.scope);
      grouped.set(entry.message, scopes);
    }
    return Array.from(grouped.entries())
      .map(([message, scopes]) => {
        const scopeList = Array.from(new Set(scopes));
        const scopeText = scopeList.length > 1 ? "连接异常" : scopeList[0];
        return `${scopeText}：${message}`;
      })
      .join("；");
  }, [error, streamError]);
  const sceneMessageBuckets = useMemo<Record<SceneKey, DemoMessage[]>>(() => {
    const buckets: Record<SceneKey, DemoMessage[]> = {
      work: [],
      fun: [],
      life: [],
      love: [],
      coding: []
    };
    for (const item of messages) {
      const scene = normalizeMessageScene(item.scene);
      buckets[scene].push(item);
    }
    return buckets;
  }, [messages]);
  const canWithdrawSceneMap = useMemo<Record<SceneKey, boolean>>(() => {
    const flags: Record<SceneKey, boolean> = {
      work: false,
      fun: false,
      life: false,
      love: false,
      coding: false
    };
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const item = messages[index];
      if (!item || item.role !== "user") {
        continue;
      }
      const messageId = String(item.id || "").trim().toLowerCase();
      if (messageId.startsWith("boot-")) {
        continue;
      }
      const scene = normalizeMessageScene(item.scene);
      flags[scene] = true;
    }
    return flags;
  }, [messages]);
  const voicePresetOptions = useMemo(
    () => (voiceProfileState?.presets?.length ? voiceProfileState.presets : fallbackVoicePresetOptions),
    [voiceProfileState]
  );
  const activeVoicePreset = useMemo(() => {
    if (voicePresetOptions.length === 0) {
      return null;
    }
    const activePresetId = String(voiceProfileState?.activePresetId || "").trim();
    if (activePresetId) {
      const matchedById = voicePresetOptions.find((item) => item.id === activePresetId);
      if (matchedById) {
        return matchedById;
      }
    }
    const activeVoiceName = String(voiceProfileState?.defaultVoice || "").trim();
    return voicePresetOptions.find((item) => item.voice === activeVoiceName) || null;
  }, [voicePresetOptions, voiceProfileState]);
  const activeCodingPatchDraft = useMemo(
    () => codingPatchDraftState || codingPatchGateState?.drafts?.[0] || null,
    [codingPatchDraftState, codingPatchGateState]
  );
  const activeCodingPatchReceipt = useMemo(
    () => codingPatchLastReceipt || codingPatchGateState?.receipts?.[0] || null,
    [codingPatchLastReceipt, codingPatchGateState]
  );
  const sceneModuleStateMap = useMemo(() => {
    const map = new Map<string, DemoSceneConfigState["modules"][string]>();
    const modules = sceneConfigState?.modules || {};
    for (const [key, value] of Object.entries(modules)) {
      map.set(key, value);
    }
    return map;
  }, [sceneConfigState]);
  const workbenchLeftModules = useMemo(() => {
    const allowedIds = new Set(["coding_skill", "mcp_hub"]);
    const deduped = new Map<string, DemoWorkbenchState["leftModules"][number]>();
    for (const item of workbenchState?.leftModules || []) {
      if (!allowedIds.has(item.id) || deduped.has(item.id)) continue;
      deduped.set(item.id, item);
    }
    return Array.from(deduped.values());
  }, [workbenchState]);
  const expansionPreviewPacks = useMemo(() => {
    const deduped = new Map<string, DemoExpansionState["packs"][number]>();
    for (const pack of expansionState?.packs || []) {
      if (deduped.has(pack.id)) continue;
      deduped.set(pack.id, pack);
    }
    return Array.from(deduped.values()).slice(0, 6);
  }, [expansionState]);
  const expansionRecentJobs = useMemo(() => {
    const jobs: DemoExpansionState["jobs"] = [];
    const seen = new Set<string>();
    for (const job of expansionState?.jobs || []) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      jobs.push(job);
      if (jobs.length >= 4) break;
    }
    return jobs;
  }, [expansionState]);
  const xhsActiveJob = useMemo(
    () => xhsPipelineJob || xhsPipelineJobs[0] || null,
    [xhsPipelineJob, xhsPipelineJobs]
  );
  const xhsJobIsRunning = useMemo(
    () => Boolean(xhsActiveJob && (xhsActiveJob.status === "queued" || xhsActiveJob.status === "running")),
    [xhsActiveJob]
  );
  const xhsWorkflowStepIndex = useMemo(() => {
    if (!xhsActiveJob) return 0;
    const logs = Array.isArray(xhsActiveJob.logs) ? xhsActiveJob.logs : [];
    const joined = logs.map((item) => String(item.text || "")).join("\n");
    if (xhsActiveJob.status === "completed") return XHS_WORKFLOW_STEPS.length;
    if (xhsActiveJob.uploadStatus || /上传状态|发布/i.test(joined)) return 5;
    if (xhsActiveJob.videoFile || /视频文件|剪辑|转码|concat|clip/i.test(joined)) return 4;
    if (/素材|导入|assets/i.test(joined)) return 3;
    if (/文案|copy|title|content/i.test(joined)) return 2;
    return 1;
  }, [xhsActiveJob]);
  const codingWorkspace = useMemo(
    () => workbenchState?.coding?.workspace || null,
    [workbenchState]
  );
  const codingTreeNodes = useMemo(
    () => (codingProjectTreeState?.nodes || []),
    [codingProjectTreeState]
  );
  const codingTreeSearchKeyword = useMemo(
    () => codingTreeSearchDraft.trim().toLowerCase(),
    [codingTreeSearchDraft]
  );
  const codingTreeNodeMap = useMemo(() => {
    const map = new Map<string, CodingProjectTreeNode>();
    for (const node of codingTreeNodes) {
      map.set(node.path, node);
    }
    return map;
  }, [codingTreeNodes]);
  const codingDirectoryPaths = useMemo(() => {
    const set = new Set<string>();
    const rootPath = String(codingProjectTreeState?.rootCwd || "").trim();
    if (rootPath) {
      set.add(rootPath);
    }
    for (const node of codingTreeNodes) {
      if (node.kind === "dir") {
        set.add(String(node.path || "").trim());
      }
    }
    return Array.from(set).filter(Boolean);
  }, [codingProjectTreeState?.rootCwd, codingTreeNodes]);
  const codingDirectoryChildrenMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const node of codingTreeNodes) {
      const parentPath = String(node.parentPath || "").trim();
      if (!parentPath) {
        continue;
      }
      map.set(parentPath, (map.get(parentPath) || 0) + 1);
    }
    return map;
  }, [codingTreeNodes]);
  const codingCollapsedDirectorySet = useMemo(
    () => new Set(codingTreeCollapsedPaths.map((item) => String(item || "").trim()).filter(Boolean)),
    [codingTreeCollapsedPaths]
  );
  const codingVisibleTreeNodes = useMemo(() => {
    const query = codingTreeSearchKeyword;
    const filteredPaths = (() => {
      if (!query) return null;
      const include = new Set<string>();
      const rootPath = String(codingProjectTreeState?.rootCwd || "").trim();
      if (rootPath) {
        include.add(rootPath);
      }
      for (const node of codingTreeNodes) {
        const target = `${node.name} ${node.path}`.toLowerCase();
        if (!target.includes(query)) {
          continue;
        }
        include.add(node.path);
        let parentPath = String(node.parentPath || "").trim();
        while (parentPath) {
          include.add(parentPath);
          const parentNode = codingTreeNodeMap.get(parentPath);
          if (!parentNode) break;
          parentPath = String(parentNode.parentPath || "").trim();
        }
      }
      return include;
    })();
    return codingTreeNodes.filter((node) => {
      if (filteredPaths && !filteredPaths.has(node.path)) {
        return false;
      }
      if (query) {
        return true;
      }
      let parentPath = String(node.parentPath || "").trim();
      while (parentPath) {
        if (codingCollapsedDirectorySet.has(parentPath)) {
          return false;
        }
        const parentNode = codingTreeNodeMap.get(parentPath);
        if (!parentNode) break;
        parentPath = String(parentNode.parentPath || "").trim();
      }
      return true;
    });
  }, [
    codingTreeNodes,
    codingTreeSearchKeyword,
    codingProjectTreeState?.rootCwd,
    codingTreeNodeMap,
    codingCollapsedDirectorySet
  ]);
  const codingActiveDirectoryPath = useMemo(
    () => String(
      codingSelectedDirectoryPath
      || codingProjectTreeState?.rootCwd
      || codingPatchCwdDraft
      || codingWorkspace?.cwd
      || ""
    ).trim(),
    [codingSelectedDirectoryPath, codingProjectTreeState?.rootCwd, codingPatchCwdDraft, codingWorkspace?.cwd]
  );
  const codingWorkspaceCurrentPath = useMemo(
    () => String(
      codingWorkspace?.cwd
      || codingPatchCwdDraft
      || codingSelectedDirectoryPath
      || ""
    ).trim(),
    [codingWorkspace?.cwd, codingPatchCwdDraft, codingSelectedDirectoryPath]
  );
  const buildSceneSoulModuleKey = (scene: SceneSoulTarget) => `${scene}:soul-core`;
  const formatSceneModuleStatus = (scene: SceneKey, moduleId: string) => {
    const state = sceneModuleStateMap.get(`${scene}:${moduleId}`);
    if (!state) {
      return {
        label: "未配置",
        detail: "点击后可配置并执行",
        tone: "idle"
      };
    }
    if (state.status === "running") {
      return {
        label: "执行中",
        detail: state.lastResult.summary || "正在自动执行配置任务",
        tone: "running"
      };
    }
    if (state.status === "completed") {
      return {
        label: "已生效",
        detail: state.lastResult.summary || "配置已完成并生效",
        tone: "ok"
      };
    }
    if (state.status === "partial") {
      return {
        label: "部分生效",
        detail: state.lastResult.summary || "部分动作完成，剩余待处理",
        tone: "warn"
      };
    }
    if (state.status === "pending_permission") {
      return {
        label: "待授权",
        detail: state.lastResult.summary || "部分能力需要先授权",
        tone: "warn"
      };
    }
    if (state.status === "failed") {
      return {
        label: "执行失败",
        detail: state.lastResult.summary || "请检查配置后重试",
        tone: "error"
      };
    }
    return {
      label: "已配置",
      detail: state.lastResult.summary || "配置已保存",
      tone: "idle"
    };
  };
  const brainModuleScores = useMemo<Record<BrainModuleKey, number>>(() => {
    const completedDeviceTasks = deviceTasks.filter((task) => task.status === "completed").length;
    const workdayCompletionRate = workdayState?.totalCount
      ? Math.min(1, (workdayState.completedCount || 0) / workdayState.totalCount)
      : 0;
    const modelScore = Math.min(
      100,
      42
      + (online ? 24 : 0)
      + (deviceOpsState?.bridge?.lastStatus === "ok" ? 18 : 0)
      + (autonomyState?.enabled ? 12 : 0)
    );
    const evolutionScore = Math.min(
      100,
      18
      + Math.min(36, (autonomyState?.tickCount || 0) * 2)
      + Math.min(30, (autonomyState?.generatedCount || 0) * 2)
      + Math.min(16, autonomyInbox.length * 4)
    );
    const memoryScore = Math.min(
      100,
      20
      + Math.min(38, memoryHighlights.length * 6)
      + Math.min(24, memoryResults.length * 4)
      + (proactiveState?.sentCount ? 12 : 0)
    );
    const eqScore = Math.min(
      100,
      30
      + (mode === "陪伴" ? 24 : mode === "亲情" ? 18 : 10)
      + Math.min(20, (engagement?.today.messageCount || 0) * 2)
      + (proactiveState?.sentCount ? 12 : 0)
    );
    const iqScore = Math.min(
      100,
      22
      + Math.round((workdayState?.clarityScore || 0) * 5)
      + Math.round(workdayCompletionRate * 25)
      + Math.min(18, completedDeviceTasks * 6)
    );
    const guardianScore = Math.min(
      100,
      28
      + (online ? 18 : 0)
      + Math.min(30, (deviceOpsState?.capabilities || []).length * 4)
      + Math.min(24, (deviceOpsState?.audit || []).slice(0, 6).length * 4)
      + (hardwareStatus?.ok ? 12 : 0)
    );
    return {
      modelApi: modelScore,
      evolution: evolutionScore,
      memory: memoryScore,
      eq: eqScore,
      iq: iqScore,
      guardian: guardianScore
    };
  }, [
    autonomyInbox.length,
    autonomyState?.enabled,
    autonomyState?.generatedCount,
    autonomyState?.tickCount,
    deviceOpsState?.audit,
    deviceOpsState?.capabilities,
    deviceOpsState?.bridge?.lastStatus,
    deviceTasks,
    engagement?.today.messageCount,
    hardwareStatus?.ok,
    memoryHighlights.length,
    memoryResults.length,
    mode,
    online,
    proactiveState?.sentCount,
    workdayState?.clarityScore,
    workdayState?.completedCount,
    workdayState?.totalCount
  ]);
  const autonomyQueuePending = autonomyState?.queue?.items?.length || 0;
  const autonomyQueueDeadLetters = autonomyState?.queue?.deadLetters?.length || 0;
  const autonomyQueueDeadLetterPreview = (autonomyState?.queue?.deadLetters || []).slice(0, 3) as DemoAutonomyQueueItem[];
  const flywheelBestTaskType = useMemo(() => {
    const taskLeaderboards = flywheelState?.taskLeaderboards || {};
    const taskEntries = Object.entries(taskLeaderboards);
    if (taskEntries.length === 0) {
      return "";
    }
    taskEntries.sort((left, right) => {
      const leftScore = Number(left[1]?.[0]?.combinedAvg || 0);
      const rightScore = Number(right[1]?.[0]?.combinedAvg || 0);
      return rightScore - leftScore;
    });
    return String(taskEntries[0]?.[0] || "");
  }, [flywheelState?.taskLeaderboards]);
  const flywheelTopProvider = useMemo(() => {
    if (!flywheelBestTaskType) {
      return null;
    }
    const rows = flywheelState?.taskLeaderboards?.[flywheelBestTaskType] || [];
    return rows[0] || null;
  }, [flywheelBestTaskType, flywheelState?.taskLeaderboards]);
  const flywheelTopRows = useMemo(() => {
    if (!flywheelBestTaskType) {
      return [];
    }
    const rows = flywheelState?.taskLeaderboards?.[flywheelBestTaskType] || [];
    return rows.slice(0, 3);
  }, [flywheelBestTaskType, flywheelState?.taskLeaderboards]);
  const flywheelRecentSignalPreview = useMemo(
    () => (flywheelState?.recentSignals || []).slice(0, 4),
    [flywheelState?.recentSignals]
  );
  const autonomyTimelinePreview = (unifiedTimelineState?.events || autonomyState?.timeline || []).slice(0, 10);
  const autonomyFailureLayers = autonomyState?.failureInsights?.layers || [];
  const timelineFlowPreview = (unifiedTimelineState?.flows || []).slice(0, 6);
  const agiFlowCandidates = useMemo(() => {
    const timelineFlows = Array.isArray(unifiedTimelineState?.flows) ? [...unifiedTimelineState.flows] : [];
    timelineFlows.sort((left, right) => {
      const leftAt = Date.parse(left.lastAt || left.startedAt || "") || 0;
      const rightAt = Date.parse(right.lastAt || right.startedAt || "") || 0;
      return rightAt - leftAt;
    });
    if (timelineFlows.length > 0) {
      return timelineFlows;
    }
    const dispatchHistory = Array.isArray(autonomyState?.dispatch?.history) ? autonomyState.dispatch.history : [];
    return dispatchHistory
      .map((dispatch) => {
        const steps = Array.isArray(dispatch.steps) ? dispatch.steps : [];
        const success = steps.filter((step) => step.status === "completed").length;
        const warnings = steps.filter((step) => step.status === "blocked").length;
        const errors = steps.filter((step) => step.status === "failed").length;
        return {
          flowId: String(dispatch.flowId || dispatch.id || ""),
          title: dispatch.prompt || "聊天任务",
          startedAt: dispatch.createdAt || "",
          lastAt: dispatch.finishedAt || dispatch.createdAt || "",
          status: dispatch.status || "unknown",
          sources: [dispatch.source || "chat"],
          stages: steps.map((step) => String(step.type || "step")),
          total: steps.length,
          success,
          warnings,
          errors
        };
      })
      .filter((item) => item.flowId);
  }, [autonomyState?.dispatch?.history, unifiedTimelineState?.flows]);
  const agiActiveFlow = useMemo(
    () => agiFlowCandidates.find((flow) => flow.flowId === agiViewportFlowId) || agiFlowCandidates[0] || null,
    [agiFlowCandidates, agiViewportFlowId]
  );
  const agiActiveFlowId = agiActiveFlow?.flowId || "";
  const agiDispatchSummary = useMemo(() => {
    const history = Array.isArray(autonomyState?.dispatch?.history) ? autonomyState.dispatch.history : [];
    if (agiActiveFlowId) {
      return history.find((dispatch) => String(dispatch.flowId || dispatch.id || "") === agiActiveFlowId) || null;
    }
    return history[0] || null;
  }, [agiActiveFlowId, autonomyState?.dispatch?.history]);
  const routeTraceTimelineEvents = useMemo(() => (
    routeTraceEvents.map((item) => ({
      id: item.id,
      flowId: "",
      source: "model_route",
      stage: "route_trace",
      status: item.status,
      title: item.title,
      detail: item.detail,
      at: item.at,
      refs: {
        scene: item.scene,
        userText: item.userText,
        providerId: item.providerId,
        model: item.model,
        fallback: item.fallback
      }
    }))
  ), [routeTraceEvents]);
  const agiEvents = useMemo(() => {
    const selectedFlowId = agiActiveFlowId;
    const replayEvents = timelineReplayState?.flowId === selectedFlowId
      ? (timelineReplayState.events || [])
      : [];
    const timelineEvents = Array.isArray(unifiedTimelineState?.events)
      ? unifiedTimelineState.events
      : [];
    const autonomyEvents = Array.isArray(autonomyState?.timeline)
      ? autonomyState.timeline
      : [];
    const candidateEvents = replayEvents.length > 0
      ? replayEvents
      : timelineEvents.length > 0
        ? timelineEvents
        : autonomyEvents;
    const filtered = candidateEvents.filter((event) => {
      if (!selectedFlowId) return true;
      return String(event.flowId || "") === selectedFlowId;
    });
    const routeFiltered = routeTraceTimelineEvents.filter((event) => {
      if (!selectedFlowId) return true;
      return !String(event.flowId || "").trim() || String(event.flowId || "").trim() === selectedFlowId;
    });
    return [...filtered, ...routeFiltered].sort((left, right) => {
      const leftAt = Date.parse(left.at || "") || 0;
      const rightAt = Date.parse(right.at || "") || 0;
      return leftAt - rightAt;
    });
  }, [
    agiActiveFlowId,
    autonomyState?.timeline,
    routeTraceTimelineEvents,
    timelineReplayState,
    unifiedTimelineState?.events
  ]);
  const agiRecentEvents = useMemo(() => [...agiEvents].slice(-8).reverse(), [agiEvents]);
  const agiStepStates = useMemo(() => {
    const dispatchSteps = Array.isArray(agiDispatchSummary?.steps) ? agiDispatchSummary.steps : [];
    const flowStatus = String(agiActiveFlow?.status || agiDispatchSummary?.status || "").toLowerCase();
    const hasByKeywords = (keywords: string[]) => agiEvents.some((event) => {
      const stageText = `${event.stage || ""} ${event.title || ""} ${event.detail || ""}`.toLowerCase();
      return keywords.some((keyword) => stageText.includes(keyword.toLowerCase()));
    });
    const hasRunningStep = dispatchSteps.some((step) => step.status === "running");
    const hasCompletedStep = dispatchSteps.some((step) => step.status === "completed");
    const hasFailedStep = dispatchSteps.some((step) => step.status === "failed");
    const hasBlockedStep = dispatchSteps.some((step) => step.status === "blocked");
    const toolTypes = Array.from(
      new Set(
        dispatchSteps
          .map((step) => String(step.type || "").trim())
          .filter(Boolean)
      )
    );
    const statusByStep: Record<number, AgiViewportStepStatus> = {
      1: sending || streamStatus === "loading" || streamStatus === "streaming"
        ? "active"
        : (messages.length > 0 || !!agiDispatchSummary ? "done" : "pending"),
      2: hasByKeywords(["intent", "route_completed", "route_fallback"]) || !!agiDispatchSummary?.prompt
        ? "done"
        : "pending",
      3: hasByKeywords(["dispatch_start", "任务已提交"]) || dispatchSteps.length > 0
        ? "done"
        : "pending",
      4: flowStatus === "running"
        ? "active"
        : dispatchSteps.length > 0
          ? "done"
          : "pending",
      5: toolTypes.length > 0
        ? "done"
        : flowStatus === "running"
          ? "active"
          : "pending",
      6: hasRunningStep
        ? "active"
        : hasCompletedStep
          ? "done"
          : hasFailedStep
            ? "failed"
            : "pending",
      7: streamStatus === "streaming" || hasByKeywords(["dispatch_step", "retry_", "route_"])
        ? "done"
        : hasRunningStep
          ? "active"
          : "pending",
      8: flowStatus === "completed"
        ? "done"
        : flowStatus === "partial"
          ? "warning"
          : flowStatus === "failed"
            ? "failed"
            : flowStatus === "running"
              ? "active"
              : "pending",
      9: flowStatus === "failed" || flowStatus === "partial"
        ? (timelineRepairingFlowId === agiActiveFlowId ? "active" : "warning")
        : flowStatus === "completed"
          ? "done"
          : "pending"
    };
    return AGI_VIEWPORT_STEPS.map((item) => {
      const detailMap: Record<number, string> = {
        1: messages.length > 0 ? `已接收 ${messages.length} 条会话消息` : item.plain,
        2: agiDispatchSummary?.prompt
          ? `识别目标：${String(agiDispatchSummary.prompt).slice(0, 36)}${String(agiDispatchSummary.prompt).length > 36 ? "..." : ""}`
          : item.plain,
        3: dispatchSteps.length > 0 ? `已拆成 ${dispatchSteps.length} 个执行步骤` : item.plain,
        4: hasRunningStep ? "正在自主分解并执行步骤中" : item.plain,
        5: toolTypes.length > 0 ? `已匹配工具：${toolTypes.slice(0, 4).join(" / ")}` : item.plain,
        6: dispatchSteps.length > 0
          ? `执行统计：成功 ${dispatchSteps.filter((step) => step.status === "completed").length} · 失败 ${dispatchSteps.filter((step) => step.status === "failed").length} · 阻塞 ${dispatchSteps.filter((step) => step.status === "blocked").length}`
          : item.plain,
        7: agiEvents.length > 0 ? `已回传 ${agiEvents.length} 条实时事件` : item.plain,
        8: flowStatus === "completed"
          ? "结果已交付并通过闭环验证"
          : flowStatus === "partial"
            ? "已交付部分结果，仍有步骤待补齐"
            : flowStatus === "failed"
              ? "交付失败，需进入自动修复"
              : item.plain,
        9: flowStatus === "failed" || flowStatus === "partial"
          ? "建议点击“一键重放修复”自动整改"
          : "当前链路健康，无需整改"
      };
      const status = statusByStep[item.id] || "pending";
      if (status === "failed" && hasBlockedStep && item.id === 6) {
        return {
          ...item,
          status: "warning" as AgiViewportStepStatus,
          detail: detailMap[item.id]
        };
      }
      return {
        ...item,
        status,
        detail: detailMap[item.id] || item.plain
      };
    });
  }, [
    agiActiveFlow?.status,
    agiActiveFlowId,
    agiDispatchSummary,
    agiEvents,
    messages.length,
    sending,
    streamStatus,
    timelineRepairingFlowId
  ]);
  const agiCompletedSteps = agiStepStates.filter((item) => item.status === "done").length;
  const agiProgressPercent = Math.round((agiCompletedSteps / AGI_VIEWPORT_STEPS.length) * 100);
  const agiFlowPreview = useMemo(() => agiFlowCandidates.slice(0, 6), [agiFlowCandidates]);
  const systemProviderOptions = systemConfigState?.modelRoutingPolicy?.providers || [];
  const memoryPlaneRuntime = systemConfigState?.memoryPlaneRuntime || null;
  const memoryPlaneSummary = memoryPlaneRuntime?.memorySummary || null;
  const memoryPlaneJobs = memoryPlaneRuntime?.jobs || {};
  const memoryPlaneStats = memoryPlaneRuntime?.stats || {};
  const memoryPlaneVectorMode = memoryPlaneRuntime?.vector?.mode || "local-index";
  const qdrantRuntime = memoryPlaneRuntime?.vector?.qdrant || null;
  const memoryPlaneScenePreview = useMemo(
    () => (Object.keys(sceneMeta) as SceneKey[]).map((scene) => ({
      scene,
      label: sceneMeta[scene].label,
      count: Number(memoryPlaneSummary?.sceneCounts?.[scene] || 0)
    })),
    [memoryPlaneSummary?.sceneCounts]
  );
  const formatRuntimeTimestamp = (value?: string) => {
    if (!value) return "暂无";
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    return new Date(parsed).toLocaleString();
  };
  const sceneProviderOptions = useMemo(
    () => systemProviderOptions.filter((provider) => provider.disabled !== true),
    [systemProviderOptions]
  );
  const systemProviderMap = useMemo(
    () => new Map(systemProviderOptions.map((provider) => [provider.id, provider])),
    [systemProviderOptions]
  );
  const sceneSelectedProviders = useMemo(
    () => ({
      work: sceneProviderOptions.find((item) => item.id === sceneModelDrafts.work),
      fun: sceneProviderOptions.find((item) => item.id === sceneModelDrafts.fun),
      life: sceneProviderOptions.find((item) => item.id === sceneModelDrafts.life),
      love: sceneProviderOptions.find((item) => item.id === sceneModelDrafts.love),
      coding: sceneProviderOptions.find((item) => item.id === sceneModelDrafts.coding)
    }),
    [
      sceneModelDrafts.fun,
      sceneModelDrafts.life,
      sceneModelDrafts.love,
      sceneModelDrafts.work,
      sceneModelDrafts.coding,
      sceneProviderOptions
    ]
  );
  const modelRuntimeProviderMap = useMemo(() => {
    const runtimeProviders = systemConfigState?.modelRouterRuntime?.providerRuntimes || [];
    return new Map(runtimeProviders.map((provider) => [provider.id, provider]));
  }, [systemConfigState?.modelRouterRuntime?.providerRuntimes]);
  const codingRouteLamp = useMemo(() => {
    const base = {
      tone: "idle" as RouteLampTone,
      title: "模型路由待命",
      detail: "发送一条消息后显示实时通道状态。"
    };
    if (latestRouteScene !== "coding" && streamStatus === "idle") {
      return base;
    }
    if (streamStatus === "loading" || streamStatus === "streaming") {
      return {
        tone: "running" as RouteLampTone,
        title: "模型路由执行中",
        detail: "正在建立通道并生成回复。"
      };
    }
    if (streamStatus === "error") {
      const detail = String(streamError || "").trim();
      return {
        tone: "error" as RouteLampTone,
        title: "模型路由异常",
        detail: detail || "通道异常，已建议重试。"
      };
    }
    if (!latestRouteInfo) {
      return base;
    }
    const attempts = Array.isArray(latestRouteInfo.attempts) ? latestRouteInfo.attempts : [];
    const failedAttempts = attempts.filter((item) => !item.ok);
    if (latestRouteInfo.fallback) {
      const reason = failedAttempts[0]?.reason || "all_providers_failed";
      return {
        tone: "warning" as RouteLampTone,
        title: "已降级到本地模板",
        detail: `原因：${reason} · 建议点“自愈重试”恢复真实模型`
      };
    }
    if (failedAttempts.length > 0) {
      return {
        tone: "warning" as RouteLampTone,
        title: `已自动切到 ${latestRouteInfo.providerId || "可用模型"}`,
        detail: `前置失败 ${failedAttempts.length} 次，当前已恢复回复。`
      };
    }
    const providerLabel = latestRouteInfo.providerId || "unknown-provider";
    const modelLabel = latestRouteInfo.model || "unknown-model";
    return {
      tone: "ok" as RouteLampTone,
      title: `模型通道稳定 · ${providerLabel}`,
      detail: modelLabel
    };
  }, [latestRouteInfo, latestRouteScene, streamError, streamStatus]);
  const agiActiveSceneExecutionSignal = agiSceneExecutionSignals[activeScene] || createDefaultAgiSceneExecutionSignal();
  const agiAutoRepairLamp = useMemo(() => {
    const isRepairingNow = Boolean(timelineRepairingFlowId) && (!agiActiveFlowId || timelineRepairingFlowId === agiActiveFlowId);
    if (isRepairingNow) {
      return {
        tone: "running" as RouteLampTone,
        title: "AutoRepair 进行中",
        detail: "正在执行一键重放修复..."
      };
    }
    if (streamStatus === "loading" || streamStatus === "streaming") {
      return {
        tone: "running" as RouteLampTone,
        title: "AutoRepair 监测中",
        detail: "当前任务执行中，异常时会自动介入修复。"
      };
    }
    if (!agiActiveSceneExecutionSignal.autoRepairApplied) {
      return {
        tone: "idle" as RouteLampTone,
        title: "AutoRepair 待命",
        detail: "本轮未触发自动修复。"
      };
    }
    if (agiActiveSceneExecutionSignal.dispatchStatus === "completed") {
      return {
        tone: "ok" as RouteLampTone,
        title: "AutoRepair 已生效",
        detail: agiActiveSceneExecutionSignal.autoRepairSummary || "修复链已执行并恢复完成。"
      };
    }
    if (agiActiveSceneExecutionSignal.dispatchStatus === "partial") {
      return {
        tone: "warning" as RouteLampTone,
        title: "AutoRepair 部分恢复",
        detail: agiActiveSceneExecutionSignal.autoRepairSummary || "修复后仍有步骤待补齐。"
      };
    }
    return {
      tone: "error" as RouteLampTone,
      title: "AutoRepair 未恢复",
      detail: agiActiveSceneExecutionSignal.autoRepairSummary || "修复链已执行，但当前仍失败。"
    };
  }, [
    agiActiveFlowId,
    agiActiveSceneExecutionSignal.autoRepairApplied,
    agiActiveSceneExecutionSignal.autoRepairSummary,
    agiActiveSceneExecutionSignal.dispatchStatus,
    streamStatus,
    timelineRepairingFlowId
  ]);
  const agiIdempotencyLamp = useMemo(() => {
    if (streamStatus === "loading" || streamStatus === "streaming") {
      return {
        tone: "running" as RouteLampTone,
        title: "Idempotency 检测中",
        detail: "正在防止重复执行和重复副作用。"
      };
    }
    if (agiActiveSceneExecutionSignal.idempotencyHit) {
      const dispatchHint = agiActiveSceneExecutionSignal.dispatchId
        ? `复用任务 ${agiActiveSceneExecutionSignal.dispatchId.slice(0, 16)}...`
        : "复用最近结果";
      return {
        tone: "ok" as RouteLampTone,
        title: "Idempotency 已命中",
        detail: `${dispatchHint}，避免重复执行。`
      };
    }
    return {
      tone: "idle" as RouteLampTone,
      title: "Idempotency 待命",
      detail: "当前未发生重复请求。"
    };
  }, [
    agiActiveSceneExecutionSignal.dispatchId,
    agiActiveSceneExecutionSignal.idempotencyHit,
    streamStatus
  ]);
  const systemTaskRouteEntries = useMemo(
    () => Object.entries(systemTaskRoutesDraft).sort((a, b) => a[0].localeCompare(b[0])),
    [systemTaskRoutesDraft]
  );
  const systemConfigTimelinePreview = (systemConfigHistoryState?.timeline || []).slice(0, 12);
  const systemConfigSnapshotPreview = (systemConfigHistoryState?.snapshots || []).slice(0, 12);
  const canRollbackPreviousConfig = systemConfigHistoryState?.canRollbackPrevious === true;
  const runtimeFailureLayers = runtimeHealth?.failureInsights?.layers || [];
  const runtimeOutage = runtimeHealth?.runtime?.outage || null;
  const runtimeSlo = runtimeHealth?.runtime?.slo || null;
  const runtimeWatchdog = runtimeHealth?.runtime?.watchdog || null;
  const runtimeSelfHealReport = runtimeHealth?.selfHealReports?.[0] || null;
  const runtimeIncidentPlaybook = runtimeHealth?.incidentPlaybook || null;
  const runtimeIncidentMatches = runtimeIncidentPlaybook?.matched || [];
  const runtimeIncidentRecommendations = runtimeIncidentPlaybook?.recommendations || [];
  const runtimeModeQueueLimitMap = useMemo(() => {
    const map = new Map<"eco" | "balanced" | "peak", number>();
    for (const preset of runtimeWatchdog?.modePresets || []) {
      map.set(preset.mode, preset.queueLimit);
    }
    return map;
  }, [runtimeWatchdog?.modePresets]);
  const queueStrategyRows = useMemo(() => {
    const strategies = autonomyState?.queue?.policy?.strategies || {};
    const order = [
      "device_task",
      "file_search",
      "web_research",
      "channel_send",
      "fetch_download",
      "expansion_install",
      "api_call",
      "code_patch_loop",
      "shell_command"
    ];
    return order
      .map((id) => ({
        id,
        strategy: strategies[id]
      }))
      .filter((item) => item.strategy);
  }, [autonomyState?.queue?.policy?.strategies]);
  const fusionRuntime = capabilityAssessment?.fusion;
  const superAutonomyRuntime = capabilityAssessment?.superAutonomy;
  const superAutonomySkillPreview = (superAutonomyRuntime?.skills || []).slice(0, 10);
  const superAutonomyMissingPreview = (superAutonomyRuntime?.missingRequiredSkills || []).slice(0, 4);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (coworkingView && coworkingSeats.length > 0) {
      const occupiedSeats = coworkingSeats.filter(s => s.occupant && s.id !== myCoworkingProfile?.currentSeatId);
      if (occupiedSeats.length > 0) {
        timer = setInterval(() => {
          if (Math.random() > 0.3) {
            const randomSeat = occupiedSeats[Math.floor(Math.random() * occupiedSeats.length)];
            setCoworkingSpeakingSeatId(randomSeat.id);
          } else {
            setCoworkingSpeakingSeatId(null);
          }
        }, 3500);
      }
    } else {
      setCoworkingSpeakingSeatId(null);
    }
    return () => clearInterval(timer);
  }, [coworkingView, coworkingSeats, myCoworkingProfile]);

  useEffect(() => {
    if (!XHS_IN_ARIA_ENABLED) {
      return;
    }
    void syncXhsPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!XHS_IN_ARIA_ENABLED || !xhsJobIsRunning) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      void syncXhsPipeline(String(xhsActiveJob?.id || ""));
    }, XHS_PIPELINE_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [xhsJobIsRunning, xhsActiveJob?.id]);
  useEffect(() => {
    return () => {
      if (chatExecutionFollowupTimerRef.current !== null) {
        window.clearTimeout(chatExecutionFollowupTimerRef.current);
        chatExecutionFollowupTimerRef.current = null;
      }
    };
  }, []);

  const activeFunLeftModule = useMemo(
    () => funLeftModules.find((item) => item.id === activeFunLeftModuleId) || funLeftModules[0],
    [activeFunLeftModuleId]
  );
  const activeFunConfigActions = useMemo(
    () => funCenterQuickActions[activeFunLeftModuleId] || [],
    [activeFunLeftModuleId]
  );
  const activeFunRightModule = useMemo(
    () => funRightModules.find((item) => item.id === activeFunRightModuleId) || funRightModules[0],
    [activeFunRightModuleId]
  );
  const activeFunFriend = useMemo(
    () => funFriendList.find((item) => item.id === activeFunFriendId) || funFriendList[0],
    [activeFunFriendId]
  );
  const activeLifeModule = useMemo(
    () => lifeLeftModules.find((item) => item.id === activeLifeModuleId) || lifeLeftModules[0],
    [activeLifeModuleId]
  );
  const activeLoveModule = useMemo(
    () => loveLeftModules.find((item) => item.id === activeLoveModuleId) || loveLeftModules[0],
    [activeLoveModuleId]
  );
  const funFriendFeedPreview = useMemo(
    () => funFriendFeed.slice(0, 6),
    [funFriendFeed]
  );

  const isMessageListNearBottom = (containerInput: HTMLDivElement | null) => {
    const container = containerInput;
    if (!container) {
      return true;
    }
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distance <= CHAT_AUTO_FOLLOW_THRESHOLD_PX;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = activeMessageListRef.current;
    if (container) {
      const targetTop = Math.max(0, container.scrollHeight - container.clientHeight);
      container.scrollTo({ top: targetTop, behavior });
      container.scrollTop = container.scrollHeight;
      chatAutoFollowRef.current = true;
      return;
    }
    messageEndRef.current?.scrollIntoView({
      behavior,
      block: "end"
    });
    chatAutoFollowRef.current = true;
  };

  const clonePendingImages = (items: PendingImageDraft[] = []) => (
    items
      .map((item) => ({
        name: String(item?.name || "").trim(),
        dataUrl: String(item?.dataUrl || "").trim()
      }))
      .filter((item) => item.name || item.dataUrl)
  );

  const enqueueOutgoingMessage = (item: OutgoingQueueItem) => {
    outgoingQueueRef.current.push({
      ...item,
      images: clonePendingImages(item.images)
    });
    setQueuedSendCount(outgoingQueueRef.current.length);
  };

  const dequeueOutgoingMessage = () => {
    const next = outgoingQueueRef.current.shift() || null;
    setQueuedSendCount(outgoingQueueRef.current.length);
    return next;
  };

  const isVoiceSessionLive = () => voiceCallShouldRunRef.current || voiceCallActiveRef.current;

  const normalizeVoiceTtsSegment = (segmentInput: string) => (
    String(segmentInput || "").replace(/\s+/g, " ").trim()
  );

  const resetVoiceTtsStreamState = (options?: { interruptPlayback?: boolean; resetCursor?: boolean }) => {
    voiceTtsQueueRef.current = [];
    voiceTtsCooldownUntilRef.current = 0;
    if (options?.resetCursor) {
      voiceTtsSpokenUntilRef.current = 0;
    }
    if (options?.interruptPlayback) {
      voiceTtsPlaybackTokenRef.current += 1;
      voiceTtsRunningRef.current = false;
    }
  };

  const drainVoiceTtsQueue = () => {
    if (voiceTtsRunningRef.current) {
      return;
    }
    if (!isVoiceSessionLive()) {
      resetVoiceTtsStreamState({ interruptPlayback: true });
      return;
    }
    if (voiceTtsQueueRef.current.length === 0) {
      return;
    }

    const playbackToken = voiceTtsPlaybackTokenRef.current;
    voiceTtsRunningRef.current = true;

    void (async () => {
      try {
        while (voiceTtsQueueRef.current.length > 0) {
          if (playbackToken !== voiceTtsPlaybackTokenRef.current || !isVoiceSessionLive()) {
            return;
          }
          const cooldownRemainingMs = voiceTtsCooldownUntilRef.current - Date.now();
          if (cooldownRemainingMs > 0) {
            await new Promise<void>((resolve) => {
              setTimeout(resolve, cooldownRemainingMs);
            });
            if (playbackToken !== voiceTtsPlaybackTokenRef.current || !isVoiceSessionLive()) {
              return;
            }
          }
          const segment = voiceTtsQueueRef.current.shift();
          if (!segment) {
            continue;
          }
          await runVoiceTts(segment, { dryRun: false });
          voiceTtsCooldownUntilRef.current = Date.now() + VOICE_STREAM_TTS_INTERVAL_MS;
        }
      } catch (voiceError) {
        if (!isVoiceSessionLive()) {
          return;
        }
        const detail = voiceError instanceof Error ? voiceError.message : "voice_tts_failed";
        setVoiceStatus(`语音播报失败：${detail}`);
      } finally {
        if (playbackToken === voiceTtsPlaybackTokenRef.current) {
          voiceTtsRunningRef.current = false;
          if (voiceTtsQueueRef.current.length > 0 && isVoiceSessionLive()) {
            drainVoiceTtsQueue();
          }
        }
      }
    })();
  };

  const queueVoiceTtsFromFullText = (fullTextInput: string, options?: { finalFlush?: boolean }) => {
    if (!isVoiceSessionLive()) {
      return;
    }
    const fullText = String(fullTextInput || "");
    if (!fullText) {
      return;
    }
    if (fullText.length < voiceTtsSpokenUntilRef.current) {
      resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
    }

    let pending = fullText.slice(voiceTtsSpokenUntilRef.current);
    if (!pending) {
      return;
    }
    const finalFlush = options?.finalFlush === true;
    let consumedChars = 0;
    const queuedSegments: string[] = [];

    while (pending.length > 0) {
      let sliceLength = 0;
      if (pending.length > VOICE_STREAM_TTS_MAX_SEGMENT_CHARS) {
        const bounded = pending.slice(0, VOICE_STREAM_TTS_MAX_SEGMENT_CHARS);
        const boundary = findLastVoiceBoundaryIndex(bounded);
        sliceLength = boundary >= VOICE_STREAM_TTS_MIN_SEGMENT_CHARS - 1
          ? boundary + 1
          : VOICE_STREAM_TTS_MAX_SEGMENT_CHARS;
      } else if (finalFlush) {
        sliceLength = pending.length;
      } else {
        const boundary = findLastVoiceBoundaryIndex(pending);
        if (boundary < VOICE_STREAM_TTS_MIN_SEGMENT_CHARS - 1) {
          break;
        }
        sliceLength = boundary + 1;
      }

      if (sliceLength <= 0) {
        break;
      }

      const rawSegment = pending.slice(0, sliceLength);
      const normalizedSegment = normalizeVoiceTtsSegment(rawSegment);
      const shouldQueue = normalizedSegment.length > 0
        && (
          finalFlush
          || normalizedSegment.length >= VOICE_STREAM_TTS_MIN_SEGMENT_CHARS
          || sliceLength >= VOICE_STREAM_TTS_MAX_SEGMENT_CHARS
        );

      if (!shouldQueue && !finalFlush) {
        break;
      }

      if (shouldQueue) {
        queuedSegments.push(normalizedSegment);
      }
      consumedChars += sliceLength;
      pending = pending.slice(sliceLength);

      if (!finalFlush && pending.length < VOICE_STREAM_TTS_MIN_SEGMENT_CHARS) {
        break;
      }
    }

    if (consumedChars <= 0) {
      return;
    }

    voiceTtsSpokenUntilRef.current = Math.min(fullText.length, voiceTtsSpokenUntilRef.current + consumedChars);

    if (queuedSegments.length > 0) {
      voiceTtsQueueRef.current.push(...queuedSegments);
      drainVoiceTtsQueue();
    } else if (finalFlush) {
      voiceTtsSpokenUntilRef.current = fullText.length;
    }
  };

  const getSpeechRecognitionCtor = () => {
    if (typeof window === "undefined") return null;
    return (window.SpeechRecognition || window.webkitSpeechRecognition || null) as BrowserSpeechRecognitionConstructor | null;
  };

  const clearVoiceCallRestartTimer = () => {
    if (voiceCallRestartTimerRef.current !== null) {
      window.clearTimeout(voiceCallRestartTimerRef.current);
      voiceCallRestartTimerRef.current = null;
    }
  };

  const buildVoiceChannelOwner = () => {
    if (voiceChannelOwnerRef.current) {
      return voiceChannelOwnerRef.current;
    }
    const userId = getCachedUserId() || "guest";
    const suffix = Math.random().toString(36).slice(2, 8);
    voiceChannelOwnerRef.current = `aria-desktop:${userId}:${suffix}`;
    return voiceChannelOwnerRef.current;
  };

  const clearVoiceChannelHeartbeat = () => {
    if (voiceChannelHeartbeatTimerRef.current !== null) {
      window.clearInterval(voiceChannelHeartbeatTimerRef.current);
      voiceChannelHeartbeatTimerRef.current = null;
    }
  };

  const releaseVoiceChannelLock = async () => {
    clearVoiceChannelHeartbeat();
    const token = voiceChannelTokenRef.current;
    voiceChannelTokenRef.current = "";
    if (!token) {
      return;
    }
    try {
      await releaseVoiceChannel(token);
    } catch {
      // ignore release failure; lease expires automatically
    }
  };

  const releaseVoiceCallRecognition = () => {
    const recognition = voiceCallRecognitionRef.current;
    voiceCallRecognitionRef.current = null;
    if (!recognition) return;
    recognition.onstart = null;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    try {
      recognition.stop();
    } catch {
      // ignore stop race
    }
    try {
      recognition.abort();
    } catch {
      // ignore abort race
    }
  };

  const startVoiceChannelHeartbeat = () => {
    clearVoiceChannelHeartbeat();
    const lease = Math.max(5000, voiceChannelLeaseMsRef.current || 30000);
    const intervalMs = Math.max(4000, Math.min(12000, Math.floor(lease / 2)));
    voiceChannelHeartbeatTimerRef.current = window.setInterval(() => {
      if (!voiceCallShouldRunRef.current) {
        return;
      }
      const token = voiceChannelTokenRef.current;
      if (!token) {
        return;
      }
      void renewVoiceChannel(token, {
        leaseMs: voiceChannelLeaseMsRef.current
      })
        .then((result) => {
          if (!voiceCallShouldRunRef.current) {
            return;
          }
          if (result.ok && result.channel) {
            const leaseMs = Number(result.channel.leaseMs || 0);
            if (Number.isFinite(leaseMs) && leaseMs >= 5000) {
              voiceChannelLeaseMsRef.current = leaseMs;
            }
            return;
          }
          const reason = String(result.summary || result.warning || result.reason || "voice_channel_renew_failed");
          stopVoiceCallSession(`语音通道已断开：${reason}`);
        })
        .catch((error) => {
          if (!voiceCallShouldRunRef.current) {
            return;
          }
          const detail = error instanceof Error ? error.message : "voice_channel_renew_failed";
          stopVoiceCallSession(`语音通道续租失败：${detail}`);
        });
    }, intervalMs);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const resolved = resolveRouteFromPath(window.location.pathname);
    if (!resolved) {
      return;
    }
    setActiveScene(resolved.scene);
    setRightPanel(resolved.panel);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedPersona) {
      return;
    }
    const nextPath = buildRoutePath(activeScene, rightPanel);
    const currentPath = window.location.pathname || "/";
    if (currentPath !== nextPath) {
      window.history.replaceState({}, "", nextPath);
    }
  }, [activeScene, rightPanel, selectedPersona]);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    rightPanelRef.current = rightPanel;
  }, [rightPanel]);

  useEffect(() => {
    voiceCallActiveRef.current = voiceCallActive;
  }, [voiceCallActive]);

  useEffect(() => () => {
    voiceCallShouldRunRef.current = false;
    resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
    clearVoiceCallRestartTimer();
    clearVoiceChannelHeartbeat();
    releaseVoiceCallRecognition();
    void releaseVoiceChannelLock();
  }, []);

  const openPanel = (panel: PanelKey, scene: SceneKey = panelSceneMap[panel]) => {
    const nextPanel = scene === "coding" && panel === "chat"
      ? "workday"
      : panel;
    setRightPanel(nextPanel);
    setActiveScene(scene);
  };

  const openScene = (scene: SceneKey) => {
    setActiveScene(scene);
    setRightPanel(sceneMeta[scene].defaultPanel);
    setCanvasSceneActive(false);
    if (sceneMeta[scene].mode !== mode) {
      void updatePreferences({ mode: sceneMeta[scene].mode });
    }
    if (scene === "work" || scene === "coding") {
      void syncWorkbench();
      void syncExpansion();
    }
  };

  const stopVoiceCallSession = (reason = "语音通话已结束。") => {
    voiceCallShouldRunRef.current = false;
    resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
    clearVoiceCallRestartTimer();
    clearVoiceChannelHeartbeat();
    releaseVoiceCallRecognition();
    void releaseVoiceChannelLock();
    setVoiceCallListening(false);
    setVoiceCallActive(false);
    setVoiceStatus(reason);
    setMomentumToast(reason);
  };

  const scheduleVoiceCallRestart = (delayMs = 420) => {
    if (!voiceCallShouldRunRef.current) return;
    clearVoiceCallRestartTimer();
    voiceCallRestartTimerRef.current = window.setTimeout(() => {
      if (!voiceCallShouldRunRef.current) return;
      const recognition = voiceCallRecognitionRef.current;
      if (!recognition) return;
      try {
        recognition.start();
      } catch {
        scheduleVoiceCallRestart(900);
      }
    }, Math.max(120, delayMs));
  };

  const startVoiceCallSession = async () => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      const fallback = "当前环境不支持浏览器语音识别，请改用文本输入或启用系统语音模块。";
      setVoiceStatus(fallback);
      setStreamError(fallback);
      setMomentumToast("语音通话不可用：当前引擎不支持。");
      return;
    }

    if (voiceCallShouldRunRef.current) {
      return;
    }

    setVoiceStatus("正在申请独占语音通道...");
    const owner = buildVoiceChannelOwner();
    let channelAcquired = null as Awaited<ReturnType<typeof acquireVoiceChannel>> | null;
    try {
      channelAcquired = await acquireVoiceChannel(owner, {
        leaseMs: voiceChannelLeaseMsRef.current,
        client: "aria-desktop-web"
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "voice_channel_acquire_failed";
      const message = `语音通道申请失败：${detail}`;
      setVoiceStatus(message);
      setStreamError(message);
      setMomentumToast(message);
      return;
    }

    if (!channelAcquired?.ok || !channelAcquired.channel?.active || !channelAcquired.channel?.token) {
      const holder = String(channelAcquired?.channel?.owner || "").trim();
      const holderHint = holder ? `（当前占用：${holder}）` : "";
      const detail = String(
        channelAcquired?.summary
        || channelAcquired?.warning
        || channelAcquired?.reason
        || "voice_channel_busy"
      );
      const message = `语音通道被占用${holderHint}：${detail}`;
      setVoiceStatus(message);
      setMomentumToast(message);
      return;
    }

    voiceChannelTokenRef.current = String(channelAcquired.channel.token || "");
    const leaseMs = Number(channelAcquired.channel.leaseMs || 0);
    if (Number.isFinite(leaseMs) && leaseMs >= 5000) {
      voiceChannelLeaseMsRef.current = leaseMs;
    }

    clearVoiceCallRestartTimer();
    releaseVoiceCallRecognition();

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "zh-CN";
    voiceCallRecognitionRef.current = recognition;
    voiceCallShouldRunRef.current = true;
    resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
    openPanel("chat", activeSceneRef.current);
    setVoiceCallActive(true);
    setVoiceCallListening(false);
    setVoiceStatus("正在建立语音通话...");

    recognition.onstart = () => {
      setVoiceCallActive(true);
      setVoiceCallListening(true);
      startVoiceChannelHeartbeat();
      setVoiceStatus("实时语音通话已建立，正在聆听...");
    };

    recognition.onresult = (event) => {
      const results = event.results || [];
      for (let index = event.resultIndex; index < results.length; index += 1) {
        const result = results[index];
        const transcript = String(result?.[0]?.transcript || "").trim();
        if (!result?.isFinal || !transcript) continue;
        const now = Date.now();
        if (
          transcript === lastVoiceTranscriptRef.current
          && now - lastVoiceTranscriptAtRef.current < 1300
        ) {
          continue;
        }
        lastVoiceTranscriptRef.current = transcript;
        lastVoiceTranscriptAtRef.current = now;
        setDraft(transcript);
        setVoiceStatus(`已识别：${transcript.slice(0, 36)}${transcript.length > 36 ? "..." : ""}`);
        void sendMessage(transcript, {
          scene: activeSceneRef.current,
          panel: rightPanelRef.current
        });
      }
    };

    recognition.onerror = (event) => {
      const code = String(event?.error || "unknown");
      const permanent = ["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"].includes(code);
      if (permanent) {
        stopVoiceCallSession("麦克风权限不可用，请在系统设置中开启后重试。");
        return;
      }
      setVoiceCallListening(false);
      setVoiceStatus(`语音识别中断（${code}），正在自动重连...`);
      scheduleVoiceCallRestart(900);
    };

    recognition.onend = () => {
      setVoiceCallListening(false);
      if (voiceCallShouldRunRef.current) {
        scheduleVoiceCallRestart(420);
      }
    };

    try {
      recognition.start();
      if (channelAcquired.warning) {
        setMomentumToast(`语音通话已启动（互斥警告：${channelAcquired.warning}）`);
      } else {
        setMomentumToast("语音通话已启动：可以直接说话。");
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown_error";
      stopVoiceCallSession(`语音通话启动失败：${reason}`);
    }
  };

  const toggleVoiceCallSession = () => {
    if (voiceCallShouldRunRef.current || voiceCallActiveRef.current) {
      stopVoiceCallSession("语音通话已结束。");
      return;
    }
    void startVoiceCallSession();
  };

  const handleAvatarConfigAction = (item: AvatarConfigItem, action: AvatarConfigAction) => {
    const targetPanel =
      action === "open"
        ? item.focusPanel
        : action === "upload"
          ? item.uploadPanel || "memory"
          : item.editPanel || item.focusPanel;
    if (item.brainModule && targetPanel === "brain") {
      setActiveBrainModule(item.brainModule);
    }
    openPanel(targetPanel, item.scene);
    if (sceneMeta[item.scene].mode !== mode) {
      void updatePreferences({ mode: sceneMeta[item.scene].mode });
    }
    if (action === "upload") {
      setMomentumToast(`已进入 ${panelMeta[targetPanel].label}：填写内容后点写入即可。`);
      return;
    }
    if (action === "edit") {
      setMomentumToast(`已进入 ${item.title} 规则编辑区。`);
      return;
    }
    setMomentumToast(`${item.title} 已打开。`);
  };

  const launchCodingAutopilot = (templatePrompt?: string) => {
    const rawIntent = templatePrompt || codingIntent;
    const normalized = rawIntent.trim();
    const finalPrompt = normalized.length > 0
      ? `请进入自主编程模式：${normalized}\n要求：先确认目标，再给执行计划，自动产出代码并给验证步骤。`
      : "请进入自主编程模式，先问我目标，再自动拆解任务并开始生成可运行代码。";
    setWorkbenchDraft(finalPrompt);
    openPanel("workday", "coding");
    setMomentumToast("已进入编程工作台：需求已写入输入框，点击“执行”即可开始。");
  };

  const triggerSceneQuickAction = async (input: {
    prompt: string;
    scene: SceneKey;
    panel: PanelKey;
    label: string;
    writeOnly?: boolean;
  }) => {
    const finalPrompt = String(input.prompt || "").trim();
    if (!finalPrompt) {
      return;
    }
    const writeOnly = input.writeOnly === true;
    setDraft(finalPrompt);
    openPanel(input.panel, input.scene);
    if (writeOnly) {
      setMomentumToast(`已写入${input.label}指令（Shift+点击默认仅写入）。`);
      return;
    }
    setMomentumToast(`已发起${input.label}执行，完成后会回执结果。`);
    await sendMessage(finalPrompt, {
      scene: input.scene,
      panel: input.panel
    });
  };

  const launchFunStarter = async (
    starterPrompt: string,
    sourceLabel: string,
    options: { writeOnly?: boolean } = {}
  ) => {
    await triggerSceneQuickAction({
      prompt: starterPrompt,
      scene: "fun",
      panel: "funzone",
      label: `娱乐「${sourceLabel}」`,
      writeOnly: options.writeOnly === true
    });
  };

  const generateFunGameFromDraft = async () => {
    const mode = activeFunLeftModuleId === "handmade_game" ? "handmade_game" : "mini_game";
    const prompt = draft.trim() || `${activeFunLeftModule.starterPrompt}\n${funSubConfigInput.trim()}`.trim();
    const requestTitle = mode === "handmade_game" ? "手搓规则挑战场" : "快节奏反应局";
    setSceneConfigApplyingKey("fun:quick_generate");
    setStreamError("");
    try {
      const response = await createFunGame({
        mode,
        title: requestTitle,
        prompt,
        templateName: mode === "handmade_game" ? (funGameDraft.templateName.trim() || "手搓规则模板") : undefined,
        funGameConfig: {
          difficulty: funGameDraft.difficulty,
          rounds: Math.max(1, Math.min(30, funGameDraft.rounds)),
          scoreEnabled: funGameDraft.scoreEnabled,
          rewardEnabled: funGameDraft.rewardEnabled,
          reviveEnabled: funGameDraft.reviveEnabled
        }
      });
      setFunGames(response.games || []);
      setUpdatedAt(response.updatedAt || new Date().toISOString());
      const created = response.game;
      const bootstrapSummary = response.skillBootstrap?.summary?.trim() || "";
      setMessages((prev) => [
        ...prev,
        {
          id: `fun-create-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          role: "aria",
          text: `已生成${mode === "handmade_game" ? "手搓" : ""}小游戏《${created.title}》\n点击开玩：${created.playUrl}${bootstrapSummary ? `\n${bootstrapSummary}` : ""}`,
          time: nowTime(),
          timestamp: Date.now(),
          scene: "fun"
        }
      ]);
      setMomentumToast(
        bootstrapSummary
          ? `小游戏已生成并完成插件接入：${created.title}`
          : `小游戏已生成：${created.title}`
      );
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "小游戏生成失败";
      setStreamError(message);
      setMomentumToast(`小游戏生成失败：${message}`);
    } finally {
      setSceneConfigApplyingKey("");
    }
  };

  const applySceneConfigAndExecute = async (input: {
    scene: SceneKey;
    moduleId: string;
    title: string;
    goal: string;
    configText: string;
    prompt: string;
    funGameConfig?: {
      difficulty: "easy" | "normal" | "hard";
      rounds: number;
      scoreEnabled: boolean;
      rewardEnabled: boolean;
      reviveEnabled: boolean;
    };
    templateId?: string;
    templateName?: string;
    soulProfile?: {
      directive?: string;
      uploadedFiles?: SceneSoulUploadedFile[];
    };
    closeAfter?: boolean;
  }) => {
    const moduleKey = `${input.scene}:${input.moduleId}`;
    setSceneConfigApplyingKey(moduleKey);
    setStreamError("");
    try {
      const data = await applySceneConfigApi({
        scene: input.scene,
        moduleId: input.moduleId,
        title: input.title,
        goal: input.goal,
        configText: input.configText,
        prompt: input.prompt,
        funGameConfig: input.funGameConfig,
        templateId: input.templateId,
        templateName: input.templateName,
        soulProfile: input.soulProfile,
        execute: true
      });
      setSceneConfigState(data.sceneConfig);
      if (data.autonomy) {
        setAutonomyState(data.autonomy);
        setAutonomyInbox(data.autonomy.inbox.filter((item) => item.status !== "acked"));
      }
      if (data.proactive) setProactiveState(data.proactive);
      if (data.workday) setWorkdayState(data.workday);
      if (data.workbench) setWorkbenchState(data.workbench);
      if (data.deviceOps) {
        setDeviceOpsState(data.deviceOps);
        setDeviceTasks(data.deviceOps.tasks.slice(0, 10));
      }
      if (data.expansion) setExpansionState(data.expansion);
      if (Array.isArray(data.funGames)) setFunGames(data.funGames);
      if (data.generatedPrompt) {
        setDraft(data.generatedPrompt);
      }
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      const executionSummary = data.execution?.summary || "配置已执行。";
      const note = `已按你的目标执行「${input.title}」：${executionSummary}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `scene-cfg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          role: "aria",
          text: note,
          time: nowTime(),
          timestamp: Date.now(),
          scene: input.scene
        }
      ]);
      setMomentumToast(note);
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
      if (input.closeAfter) {
        if (input.scene === "fun") setShowFunConfigBubble(false);
        if (input.scene === "life") setShowLifeConfigBubble(false);
        if (input.scene === "love") setShowLoveConfigBubble(false);
      }
    } catch (applyError) {
      const message = applyError instanceof Error ? applyError.message : "场景配置执行失败";
      setStreamError(message);
      setMomentumToast(`「${input.title}」执行失败：${message}`);
    } finally {
      setSceneConfigApplyingKey("");
    }
  };

  const applyFunModelConfigDraft = (closeAfter = false) => {
    const note = funModelConfigDraft.note.trim();
    const noteText = note ? `额外要求：${note}。` : "";
    const prompt = `进入娱乐场景 Soul 配置：语气=${funModelConfigDraft.tone}；模式=${funModelConfigDraft.mode}；奖励=${funModelConfigDraft.reward}。${noteText}请输出配置确认和执行建议。`;
    if (!closeAfter) {
      setDraft(prompt);
      setMomentumToast("Soul 配置已写入输入框，点发送即可生效。");
      return;
    }
    const configText = `语气=${funModelConfigDraft.tone}；模式=${funModelConfigDraft.mode}；奖励=${funModelConfigDraft.reward}；备注=${note || "无"}`;
    const directive = [funModelConfigDraft.tone, funModelConfigDraft.mode, funModelConfigDraft.reward, note]
      .filter(Boolean)
      .join("；");
    setSceneSoulDrafts((prev) => ({
      ...prev,
      fun: directive
    }));
    void applySceneConfigAndExecute({
      scene: "fun",
      moduleId: "soul-core",
      title: "娱乐 Soul",
      goal: "让娱乐场景更贴合当前互动目标",
      configText,
      prompt,
      soulProfile: {
        directive,
        uploadedFiles: sceneSoulUploads.fun
      },
      closeAfter: true
    });
  };

  const applyFunSecondaryConfigDraft = (closeAfter = false) => {
    if (activeFunLeftModuleId === "fun_soul") {
      applyFunModelConfigDraft(closeAfter);
      return;
    }
    const isGameModule = activeFunLeftModuleId === "mini_game" || activeFunLeftModuleId === "handmade_game";
    const selectedAction = activeFunConfigActions.find((item) => item.id === funSubConfigActionId) || activeFunConfigActions[0];
    const actionPrompt = selectedAction?.starterPrompt || activeFunLeftModule.starterPrompt;
    const extraNote = funSubConfigInput.trim();
    const gamePromptAddon = isGameModule
      ? `\n参数：难度=${funGameDraft.difficulty}；回合=${funGameDraft.rounds}；计分=${funGameDraft.scoreEnabled ? "开" : "关"}；奖励=${funGameDraft.rewardEnabled ? "开" : "关"}；失败复活=${funGameDraft.reviveEnabled ? "开" : "关"}。`
      : "";
    const prompt = extraNote
      ? `${actionPrompt}${gamePromptAddon}\n补充要求：${extraNote}`
      : `${actionPrompt}${gamePromptAddon}`;
    if (!closeAfter) {
      setDraft(prompt);
      setMomentumToast(`${activeFunLeftModule.title} 配置已写入输入框。`);
      return;
    }
    const configTextSegments = [selectedAction?.label || activeFunLeftModule.hint];
    if (isGameModule) {
      configTextSegments.push(
        `difficulty=${funGameDraft.difficulty}`,
        `rounds=${funGameDraft.rounds}`,
        `score=${funGameDraft.scoreEnabled ? "on" : "off"}`,
        `reward=${funGameDraft.rewardEnabled ? "on" : "off"}`,
        `revive=${funGameDraft.reviveEnabled ? "on" : "off"}`
      );
      if (activeFunLeftModuleId === "handmade_game" && funGameDraft.templateName.trim()) {
        configTextSegments.push(`template=${funGameDraft.templateName.trim()}`);
      }
    }
    if (extraNote) {
      configTextSegments.push(extraNote);
    }
    const configText = configTextSegments.filter(Boolean).join("；");
    void applySceneConfigAndExecute({
      scene: "fun",
      moduleId: activeFunLeftModuleId,
      title: activeFunLeftModule.title,
      goal: activeFunLeftModule.detail,
      configText,
      prompt,
      funGameConfig: isGameModule
        ? {
          difficulty: funGameDraft.difficulty,
          rounds: Math.max(1, Math.min(30, funGameDraft.rounds)),
          scoreEnabled: funGameDraft.scoreEnabled,
          rewardEnabled: funGameDraft.rewardEnabled,
          reviveEnabled: funGameDraft.reviveEnabled
        }
        : undefined,
      templateName: activeFunLeftModuleId === "handmade_game"
        ? (funGameDraft.templateName.trim() || "手搓规则模板")
        : undefined,
      closeAfter: true
    });
  };

  const openFunConfigBubble = (moduleId: FunLeftModule["id"]) => {
    setActiveFunLeftModuleId(moduleId);
    const defaultActions = funCenterQuickActions[moduleId] || [];
    setFunSubConfigActionId(defaultActions[0]?.id || "");
    if (moduleId === "mini_game") {
      setFunGameDraft((prev) => ({
        ...prev,
        difficulty: "easy",
        rounds: prev.rounds <= 0 ? 6 : prev.rounds
      }));
    }
    if (moduleId === "handmade_game") {
      setFunGameDraft((prev) => ({
        ...prev,
        difficulty: prev.difficulty === "easy" ? "normal" : prev.difficulty,
        rounds: prev.rounds < 6 ? 8 : prev.rounds
      }));
    }
    if (moduleId !== "fun_soul") {
      setFunSubConfigInput("");
    }
    setShowFunConfigBubble(true);
  };

  const openLifeConfigBubble = (moduleId: LifeLeftModule["id"]) => {
    setActiveLifeModuleId(moduleId);
    setShowLifeConfigBubble(true);
  };

  const applyLifeConfigDraft = (closeAfter = false) => {
    const extra = lifeConfigInput.trim();
    if (activeLifeModuleId === "life-soul") {
      const directive = extra || sceneSoulDrafts.life;
      if (directive !== sceneSoulDrafts.life) {
        setSceneSoulDrafts((prev) => ({
          ...prev,
          life: directive
        }));
      }
      applySceneSoulDraft("life", closeAfter, directive);
      if (closeAfter) {
        setShowLifeConfigBubble(false);
      }
      return;
    }
    const prompt = extra ? `${activeLifeModule.prompt}\n补充要求：${extra}` : activeLifeModule.prompt;
    if (!closeAfter) {
      setDraft(prompt);
      setMomentumToast(`${activeLifeModule.title} 配置已写入输入框。`);
      return;
    }
    void applySceneConfigAndExecute({
      scene: "life",
      moduleId: activeLifeModuleId,
      title: activeLifeModule.title,
      goal: activeLifeModule.hint,
      configText: extra || activeLifeModule.prompt,
      prompt,
      closeAfter: true
    });
  };

  const openLoveConfigBubble = (moduleId: LoveLeftModule["id"]) => {
    setActiveLoveModuleId(moduleId);
    setShowLoveConfigBubble(true);
  };

  const applyLoveConfigDraft = (closeAfter = false) => {
    const extra = loveConfigInput.trim();
    if (activeLoveModuleId === "love-model") {
      const directive = extra || sceneSoulDrafts.love;
      if (directive !== sceneSoulDrafts.love) {
        setSceneSoulDrafts((prev) => ({
          ...prev,
          love: directive
        }));
      }
      applySceneSoulDraft("love", closeAfter, directive);
      if (closeAfter) {
        setShowLoveConfigBubble(false);
      }
      return;
    }
    const prompt = extra ? `${activeLoveModule.prompt}\n补充要求：${extra}` : activeLoveModule.prompt;
    if (!closeAfter) {
      setDraft(prompt);
      setMomentumToast(`${activeLoveModule.title} 配置已写入输入框。`);
      return;
    }
    void applySceneConfigAndExecute({
      scene: "love",
      moduleId: activeLoveModuleId,
      title: activeLoveModule.title,
      goal: activeLoveModule.hint,
      configText: extra || activeLoveModule.prompt,
      prompt,
      closeAfter: true
    });
  };

  const parseSceneSoulFile = async (file: File, scene: SceneSoulTarget): Promise<SceneSoulUploadedFile> => {
    const name = String(file.name || "未命名文件").trim() || "未命名文件";
    const type = String(file.type || "").trim();
    const extension = name.includes(".")
      ? name.split(".").pop()?.toLowerCase() || ""
      : "";
    const shouldReadText = type.startsWith("text/") || SCENE_SOUL_TEXT_EXTENSIONS.has(extension);
    let excerpt = "";
    if (shouldReadText) {
      try {
        const raw = await file.text();
        excerpt = raw
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, SCENE_SOUL_EXCERPT_LIMIT);
      } catch {
        excerpt = "";
      }
    }
    return {
      id: `soul-file-${scene}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name,
      type,
      size: Number(file.size || 0),
      uploadedAt: new Date().toISOString(),
      excerpt
    };
  };

  const handleSceneSoulFilePick = async (scene: SceneSoulTarget, files: FileList | null) => {
    const list = Array.from(files || []);
    if (list.length === 0) {
      return;
    }
    const parsed = await Promise.all(list.slice(0, SCENE_SOUL_MAX_FILES).map((file) => parseSceneSoulFile(file, scene)));
    setSceneSoulUploads((prev) => {
      const nextItems = [...(prev[scene] || []), ...parsed].slice(0, SCENE_SOUL_MAX_FILES);
      return {
        ...prev,
        [scene]: nextItems
      };
    });
    setMomentumToast(`已为${sceneMeta[scene].label}上传 ${Math.min(list.length, SCENE_SOUL_MAX_FILES)} 份 Soul 资料。`);
  };

  const removeSceneSoulFile = (scene: SceneSoulTarget, fileId: string) => {
    setSceneSoulUploads((prev) => ({
      ...prev,
      [scene]: (prev[scene] || []).filter((item) => item.id !== fileId)
    }));
  };

  const applySceneSoulDraft = (scene: SceneSoulTarget, execute = false, directiveInput?: string) => {
    const directive = String(
      directiveInput !== undefined ? directiveInput : (sceneSoulDrafts[scene] || "")
    ).trim();
    const uploads = Array.isArray(sceneSoulUploads[scene]) ? sceneSoulUploads[scene] : [];
    const uploadSummary = uploads
      .map((item, index) => `${index + 1}. ${item.name}${item.excerpt ? `（${item.excerpt}）` : ""}`)
      .join("；");
    const label = sceneMeta[scene].label;
    const prompt = [
      `进入${label} Soul 配置。`,
      directive ? `行为与爱的偏好：${directive}` : "",
      uploads.length > 0 ? `上传资料：${uploadSummary}` : "",
      "请确认规则并按该场景后续对话执行。"
    ].filter(Boolean).join("\n");
    if (!execute) {
      setDraft(prompt);
      setMomentumToast(`${label} Soul 配置已写入输入框。`);
      return;
    }
    const configText = [
      directive ? `偏好=${directive}` : "",
      uploads.length > 0 ? `资料=${uploads.map((item) => item.name).join("、")}` : ""
    ].filter(Boolean).join("；") || "更新 Soul 偏好";
    void applySceneConfigAndExecute({
      scene,
      moduleId: "soul-core",
      title: `${label} Soul`,
      goal: `让 ${label} 按用户偏好调整语气、亲密度和任务优先级`,
      configText,
      prompt,
      soulProfile: {
        directive,
        uploadedFiles: uploads
      }
    });
  };

  const updateSceneModelDraft = (scene: SceneKey, providerId: string) => {
    const selected = providerId.trim();
    if (!selected) return;
    setSceneModelDrafts((prev) => ({
      ...prev,
      [scene]: selected
    }));
    const provider = systemProviderMap.get(selected);
    const strength = providerStrengthLabels(provider).join(" / ");
    setMomentumToast(`${sceneMeta[scene].label} 已切换：${provider?.id || selected}（擅长：${strength}）`);
  };

  const switchCodingLayoutMode = (nextMode: "focus_chat" | "triple") => {
    setCodingLayoutMode(nextMode);
    setMomentumToast(
      nextMode === "focus_chat"
        ? "已切换为聊天主视图。"
        : "已切换为三栏开发视图。"
    );
  };

  const resolveTaskRouteCandidatesForScene = (scene: SceneKey) => {
    const taskType = sceneTaskTypeMap[scene];
    const taskRoutes = systemConfigState?.modelRoutingPolicy?.taskRoutes || {};
    const defaultRoute = String(systemConfigState?.systemProfile?.layers?.model?.defaultRoute || "").trim();
    const fallbackRoute = String(systemConfigState?.systemProfile?.layers?.model?.fallbackRoute || "").trim();
    const selected = String(sceneModelDrafts[scene] || "").trim();
    const candidates = [
      selected,
      ...(Array.isArray(taskRoutes[taskType]) ? taskRoutes[taskType] : []),
      defaultRoute,
      fallbackRoute
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean);
    return Array.from(new Set(candidates));
  };

  const pickHealthyProviderForScene = (scene: SceneKey, excludedProviderIds: string[] = []) => {
    const excluded = new Set(excludedProviderIds.map((item) => String(item || "").trim()).filter(Boolean));
    const candidates = resolveTaskRouteCandidatesForScene(scene);
    for (const candidate of candidates) {
      if (excluded.has(candidate)) continue;
      const runtime = modelRuntimeProviderMap.get(candidate);
      if (!runtime) continue;
      if (runtime.enabled !== false && runtime.apiKeyConfigured) {
        return candidate;
      }
    }
    for (const provider of sceneProviderOptions) {
      if (!provider || excluded.has(provider.id)) continue;
      const runtime = modelRuntimeProviderMap.get(provider.id);
      if (!runtime) continue;
      if (runtime.enabled !== false && runtime.apiKeyConfigured) {
        return provider.id;
      }
    }
    return "";
  };

  const shouldTriggerRouteAutoHealByError = (errorInput: unknown) => {
    const text = String(errorInput instanceof Error ? errorInput.message : errorInput || "").toLowerCase();
    if (!text) return false;
    return (
      text.includes("timeout")
      || text.includes("failed to fetch")
      || text.includes("network")
      || text.includes("internal error")
      || text.includes("stream closed without a done event")
      || text.includes("429")
      || text.includes("500")
      || text.includes("502")
      || text.includes("503")
      || text.includes("504")
    );
  };

  const appendRouteTraceEvent = (
    scene: SceneKey,
    userText: string,
    routeInfo: ModelRouteInfo | null,
    status: "success" | "warning" | "error" | "info",
    title: string,
    detail: string
  ) => {
    const route = routeInfo && typeof routeInfo === "object" ? routeInfo : null;
    const providerId = String(route?.providerId || "").trim();
    const model = String(route?.model || "").trim();
    const fallback = Boolean(route?.fallback);
    const safeText = String(userText || "").trim();
    setRouteTraceEvents((prev) => {
      const next: RouteTraceEvent[] = [
        ...prev,
        {
          id: `route-trace-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          at: new Date().toISOString(),
          status,
          title,
          detail,
          scene,
          userText: safeText,
          providerId,
          model,
          fallback
        }
      ];
      return next.slice(-60);
    });
  };

  const runRouteAutoHeal = (
    scene: SceneKey,
    options?: {
      routeInfo?: ModelRouteInfo | null;
      userText?: string;
      reason?: string;
    }
  ) => {
    const routeInfo = options?.routeInfo || null;
    const failedProviders = (routeInfo?.attempts || [])
      .filter((item) => !item.ok)
      .map((item) => String(item.providerId || "").trim())
      .filter(Boolean);
    const excluded = [
      String(routeInfo?.providerId || "").trim(),
      ...failedProviders
    ].filter(Boolean);
    const nextProviderId = pickHealthyProviderForScene(scene, excluded);
    if (!nextProviderId) {
      appendRouteTraceEvent(
        scene,
        options?.userText || "",
        routeInfo,
        "error",
        "模型路由自愈失败",
        "未找到可用 provider（可能缺少 key 或均不可用）。"
      );
      return false;
    }
    if (sceneModelDrafts[scene] !== nextProviderId) {
      setSceneModelDrafts((prev) => ({
        ...prev,
        [scene]: nextProviderId
      }));
    }
    const nextProvider = systemProviderMap.get(nextProviderId);
    setMomentumToast(
      `模型通道自愈完成：已切换到 ${nextProvider?.id || nextProviderId}${options?.reason ? `（${options.reason}）` : ""}`
    );
    const healedRouteInfo: ModelRouteInfo = {
      taskType: String(routeInfo?.taskType || sceneTaskTypeMap[scene] || "").trim(),
      source: String(routeInfo?.source || `scene:${scene}`).trim(),
      providerId: nextProviderId,
      model: String(nextProvider?.model || routeInfo?.model || "").trim(),
      fallback: false,
      attempts: Array.isArray(routeInfo?.attempts) ? routeInfo?.attempts : []
    };
    appendRouteTraceEvent(
      scene,
      options?.userText || "",
      healedRouteInfo,
      "success",
      "模型路由已自愈切换",
      `${options?.reason ? `${options.reason} · ` : ""}切换到 ${nextProvider?.id || nextProviderId}`
    );
    return true;
  };

  const retryLatestRouteWithAutoHeal = async () => {
    if (routeAutoHealBusy || sending) {
      setMomentumToast("当前仍在发送中，请稍后再试自愈重试。");
      return;
    }
    const text = String(latestRouteUserText || "").trim() || String(lastFailedDraft || "").trim();
    if (!text) {
      setMomentumToast("没有可重试的最近消息。请先发送一条编程指令。");
      return;
    }
    const scene = latestRouteScene || "coding";
    const nextProviderId = pickHealthyProviderForScene(scene, [
      String(latestRouteInfo?.providerId || "").trim()
    ]);
    setRouteAutoHealBusy(true);
    try {
      if (nextProviderId && sceneModelDrafts[scene] !== nextProviderId) {
        setSceneModelDrafts((prev) => ({
          ...prev,
          [scene]: nextProviderId
        }));
      }
      setMomentumToast("正在执行模型通道自愈重试...");
      await sendMessage(text, {
        scene,
        panel: scene === "coding" ? "workday" : rightPanel,
        forcedProviderId: nextProviderId || undefined,
        fromAutoHeal: true
      });
    } finally {
      setRouteAutoHealBusy(false);
    }
  };

  const updateAgiSceneExecutionSignal = (scene: SceneKey, autoExecution?: AutoExecutionInfo | null) => {
    if (!autoExecution) {
      return;
    }
    const targetScene = scene || "love";
    const reason = String(autoExecution.reason || "").trim();
    const dispatchStatus = String(autoExecution.dispatchStatus || "").trim().toLowerCase();
    const idempotencyByReason = reason === "chat_execution_idempotency_hit" || reason === "chat_execution_inflight_reuse";
    const autoRepairApplied = autoExecution.autoRepairApplied === true;
    const autoRepairSummary = String(autoExecution.autoRepairSummary || "").trim();
    setAgiSceneExecutionSignals((prev) => ({
      ...prev,
      [targetScene]: {
        updatedAt: new Date().toISOString(),
        reason,
        dispatchId: String(autoExecution.dispatchId || "").trim(),
        dispatchStatus,
        autoRepairApplied,
        autoRepairMode: String(autoExecution.autoRepairMode || "").trim(),
        autoRepairSummary,
        idempotencyHit: autoExecution.idempotencyHit === true || idempotencyByReason
      }
    }));
  };

  const toggleEnabledSceneDraft = (scene: SceneKey) => {
    setSystemEnabledScenesDraft((prev) => {
      const exists = prev.includes(scene);
      if (exists) {
        const next = prev.filter((item) => item !== scene);
        return next.length > 0 ? next : prev;
      }
      return [...prev, scene];
    });
  };

  const updateTaskRouteDraft = (taskType: string, value: string) => {
    const key = taskType.trim();
    if (!key) return;
    setSystemTaskRoutesDraft((prev) => ({
      ...prev,
      [key]: value
    }));
    if (key === "autonomy_dispatch") {
      setAutonomyDispatchRouteDraft(value);
    }
  };

  const setTaskRouteProviderIds = (taskType: string, providerIds: string[]) => {
    const key = taskType.trim();
    if (!key) return;
    const normalized = Array.from(new Set(providerIds.map((item) => String(item || "").trim()).filter(Boolean)));
    const value = formatProviderRouteDraft(normalized);
    updateTaskRouteDraft(key, value);
  };

  const addTaskRouteProvider = (taskType: string, providerId: string) => {
    const key = taskType.trim();
    const nextProvider = providerId.trim();
    if (!key || !nextProvider) return;
    const current = parseProviderRouteDraft(systemTaskRoutesDraft[key] || "");
    if (current.includes(nextProvider)) {
      return;
    }
    setTaskRouteProviderIds(key, [...current, nextProvider]);
  };

  const removeTaskRouteProvider = (taskType: string, providerId: string) => {
    const key = taskType.trim();
    const target = providerId.trim();
    if (!key || !target) return;
    const current = parseProviderRouteDraft(systemTaskRoutesDraft[key] || "");
    setTaskRouteProviderIds(
      key,
      current.filter((item) => item !== target)
    );
  };

  const moveTaskRouteProvider = (taskType: string, providerId: string, direction: "up" | "down") => {
    const key = taskType.trim();
    const target = providerId.trim();
    if (!key || !target) return;
    const current = parseProviderRouteDraft(systemTaskRoutesDraft[key] || "");
    const currentIndex = current.indexOf(target);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = direction === "up"
      ? Math.max(0, currentIndex - 1)
      : Math.min(current.length - 1, currentIndex + 1);
    if (nextIndex === currentIndex) {
      return;
    }
    const next = [...current];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(nextIndex, 0, moved);
    setTaskRouteProviderIds(key, next);
  };

  const applyDefaultTaskRoute = (taskType: string) => {
    const key = taskType.trim();
    if (!key) return;
    const defaults = parseProviderRouteDraft(
      formatProviderRouteDraft([systemDefaultRouteDraft, systemFallbackRouteDraft])
    );
    if (defaults.length === 0) {
      return;
    }
    const current = parseProviderRouteDraft(systemTaskRoutesDraft[key] || "");
    setTaskRouteProviderIds(key, Array.from(new Set([...defaults, ...current])));
  };

  const removeTaskRouteDraft = (taskType: string) => {
    const key = taskType.trim();
    if (!key) return;
    setSystemTaskRoutesDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (key === "autonomy_dispatch") {
      setAutonomyDispatchRouteDraft("");
    }
  };

  const addTaskRouteDraft = () => {
    const key = systemTaskRouteKeyDraft.trim();
    if (!key) return;
    const initialValue = formatProviderRouteDraft(
      parseProviderRouteDraft(formatProviderRouteDraft([systemDefaultRouteDraft, systemFallbackRouteDraft]))
    );
    setSystemTaskRoutesDraft((prev) => {
      if (prev[key] !== undefined) {
        return prev;
      }
      return {
        ...prev,
        [key]: initialValue
      };
    });
    setSystemTaskRouteKeyDraft("");
  };

  const setSuperSkillRequired = (skillId: string, required: boolean) => {
    const normalizedId = skillId.trim();
    if (!normalizedId) return;
    setSuperSkillDraftEntries((prev) => prev.map((item) => (
      item.id === normalizedId
        ? {
          ...item,
          required
        }
        : item
    )));
  };

  const applyOpsPreset = (preset: "safe" | "balanced" | "aggressive") => {
    if (preset === "safe") {
      setSuperQueueRetryBudgetDraft(2);
      setSuperQueueBackoffDraft(1800);
      setSuperCircuitFailureDraft(2);
      setSuperCircuitCooldownDraft(60000);
      setFusionLongTaskThresholdDraft(6);
      setFusionProgressIntervalDraft(20);
      setFusionBlockReportDraft(20);
      setMomentumToast("已切换为稳态运营预设：优先稳定和可恢复。");
      return;
    }
    if (preset === "aggressive") {
      setSuperQueueRetryBudgetDraft(4);
      setSuperQueueBackoffDraft(900);
      setSuperCircuitFailureDraft(4);
      setSuperCircuitCooldownDraft(30000);
      setFusionLongTaskThresholdDraft(10);
      setFusionProgressIntervalDraft(40);
      setFusionBlockReportDraft(30);
      setMomentumToast("已切换为冲刺预设：优先速度和吞吐。");
      return;
    }
    setSuperQueueRetryBudgetDraft(3);
    setSuperQueueBackoffDraft(1200);
    setSuperCircuitFailureDraft(3);
    setSuperCircuitCooldownDraft(45000);
    setFusionLongTaskThresholdDraft(8);
    setFusionProgressIntervalDraft(30);
    setFusionBlockReportDraft(30);
    setMomentumToast("已切换为日常预设：稳定与效率平衡。");
  };

  const buildFriendReplyPrompt = (friendName: string, incomingText: string) => {
    const safeText = incomingText.trim();
    const replySeed = safeText.length > 0 ? `收到你这句：「${safeText}」` : "我看到你的消息了";
    return `给 ${friendName} 回消息：${replySeed}。语气自然一点，顺便把话题延续下去。`;
  };

  const fillFriendReplyDraft = (friendName: string, incomingText: string) => {
    setDraft(buildFriendReplyPrompt(friendName, incomingText));
    setMomentumToast(`已写好回复草稿：${friendName}`);
  };

  const renderSceneSoulConfigPanel = (
    scene: SceneSoulTarget,
    options: {
      className?: string;
      title?: string;
      subtitle?: string;
    } = {}
  ) => {
    const status = formatSceneModuleStatus(scene, "soul-core");
    const draftValue = sceneSoulDrafts[scene] || "";
    const uploadedFiles = sceneSoulUploads[scene] || [];
    const isApplying = sceneConfigApplyingKey === `${scene}:soul-core`;
    return (
      <section className={`scene-model-config scene-soul-config-panel ${options.className || ""}`.trim()}>
        <div className="scene-model-config-head">
          <strong>{options.title || `${sceneMeta[scene].label} Soul 配置`}</strong>
          <small>{options.subtitle || "输入偏好 + 上传资料，后续该场景会按规则执行"}</small>
        </div>
        <small className={`module-config-status scene-soul-status is-${status.tone}`}>
          {status.label} · {status.detail}
        </small>
        <label className="scene-model-config-field">
          <span>{sceneMeta[scene].label} Soul 指令</span>
          <textarea
            value={draftValue}
            onChange={(event) => setSceneSoulDrafts((prev) => ({ ...prev, [scene]: event.target.value }))}
            placeholder="例如：多一点鼓励、少说教；先给结论再执行。"
          />
        </label>
        <div className="scene-soul-upload-row">
          <label className="scene-soul-upload-btn">
            上传文件
            <input
              type="file"
              multiple
              onChange={(event) => {
                void handleSceneSoulFilePick(scene, event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <small>支持文本/文档资料，最多 {SCENE_SOUL_MAX_FILES} 份</small>
        </div>
        <div className="scene-soul-file-list">
          {uploadedFiles.length === 0 ? (
            <p className="scene-soul-file-empty">暂无上传资料，可补充偏好文档、习惯清单、沟通规则。</p>
          ) : (
            uploadedFiles.map((file) => (
              <article key={file.id} className="scene-soul-file-item">
                <div>
                  <strong>{file.name}</strong>
                  <small>{Math.max(0, Math.round((file.size || 0) / 1024))} KB</small>
                </div>
                <button type="button" onClick={() => removeSceneSoulFile(scene, file.id)}>移除</button>
              </article>
            ))
          )}
        </div>
        <div className="scene-soul-actions">
          <button type="button" onClick={() => applySceneSoulDraft(scene, false)} disabled={isApplying}>
            写入输入框
          </button>
          <button type="button" onClick={() => applySceneSoulDraft(scene, true)} disabled={isApplying}>
            {isApplying ? "执行中..." : "应用并执行"}
          </button>
        </div>
      </section>
    );
  };

  const renderSceneModelConfig = (scene: SceneKey, options: {
    className?: string;
    title?: string;
    subtitle?: string;
  } = {}) => {
    const selectedProviderId = sceneModelDrafts[scene] || "";
    const selectedProvider = sceneSelectedProviders[scene];
    const strengthLabels = providerStrengthLabels(selectedProvider);
    return (
      <section className={`scene-model-config ${options.className || ""}`.trim()}>
        <div className="scene-model-config-head">
          <strong>{options.title || "模型配置"}</strong>
          <small>{options.subtitle || "下拉选择后，该场景聊天立即使用"}</small>
        </div>
        <label className="scene-model-config-field">
          <span>{sceneMeta[scene].label}模型</span>
          <select
            value={selectedProviderId}
            onChange={(event) => updateSceneModelDraft(scene, event.target.value)}
            disabled={sceneProviderOptions.length === 0}
          >
            {sceneProviderOptions.length === 0 ? (
              <option value="">暂无可用模型</option>
            ) : null}
            {sceneProviderOptions.map((provider) => (
              <option key={`scene-model-${scene}-${provider.id}`} value={provider.id}>
                {provider.id} · {provider.model}
              </option>
            ))}
          </select>
        </label>
        <div className="scene-model-strength">
          <span>模型擅长</span>
          <div className="scene-model-strength-tags">
            {strengthLabels.map((item) => (
              <em key={`scene-strength-${scene}-${item}`}>{item}</em>
            ))}
          </div>
        </div>
      </section>
    );
  };
  /* ─── Creative Canvas Helpers ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(CANVAS_NOTES_KEY, JSON.stringify(canvasNotes)); } catch { /* ignore */ }
  }, [canvasNotes]);

  useEffect(() => {
    if (!pomodoroRunning) return;
    pomodoroIntervalRef.current = setInterval(() => {
      setPomodoroSeconds((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
          setMomentumToast("🍅 番茄钟时间到！休息一下吧～");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); };
  }, [pomodoroRunning]);

  const generatePalette = () => {
    const hue = Math.floor(Math.random() * 360);
    const colors = Array.from({ length: 5 }, (_, i) => {
      const h = (hue + i * 72) % 360;
      return `hsl(${h}, ${55 + Math.random() * 25}%, ${45 + Math.random() * 20}%)`;
    });
    setPaletteColors(colors);
  };

  const addCanvasNote = () => {
    const note: CanvasNote = {
      id: `note-${Date.now()}`,
      text: "",
      color: NOTE_COLORS[canvasNotes.length % NOTE_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    setCanvasNotes((prev) => [note, ...prev]);
  };

  const updateCanvasNote = (id: string, text: string) => {
    setCanvasNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const removeCanvasNote = (id: string) => {
    setCanvasNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCanvasDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setCanvasFileDragging(false);
    const files = event.dataTransfer.files;
    if (!files.length) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const card: CanvasFileCard = {
        id: `file-${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: "",
        createdAt: new Date().toISOString(),
      };
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setCanvasFiles((prev) =>
            prev.map((f) => (f.id === card.id ? { ...f, previewUrl: String(reader.result || "") } : f))
          );
        };
        reader.readAsDataURL(file);
      }
      setCanvasFiles((prev) => [...prev, card]);
    }
    setMomentumToast(`已添加 ${files.length} 个文件到白板`);
  };

  const removeCanvasFile = (id: string) => {
    setCanvasFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const spawnMiniApp = (type: CanvasMiniApp["type"]) => {
    const labels: Record<CanvasMiniApp["type"], string> = {
      pomodoro: "⏱ 番茄钟",
      palette: "🎨 调色板",
      notepad: "📝 速记板",
      inspiration: "💡 随机灵感",
    };
    const app: CanvasMiniApp = {
      id: `app-${Date.now()}`,
      label: labels[type],
      type,
    };
    if (type === "palette") generatePalette();
    if (type === "inspiration") {
      // just spawn - the render will pick a random quote
    }
    setCanvasMiniApps((prev) => [...prev, app]);
  };

  const removeMiniApp = (id: string) => {
    setCanvasMiniApps((prev) => prev.filter((a) => a.id !== id));
  };

  const initCanvasDrawing = () => {
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  // Auto-init canvas when scene activates with draw tab, plus handle resize
  useEffect(() => {
    if (!canvasSceneActive || canvasTab !== "draw") return;
    // small delay to let DOM render the canvas element
    const timer = setTimeout(initCanvasDrawing, 80);
    const canvas = canvasDrawRef.current;
    let observer: ResizeObserver | null = null;
    if (canvas) {
      observer = new ResizeObserver(() => {
        const r = canvas.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (canvas.width !== Math.round(r.width) || canvas.height !== Math.round(r.height))) {
          canvas.width = Math.round(r.width);
          canvas.height = Math.round(r.height);
        }
      });
      observer.observe(canvas);
    }
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [canvasSceneActive, canvasTab]);

  const canvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    canvasIsDrawingRef.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  };

  const canvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasIsDrawingRef.current) return;
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = canvasBrushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = canvasIsEraser ? "rgba(15,12,20,1)" : canvasBrushColor;
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  };

  const canvasMouseUp = () => {
    canvasIsDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const renderCreativeCanvas = () => {
    const tabs: { key: CanvasTab; label: string }[] = [
      { key: "draw", label: "🎨 画板" },
      { key: "files", label: "📁 文件" },
      { key: "notes", label: "💡 灵感" },
      { key: "apps", label: "🚀 应用" },
    ];

    return (
      <aside className="creative-canvas">
        <div className="creative-canvas-tabs">
          {tabs.map((tab) => (
            <button
              key={`canvas-tab-${tab.key}`}
              type="button"
              className={canvasTab === tab.key ? "is-active" : ""}
              onClick={() => {
                setCanvasTab(tab.key);
                if (tab.key === "draw") setTimeout(initCanvasDrawing, 50);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="creative-canvas-body">
          {/* ── Drawing Tab ── */}
          {canvasTab === "draw" ? (
            <div className="canvas-drawing-area">
              <div className="canvas-toolbar">
                <button
                  type="button"
                  className={!canvasIsEraser ? "is-active" : ""}
                  onClick={() => setCanvasIsEraser(false)}
                >
                  ✏️ 笔
                </button>
                <button
                  type="button"
                  className={canvasIsEraser ? "is-active" : ""}
                  onClick={() => setCanvasIsEraser(true)}
                >
                  🧹 擦
                </button>
                <input
                  type="color"
                  value={canvasBrushColor}
                  onChange={(event) => setCanvasBrushColor(event.target.value)}
                  title="画笔颜色"
                />
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={canvasBrushSize}
                  onChange={(event) => setCanvasBrushSize(Number(event.target.value))}
                  title="画笔粗细"
                />
                <button type="button" onClick={clearCanvas}>
                  🗑 清空
                </button>
              </div>
              <canvas
                ref={canvasDrawRef}
                className="canvas-draw-surface"
                onMouseDown={canvasMouseDown}
                onMouseMove={canvasMouseMove}
                onMouseUp={canvasMouseUp}
                onMouseLeave={canvasMouseUp}
              />
            </div>
          ) : null}

          {/* ── Files Tab ── */}
          {canvasTab === "files" ? (
            <>
              <div
                className={`canvas-files-dropzone ${canvasFileDragging ? "is-dragging" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setCanvasFileDragging(true); }}
                onDragLeave={() => setCanvasFileDragging(false)}
                onDrop={handleCanvasDrop}
              >
                <span className="dropzone-icon">📂</span>
                <span>拖拽文件到这里</span>
                <small>支持图片、文档等任意文件</small>
              </div>
              {canvasFiles.length > 0 ? (
                <div className="canvas-file-grid">
                  {canvasFiles.map((file) => (
                    <article key={file.id} className="canvas-file-card">
                      <div className="file-card-info">
                        <strong>{file.name}</strong>
                        <small>{formatFileSize(file.size)} · {file.type || "unknown"}</small>
                      </div>
                      <button type="button" onClick={() => removeCanvasFile(file.id)}>删除</button>
                      {file.previewUrl ? (
                        <div className="canvas-file-card-preview">
                          <img src={file.previewUrl} alt={file.name} />
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="canvas-empty-hint">
                  <span>📭</span>
                  暂无文件，从桌面拖拽进来吧
                </div>
              )}
            </>
          ) : null}

          {/* ── Notes Tab ── */}
          {canvasTab === "notes" ? (
            <>
              <div className="canvas-notes-header">
                <strong>灵感便签 ({canvasNotes.length})</strong>
                <button type="button" onClick={addCanvasNote}>+ 新便签</button>
              </div>
              {canvasNotes.length > 0 ? (
                <div className="canvas-notes-grid">
                  {canvasNotes.map((note) => (
                    <article key={note.id} className={`canvas-note-card note-${note.color}`}>
                      <textarea
                        placeholder="写下你的灵感..."
                        value={note.text}
                        onChange={(event) => updateCanvasNote(note.id, event.target.value)}
                        rows={2}
                      />
                      <div className="note-actions">
                        <small>{new Date(note.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</small>
                        <button type="button" onClick={() => removeCanvasNote(note.id)}>✕ 删除</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="canvas-empty-hint">
                  <span>💭</span>
                  点击"新便签"开始记录灵感
                </div>
              )}
            </>
          ) : null}

          {/* ── Mini Apps Tab ── */}
          {canvasTab === "apps" ? (
            <>
              <div className="canvas-apps-header">
                <strong>临时应用</strong>
              </div>
              <div className="canvas-apps-spawn-grid">
                <button type="button" onClick={() => spawnMiniApp("pomodoro")}>⏱ 番茄钟</button>
                <button type="button" onClick={() => spawnMiniApp("palette")}>🎨 调色板</button>
                <button type="button" onClick={() => spawnMiniApp("notepad")}>📝 速记板</button>
                <button type="button" onClick={() => spawnMiniApp("inspiration")}>💡 灵感</button>
              </div>
              {canvasMiniApps.length > 0 ? (
                <div className="canvas-mini-app-list">
                  {canvasMiniApps.map((app) => (
                    <div key={app.id} className="canvas-mini-app">
                      <div className="canvas-mini-app-head">
                        <strong>{app.label}</strong>
                        <button type="button" onClick={() => removeMiniApp(app.id)}>✕</button>
                      </div>
                      <div className="canvas-mini-app-body">
                        {app.type === "pomodoro" ? (
                          <>
                            <div className="pomodoro-display">
                              {String(Math.floor(pomodoroSeconds / 60)).padStart(2, "0")}:{String(pomodoroSeconds % 60).padStart(2, "0")}
                            </div>
                            <div className="pomodoro-controls">
                              <button
                                type="button"
                                onClick={() => setPomodoroRunning((prev) => !prev)}
                              >
                                {pomodoroRunning ? "⏸ 暂停" : "▶ 开始"}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setPomodoroRunning(false); setPomodoroSeconds(25 * 60); }}
                              >
                                🔄 重置
                              </button>
                            </div>
                          </>
                        ) : null}
                        {app.type === "palette" ? (
                          <>
                            <div className="palette-swatches">
                              {paletteColors.map((color, i) => (
                                <div
                                  key={`swatch-${i}`}
                                  className="palette-swatch"
                                  style={{ background: color }}
                                  title={color}
                                  onClick={() => {
                                    void navigator.clipboard.writeText(color);
                                    setMomentumToast(`已复制颜色：${color}`);
                                  }}
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              className="pomodoro-controls"
                              onClick={generatePalette}
                              style={{ border: "1px solid rgba(195,160,120,0.2)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 10, padding: "4px 10px", cursor: "pointer" }}
                            >
                              🎲 换一组
                            </button>
                          </>
                        ) : null}
                        {app.type === "notepad" ? (
                          <div className="quick-notepad">
                            <textarea placeholder="在这里快速记录..." rows={4} />
                          </div>
                        ) : null}
                        {app.type === "inspiration" ? (() => {
                          const quote = INSPIRATION_QUOTES[Math.floor(Math.random() * INSPIRATION_QUOTES.length)];
                          return (
                            <div className="inspiration-display">
                              "{quote.text}"
                              <small>— {quote.author}</small>
                            </div>
                          );
                        })() : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="canvas-empty-hint">
                  <span>🧩</span>
                  点击上方按钮生成临时应用
                </div>
              )}
            </>
          ) : null}
        </div>
      </aside>
    );
  };

  const copyFunGameLink = async (game: DemoFunGame) => {
    const link = game.playUrl.trim();
    if (!link) {
      setMomentumToast("该小游戏暂未生成可用链接。");
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        setMomentumToast("小游戏链接已复制。");
        return;
      }
      setDraft(link);
      setMomentumToast("当前环境不支持剪贴板，已写入输入框。");
    } catch {
      setDraft(link);
      setMomentumToast("复制失败，已把链接写入输入框。");
    }
  };

  const reuseFunGameTemplate = (game: DemoFunGame) => {
    const moduleId = game.mode === "handmade_game" ? "handmade_game" : "mini_game";
    setActiveFunLeftModuleId(moduleId);
    setFunSubConfigActionId((funCenterQuickActions[moduleId] || [])[0]?.id || "");
    setFunGameDraft({
      difficulty: game.difficulty,
      rounds: Math.max(1, Math.min(30, game.rounds)),
      scoreEnabled: game.scoreEnabled,
      rewardEnabled: game.rewardEnabled,
      reviveEnabled: game.reviveEnabled,
      templateName: game.templateName || "手搓规则模板"
    });
    setFunSubConfigInput(game.prompt || "");
    setShowFunConfigBubble(true);
    setMomentumToast(`已载入模板：${game.title}`);
  };

  useEffect(() => {
    if (activeFunConfigActions.length === 0) {
      setFunSubConfigActionId("");
      return;
    }
    if (!activeFunConfigActions.some((item) => item.id === funSubConfigActionId)) {
      setFunSubConfigActionId(activeFunConfigActions[0].id);
    }
  }, [activeFunConfigActions, funSubConfigActionId]);

  useEffect(() => {
    if (activeScene !== "fun" || rightPanel !== "funzone") {
      setShowFunConfigBubble(false);
    }
  }, [activeScene, rightPanel]);

  useEffect(() => {
    if (activeScene !== "fun" || rightPanel !== "funzone") {
      return;
    }
    void syncFunGames({ silent: true });
  }, [activeScene, rightPanel]);

  useEffect(() => {
    if (activeScene !== "life" || rightPanel !== "memory") {
      setShowLifeConfigBubble(false);
    }
  }, [activeScene, rightPanel]);

  useEffect(() => {
    if (activeScene !== "love" || rightPanel !== "chat") {
      setShowLoveConfigBubble(false);
    }
  }, [activeScene, rightPanel]);

  useEffect(() => {
    if (rightPanel !== "brain") return;
    refreshLegacyCompatBridge();
    if (!systemConfigState && !systemConfigLoading) {
      void syncSystemConfig({ silent: true });
    }
    if (!systemConfigHistoryState && !systemConfigHistoryLoading) {
      void syncSystemConfigHistory({ silent: true });
    }
    if (!unifiedTimelineState && !timelineLoading) {
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    }
    if (!voiceProfileState && !voiceProfileLoading) {
      void syncVoiceProfile({ silent: true });
    }
  }, [
    rightPanel,
    systemConfigState,
    systemConfigLoading,
    systemConfigHistoryState,
    systemConfigHistoryLoading,
    unifiedTimelineState,
    timelineLoading,
    voiceProfileState,
    voiceProfileLoading
  ]);

  useEffect(() => {
    if (activeScene !== "fun" || rightPanel !== "funzone") {
      return;
    }
    const timer = window.setInterval(() => {
      const friend = funFriendList[Math.floor(Math.random() * funFriendList.length)];
      const text = funFriendMessageTemplates[Math.floor(Math.random() * funFriendMessageTemplates.length)];
      const incoming = {
        id: `fun-feed-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        friendId: friend.id,
        friendName: friend.name,
        avatar: friend.avatar,
        text,
        at: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      };
      setFunFriendFeed((prev) => [incoming, ...prev].slice(0, 20));
      setFunFriendUnread((prev) => ({
        ...prev,
        [friend.id]: friend.id === activeFunFriendId ? 0 : (prev[friend.id] || 0) + 1
      }));
    }, 18000);
    return () => window.clearInterval(timer);
  }, [activeFunFriendId, activeScene, rightPanel]);

  useEffect(() => {
    const container = activeMessageListRef.current;
    if (!container) {
      return;
    }
    const syncFollowState = () => {
      chatAutoFollowRef.current = isMessageListNearBottom(container);
    };
    syncFollowState();
    container.addEventListener("scroll", syncFollowState, {
      passive: true
    });
    return () => {
      container.removeEventListener("scroll", syncFollowState);
    };
  }, [rightPanel, activeScene, codingLayoutMode]);
  useEffect(() => {
    chatAutoFollowRef.current = true;
    const rafId = window.requestAnimationFrame(() => {
      scrollToBottom("auto");
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [rightPanel, activeScene, codingLayoutMode]);
  useLayoutEffect(() => {
    const shouldFollow =
      chatAutoFollowRef.current
      || streamStatus === "loading"
      || streamStatus === "streaming"
      || sending;
    if (!shouldFollow) {
      return;
    }
    const behavior: ScrollBehavior = streamStatus === "streaming" ? "auto" : "smooth";
    scrollToBottom(behavior);
  }, [messages, streamStatus, sending]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(AGI_VIEWPORT_OPEN_STORAGE_KEY, agiViewportOpen ? "1" : "0");
  }, [agiViewportOpen]);
  useEffect(() => {
    if (agiFlowCandidates.length === 0) {
      if (agiViewportFlowId) {
        setAgiViewportFlowId("");
      }
      return;
    }
    if (!agiViewportFlowId || !agiFlowCandidates.some((flow) => flow.flowId === agiViewportFlowId)) {
      setAgiViewportFlowId(agiFlowCandidates[0].flowId);
    }
  }, [agiFlowCandidates, agiViewportFlowId]);
  useEffect(() => {
    if (!showOnboarding) return;
    openPanel(onboardingFlow[0].panel, onboardingFlow[0].scene);
  }, [showOnboarding]);
  useEffect(() => {
    if (!momentumToast) return;
    const timer = window.setTimeout(() => setMomentumToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [momentumToast]);

  useEffect(() => {
    if (!systemConfigState) return;
    const defaultRoute = systemConfigState.systemProfile?.layers?.model?.defaultRoute || "";
    const fallbackRoute = systemConfigState.systemProfile?.layers?.model?.fallbackRoute || "";
    const enabledScenesRaw = systemConfigState.systemProfile?.layers?.application?.enabledScenes || [];
    const taskRoutes = systemConfigState.modelRoutingPolicy?.taskRoutes || {};
    const normalizedTaskRoutes: Record<string, string> = {};
    for (const [taskType, providers] of Object.entries(taskRoutes)) {
      const key = taskType.trim();
      if (!key) continue;
      normalizedTaskRoutes[key] = formatProviderRouteDraft(Array.isArray(providers) ? providers : []);
    }
    const enabledScenes = enabledScenesRaw
      .map((item) => String(item || "").trim())
      .filter((item): item is SceneKey => ["work", "fun", "life", "love", "coding"].includes(item));
    setSystemDefaultRouteDraft(defaultRoute);
    setSystemFallbackRouteDraft(fallbackRoute);
    setSystemEnabledScenesDraft(enabledScenes.length > 0 ? enabledScenes : ["work", "fun", "life", "love", "coding"]);
    setSystemDegradeTimeoutDraft(systemConfigState.modelRoutingPolicy?.degradeStrategy?.timeoutMs || 20000);
    setSystemDegradeRetryDraft(systemConfigState.modelRoutingPolicy?.degradeStrategy?.maxRetries ?? 2);
    setSystemTaskRoutesDraft(normalizedTaskRoutes);
    setSystemTaskRouteKeyDraft("");
    setAutonomyDispatchRouteDraft(normalizedTaskRoutes.autonomy_dispatch || "");
    const availableProviderIds = new Set((systemConfigState.modelRoutingPolicy?.providers || [])
      .filter((provider) => provider.disabled !== true)
      .map((provider) => provider.id));
    const defaultRouteForScene = {
      work: (taskRoutes.work_planning || [])[0] || defaultRoute || fallbackRoute,
      fun: (taskRoutes.emotional_companion || [])[0] || defaultRoute || fallbackRoute,
      life: (taskRoutes.memory_digest || [])[0] || defaultRoute || fallbackRoute,
      love: (taskRoutes.emotional_companion || [])[0] || defaultRoute || fallbackRoute,
      coding: (taskRoutes.coding_execution || [])[0] || (taskRoutes.work_planning || [])[0] || defaultRoute || fallbackRoute
    };
    setSceneModelDrafts((prev) => {
      const next: Record<SceneKey, string> = {
        work: availableProviderIds.has(prev.work) ? prev.work : (defaultRouteForScene.work || ""),
        fun: availableProviderIds.has(prev.fun) ? prev.fun : (defaultRouteForScene.fun || ""),
        life: availableProviderIds.has(prev.life) ? prev.life : (defaultRouteForScene.life || ""),
        love: availableProviderIds.has(prev.love) ? prev.love : (defaultRouteForScene.love || ""),
        coding: availableProviderIds.has(prev.coding) ? prev.coding : (defaultRouteForScene.coding || "")
      };
      if (
        next.work === prev.work
        && next.fun === prev.fun
        && next.life === prev.life
        && next.love === prev.love
        && next.coding === prev.coding
      ) {
        return prev;
      }
      return next;
    });

    const superProfile = asObjectRecord(systemConfigState.superAutonomyProfile);
    const superSkills = parseSuperSkillRegistryDraft(superProfile.skillRegistry);
    setSuperSkillDraftEntries(superSkills);
    const stabilityPolicy = asObjectRecord(superProfile.stabilityPolicy);
    const queuePolicy = asObjectRecord(stabilityPolicy.queue);
    const circuitPolicy = asObjectRecord(stabilityPolicy.circuitBreaker);
    setSuperQueueRetryBudgetDraft(parseNumberDraft(queuePolicy.retryBudgetPerTask, 3, 1, 10));
    setSuperQueueBackoffDraft(parseNumberDraft(queuePolicy.backoffMs, 1200, 100, 60000));
    setSuperCircuitFailureDraft(parseNumberDraft(circuitPolicy.failureThreshold, 3, 1, 20));
    setSuperCircuitCooldownDraft(parseNumberDraft(circuitPolicy.coolDownMs, 45000, 1000, 600000));

    const fusionProfile = asObjectRecord(systemConfigState.ariaKernelFusionProfile);
    const automationProtocol = asObjectRecord(fusionProfile.automationProtocol);
    const progressPolicy = asObjectRecord(automationProtocol.progress);
    setFusionLongTaskThresholdDraft(parseNumberDraft(progressPolicy.longTaskThresholdSec, 8, 3, 120));
    setFusionProgressIntervalDraft(parseNumberDraft(progressPolicy.intervalSec, 30, 5, 300));
    setFusionBlockReportDraft(parseNumberDraft(progressPolicy.blockReportSec, 30, 5, 300));

    const systemProfile = asObjectRecord(systemConfigState.systemProfile);
    const layerProfile = asObjectRecord(systemProfile.layers);
    const technologyLayer = asObjectRecord(layerProfile.technology);
    const applicationLayer = asObjectRecord(layerProfile.application);
    const personaIntensity = asObjectRecord(applicationLayer.personaIntensity);
    setPersonaIntensityLevelDraft(
      parsePersonaIntensityLevel(personaIntensity.activeLevel, "L2")
    );
    const goalContract = asObjectRecord(applicationLayer.goalContract);
    setGoalClarifyThresholdDraft(parseFloatDraft(goalContract.autoClarifyThreshold, 0.72, 0.4, 0.95));

    const learningEngine = asObjectRecord(systemProfile.learningEngine);
    const autonomousEvolution = asObjectRecord(learningEngine.autonomousEvolution);
    const learningSchedules = asObjectRecord(autonomousEvolution.schedules);
    setAuthorityLearningCronDraft(
      String(learningSchedules.authorityKnowledgeSyncCron || "0 */6 * * *").trim() || "0 */6 * * *"
    );
    setFeedbackDigestCronDraft(
      String(learningSchedules.feedbackDigestCron || "*/30 * * * *").trim() || "*/30 * * * *"
    );

    const memoryFramework = asObjectRecord(systemProfile.memoryFramework);
    const crossSceneAssociation = asObjectRecord(memoryFramework.crossSceneAssociation);
    setCrossSceneRecallTopKDraft(parseNumberDraft(crossSceneAssociation.recallTopK, 6, 1, 20));

    const contextRecycleSystem = asObjectRecord(systemProfile.contextRecycleSystem);
    const contextRules = asObjectRecord(contextRecycleSystem.rules);
    setContextImportanceThresholdDraft(parseFloatDraft(contextRules.importanceThreshold, 0.72, 0.4, 0.95));

    const mcpBrowserRuntime = asObjectRecord(technologyLayer.mcpBrowserRuntime);
    setMcpBrowserRuntimeEnabledDraft(mcpBrowserRuntime.enabled !== false);

    const skillBuiltin = asObjectRecord(systemProfile.skillAndExpansionBuiltin);
    const githubSkillDiscovery = asObjectRecord(skillBuiltin.githubOfficialSkillDiscovery);
    setGithubSkillDiscoveryEnabledDraft(githubSkillDiscovery.enabled !== false);

    const multiDeviceRuntime = asObjectRecord(systemProfile.multiDeviceRuntime);
    const voiceConfig = asObjectRecord(multiDeviceRuntime.voice);
    const hardwareBridge = asObjectRecord(multiDeviceRuntime.hardwareBridge);
    setVoiceEnabledDraft(voiceConfig.enabled !== false);
    setBluetoothEnabledDraft(hardwareBridge.bluetooth !== false);
    const foundationLayer = asObjectRecord(layerProfile.foundation);
    const foundationStorage = asObjectRecord(foundationLayer.storage);
    const vectorRuntimeConfig = asObjectRecord(foundationStorage.vectorRuntime);
    const vectorRuntimeQdrant = asObjectRecord(vectorRuntimeConfig.qdrant);
    const runtimeVectorModeRaw = String(systemConfigState.memoryPlaneRuntime?.vector?.mode || vectorRuntimeConfig.mode || "local").trim().toLowerCase();
    const runtimeVectorMode = runtimeVectorModeRaw === "qdrant" ? "qdrant" : "local";
    setVectorBackendModeDraft(runtimeVectorMode);
    setVectorQdrantUrlDraft(
      String(
        systemConfigState.memoryPlaneRuntime?.vector?.qdrant?.url
        || vectorRuntimeQdrant.url
        || "http://127.0.0.1:6333"
      ).trim() || "http://127.0.0.1:6333"
    );
    setVectorQdrantCollectionDraft(
      String(
        systemConfigState.memoryPlaneRuntime?.vector?.qdrant?.collection
        || vectorRuntimeQdrant.collection
        || "aria_memory"
      ).trim() || "aria_memory"
    );
    setVectorQdrantTimeoutDraft(
      parseNumberDraft(vectorRuntimeQdrant.timeoutMs, 6000, 1000, 30000)
    );
    setMemoryBackendCheck(null);
    setSystemConfigHistoryState(systemConfigState.configOps || null);
  }, [systemConfigState]);

  useEffect(() => {
    setSceneSoulDrafts((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const scene of SCENE_SOUL_TARGETS) {
        const module = sceneModuleStateMap.get(buildSceneSoulModuleKey(scene));
        const directive = String(module?.soulProfile?.directive || "").trim();
        if (!directive) continue;
        if (next[scene].trim()) continue;
        next[scene] = directive;
        changed = true;
      }
      return changed ? next : prev;
    });
    setSceneSoulUploads((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const scene of SCENE_SOUL_TARGETS) {
        if ((next[scene] || []).length > 0) continue;
        const module = sceneModuleStateMap.get(buildSceneSoulModuleKey(scene));
        const uploadedFiles = Array.isArray(module?.soulProfile?.uploadedFiles)
          ? module.soulProfile.uploadedFiles
          : [];
        if (uploadedFiles.length === 0) continue;
        next[scene] = uploadedFiles.map((item, index) => ({
          id: String(item?.id || `soul-${scene}-${index}`),
          name: String(item?.name || "未命名文件"),
          type: String(item?.type || ""),
          size: Number(item?.size || 0),
          uploadedAt: String(item?.uploadedAt || ""),
          excerpt: String(item?.excerpt || "")
        }));
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [sceneModuleStateMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SCENE_MODEL_PREFS_KEY, JSON.stringify(sceneModelDrafts));
    } catch {
      // ignore storage quota / private mode errors
    }
  }, [sceneModelDrafts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CODING_LAYOUT_MODE_STORAGE_KEY, codingLayoutMode);
    } catch {
      // ignore storage quota / private mode errors
    }
  }, [codingLayoutMode]);

  useEffect(() => {
    const serverCwd = String(codingWorkspace?.cwd || "").trim();
    if (!serverCwd) return;
    setCodingPatchCwdDraft((prev) => {
      const current = String(prev || "").trim();
      if (current && current === serverCwd) {
        return prev;
      }
      if (!current) {
        return serverCwd;
      }
      return prev;
    });
  }, [codingWorkspace?.cwd]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("aria_config_operator_name", configOperatorNameDraft.trim() || "运营负责人");
  }, [configOperatorNameDraft]);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    }
  };

  const jumpToOnboardingStep = (index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), onboardingFlow.length - 1);
    setOnboardingStep(safeIndex);
    openPanel(onboardingFlow[safeIndex].panel, onboardingFlow[safeIndex].scene);
  };

  const nextOnboardingStep = () => {
    const next = onboardingStep + 1;
    if (next >= onboardingFlow.length) {
      finishOnboarding();
      setMomentumToast("引导完成：现在你可以自由切换全部模块。");
      return;
    }
    jumpToOnboardingStep(next);
  };

  const handleSelectPersona = (persona: GirlfriendPersona) => {
    setSelectedPersona(persona);
    localStorage.setItem("aria_selected_persona", persona.id);
  };

  const handleSwitchPersona = () => {
    setSelectedPersona(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("aria_selected_persona");
    }
  };

  const cycleAppTheme = () => {
    setAppTheme(prev => {
      const next = prev === "cyber" ? "tribute" : prev === "tribute" ? "quiet" : "cyber";
      localStorage.setItem("aria_app_theme", next);
      return next;
    });
  };

  // ── Data loading and state management (same as Codex's version) ──
  const applyState = (nextState: DemoState) => {
    setUserId(nextState.userId);
    setMode(nextState.preferences.mode);
    setOnline(nextState.preferences.online);
    const sceneBucketSource = nextState.sceneMessages && typeof nextState.sceneMessages === "object"
      ? nextState.sceneMessages
      : null;
    if (sceneBucketSource) {
      const sceneOrder: SceneKey[] = ["work", "fun", "life", "love", "coding"];
      const seenMessageIds = new Set<string>();
      const normalizedMessages: DemoMessage[] = [];
      for (const sceneKey of sceneOrder) {
        const bucket = Array.isArray(sceneBucketSource[sceneKey]) ? sceneBucketSource[sceneKey] : [];
        for (const item of bucket) {
          const messageId = String(item?.id || "").trim();
          if (messageId && seenMessageIds.has(messageId)) {
            continue;
          }
          if (messageId) {
            seenMessageIds.add(messageId);
          }
          normalizedMessages.push({
            ...item,
            scene: normalizeMessageScene(item?.scene || sceneKey)
          });
        }
      }
      normalizedMessages.sort((left, right) => {
        const leftTs = Number(left.timestamp || 0);
        const rightTs = Number(right.timestamp || 0);
        if (leftTs !== rightTs) {
          return leftTs - rightTs;
        }
        return String(left.id || "").localeCompare(String(right.id || ""));
      });
      setMessages(normalizedMessages);
    } else {
      setMessages(
        (nextState.messages || []).map((item) => ({
          ...item,
          scene: normalizeMessageScene(item.scene)
        }))
      );
    }
    setMemoryHighlights(nextState.memoryHighlights);
    setEngagement(nextState.engagement);
    if (nextState.proactive) setProactiveState(nextState.proactive);
    if (nextState.autonomy) {
      setAutonomyState(nextState.autonomy);
      setAutonomyInbox(nextState.autonomy.inbox.filter((item) => item.status !== "acked"));
    }
    if (nextState.workday) {
      setWorkdayState(nextState.workday);
    }
    if (nextState.deviceOps) {
      setDeviceOpsState(nextState.deviceOps);
      setDeviceTasks(nextState.deviceOps.tasks.slice(0, 10));
    }
    if (nextState.workbench) {
      setWorkbenchState(nextState.workbench);
    }
    if (nextState.expansion) {
      setExpansionState(nextState.expansion);
    }
    if (nextState.sceneConfig) {
      setSceneConfigState(nextState.sceneConfig);
    }
    if (Array.isArray(nextState.funGames)) {
      setFunGames(nextState.funGames);
    }
    setUpdatedAt(nextState.updatedAt);
  };

  const searchMemory = async (queryInput = memoryQuery) => {
    setMemorySearching(true);
    setStreamError("");
    try {
      const data = await searchDemoMemory(queryInput, 8, {
        scene: activeScene,
        crossScene: true
      });
      setMemoryResults(data.items);
    } catch (searchError) {
      setStreamError(searchError instanceof Error ? searchError.message : "记忆检索失败");
    } finally {
      setMemorySearching(false);
    }
  };

  const requestProactiveNext = async () => {
    setProactiveLoading(true);
    setStreamError("");
    try {
      const data = await fetchNextProactive("desktop-chat");
      setProactiveResult(data);
      setProactiveState(data.proactive);
      if (data.updatedAt) setUpdatedAt(data.updatedAt);
    } catch (proactiveError) {
      setStreamError(proactiveError instanceof Error ? proactiveError.message : "主动建议获取失败");
    } finally {
      setProactiveLoading(false);
    }
  };

  const saveMemoryDraft = async () => {
    const content = memoryDraft.trim();
    if (!content) return;
    setSyncing(true);
    setStreamError("");
    try {
      const data = await createDemoMemory(content, {
        scene: activeScene,
        tier: activeScene === "love" || activeScene === "life" ? "long_term" : "short_term",
        source: "desktop_memory_panel",
        tags: ["manual", activeScene],
        importance: activeScene === "love" ? 0.8 : 0.72,
        confidence: 0.72
      });
      setMemoryDraft("");
      setMemoryHighlights(data.memoryHighlights);
      await searchMemory(memoryQuery);
      setUpdatedAt(new Date().toISOString());
    } catch (memoryError) {
      setStreamError(memoryError instanceof Error ? memoryError.message : "记忆写入失败");
    } finally {
      setSyncing(false);
    }
  };

  const syncAutonomy = async () => {
    setAutonomyLoading(true);
    try {
      const [statusResult, inboxResult, queueResult, flywheelResult] = await Promise.allSettled([
        fetchAutonomyStatus(),
        fetchAutonomyInbox(),
        fetchAutonomyQueue(),
        fetchAriaKernelFlywheelStatus({
          limit: 30
        })
      ]);
      let hasSuccess = false;
      if (statusResult.status === "fulfilled") {
        setAutonomyState(statusResult.value.autonomy);
        hasSuccess = true;
      }
      if (inboxResult.status === "fulfilled") {
        setAutonomyInbox(inboxResult.value.items);
        hasSuccess = true;
      }
      if (queueResult.status === "fulfilled") {
        const queue = queueResult.value.queue;
        setAutonomyState((prev) => (prev ? { ...prev, queue } : prev));
        hasSuccess = true;
      }
      if (flywheelResult.status === "fulfilled") {
        setFlywheelState(flywheelResult.value.flywheel);
        hasSuccess = true;
      }
      if (!hasSuccess) {
        throw new Error("自主引擎状态、收件箱、重试队列和 Flywheel 全部同步失败");
      }
      const failedCount = [statusResult, inboxResult, queueResult, flywheelResult]
        .filter((item) => item.status === "rejected").length;
      if (failedCount > 0) {
        setStreamError(`自主引擎部分同步失败（${failedCount} 项），其余模块可继续使用。`);
      }
    } catch (autonomyError) {
      setStreamError(autonomyError instanceof Error ? autonomyError.message : "自主引擎同步失败");
    } finally {
      await syncRuntimeGuardian({ silent: true });
      await syncUnifiedTimelineState({ silent: true, limit: 120 });
      setAutonomyLoading(false);
    }
  };

  const clearChatExecutionFollowupTimer = () => {
    if (chatExecutionFollowupTimerRef.current !== null) {
      window.clearTimeout(chatExecutionFollowupTimerRef.current);
      chatExecutionFollowupTimerRef.current = null;
    }
  };

  const stopChatExecutionFollowup = () => {
    clearChatExecutionFollowupTimer();
    chatExecutionFollowupTokenRef.current += 1;
    chatExecutionFollowupDeadlineAtRef.current = 0;
    chatExecutionFollowupDispatchIdRef.current = "";
    chatExecutionFollowupSceneRef.current = "";
  };

  const runChatExecutionFollowupPoll = async (token: number) => {
    if (token !== chatExecutionFollowupTokenRef.current) {
      return;
    }
    if (Date.now() >= chatExecutionFollowupDeadlineAtRef.current) {
      stopChatExecutionFollowup();
      return;
    }
    try {
      const statusResult = await fetchAutonomyStatus();
      if (token !== chatExecutionFollowupTokenRef.current) {
        return;
      }
      setAutonomyState(statusResult.autonomy);
      setAutonomyInbox(statusResult.autonomy.inbox.filter((item) => item.status !== "acked"));
      if (statusResult.updatedAt) {
        setUpdatedAt(statusResult.updatedAt);
      }
      const dispatchId = chatExecutionFollowupDispatchIdRef.current;
      const scene = chatExecutionFollowupSceneRef.current;
      const dispatchStatus = resolveDispatchStatusFromAutonomy(statusResult.autonomy, dispatchId);
      if (scene && dispatchStatus) {
        setAgiSceneExecutionSignals((prev) => ({
          ...prev,
          [scene]: {
            ...(prev[scene] || createDefaultAgiSceneExecutionSignal()),
            updatedAt: new Date().toISOString(),
            dispatchId: dispatchId || String(prev[scene]?.dispatchId || ""),
            dispatchStatus
          }
        }));
      }
      if (dispatchStatus && CHAT_EXECUTION_TERMINAL_STATUSES.has(dispatchStatus)) {
        if (dispatchStatus === "completed") {
          setMomentumToast("后台任务已完成，执行回执已同步。");
        } else if (dispatchStatus === "blocked") {
          setMomentumToast("后台任务出现阻塞，我已同步状态，补充条件后可继续。");
        } else {
          setMomentumToast(`后台任务状态：${dispatchStatus}，我已同步最新回执。`);
        }
        void syncUnifiedTimelineState({ silent: true, limit: 120 });
        stopChatExecutionFollowup();
        return;
      }
      if (dispatchStatus && !CHAT_EXECUTION_ACTIVE_STATUSES.has(dispatchStatus)) {
        stopChatExecutionFollowup();
        return;
      }
    } catch (pollError) {
      if (token !== chatExecutionFollowupTokenRef.current) {
        return;
      }
      if (Date.now() >= chatExecutionFollowupDeadlineAtRef.current) {
        setStreamError(pollError instanceof Error ? pollError.message : "后台执行状态跟进超时");
        stopChatExecutionFollowup();
        return;
      }
    }
    if (token !== chatExecutionFollowupTokenRef.current) {
      return;
    }
    clearChatExecutionFollowupTimer();
    chatExecutionFollowupTimerRef.current = window.setTimeout(() => {
      void runChatExecutionFollowupPoll(token);
    }, CHAT_EXECUTION_FOLLOWUP_INTERVAL_MS);
  };

  const startChatExecutionFollowup = (scene: SceneKey, autoExecution?: AutoExecutionInfo | null) => {
    if (!shouldStartChatExecutionFollowup(autoExecution)) {
      return;
    }
    const targetScene = scene || "love";
    const token = chatExecutionFollowupTokenRef.current + 1;
    chatExecutionFollowupTokenRef.current = token;
    chatExecutionFollowupDeadlineAtRef.current = Date.now() + CHAT_EXECUTION_FOLLOWUP_MAX_MS;
    chatExecutionFollowupDispatchIdRef.current = String(autoExecution?.dispatchId || "").trim();
    chatExecutionFollowupSceneRef.current = targetScene;
    clearChatExecutionFollowupTimer();
    setMomentumToast("任务已转到后台执行，我会持续同步进度。");
    void runChatExecutionFollowupPoll(token);
  };

  const syncRuntimeGuardian = async (options: { silent?: boolean } = {}) => {
    try {
      const data = await fetchRuntimeHealth();
      setRuntimeHealth(data);
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
    } catch (runtimeError) {
      if (options.silent) return;
      setStreamError(runtimeError instanceof Error ? runtimeError.message : "Runtime Guardian 同步失败");
    }
  };

  const runRuntimeGuardianHeal = async (action: "full_heal" | "queue_replay" | "schema_repair" = "full_heal") => {
    setRuntimeHealing(true);
    setStreamError("");
    try {
      const response = await triggerRuntimeGuardianHeal({
        force: true,
        queueLimit: runtimeWatchdog?.queueLimit || 6,
        action
      });
      setRuntimeHealth(response.runtimeHealth);
      if (response.updatedAt) {
        setUpdatedAt(response.updatedAt);
      }
      await syncAutonomy();
      const outcome = response.result;
      if (response.executed) {
        if (action === "queue_replay") {
          setMomentumToast(
            `重放完成：处理队列 ${outcome.queueProcessed} 项，成功 ${outcome.queueSucceeded}，当前积压 ${outcome.queue.pendingAfter}。`
          );
        } else if (action === "schema_repair") {
          setMomentumToast(
            `结构修复完成：触达 ${outcome.touchedUsers} 个用户，修复 ${outcome.changedUsers} 个用户。`
          );
        } else {
          setMomentumToast(
            `自愈完成：处理队列 ${outcome.queueProcessed} 项，修复 ${outcome.changedUsers} 个用户，当前积压 ${outcome.queue.pendingAfter}。`
          );
        }
      } else {
        setMomentumToast(`未执行自愈：${outcome.summary || outcome.skippedReason || "当前无需处理"}`);
      }
    } catch (runtimeError) {
      setStreamError(runtimeError instanceof Error ? runtimeError.message : "Runtime Guardian 自愈失败");
    } finally {
      setRuntimeHealing(false);
    }
  };

  const saveRuntimeGuardianConfig = async (
    patch: { enabled?: boolean; mode?: "eco" | "balanced" | "peak"; queueLimit?: number },
    successToast: string
  ) => {
    setRuntimeConfigSaving(true);
    setStreamError("");
    try {
      const response = await updateRuntimeGuardianConfig(patch);
      setRuntimeHealth(response.runtimeHealth);
      if (response.updatedAt) {
        setUpdatedAt(response.updatedAt);
      }
      setMomentumToast(successToast);
    } catch (runtimeError) {
      setStreamError(runtimeError instanceof Error ? runtimeError.message : "Runtime Guardian 配置更新失败");
    } finally {
      setRuntimeConfigSaving(false);
    }
  };

  const toggleRuntimeGuardianAuto = async () => {
    const enabled = runtimeWatchdog?.enabled !== false;
    await saveRuntimeGuardianConfig(
      { enabled: !enabled },
      !enabled ? "已开启 Runtime Guardian 自动巡检。" : "已暂停 Runtime Guardian 自动巡检。"
    );
  };

  const switchRuntimeGuardianMode = async (mode: "eco" | "balanced" | "peak") => {
    await saveRuntimeGuardianConfig(
      { mode },
      `Runtime Guardian 已切换到${mode === "peak" ? "高峰" : mode === "eco" ? "节能" : "平衡"}模式。`
    );
  };

  const rememberIncidentGuardrails = async (incidentId = "") => {
    setIncidentGuardrailSaving(true);
    setStreamError("");
    try {
      const response = await rememberAriaKernelIncidentGuardrail({
        incidentId: incidentId.trim() || undefined
      });
      if (Array.isArray(response.memoryHighlights) && response.memoryHighlights.length > 0) {
        setMemoryHighlights(response.memoryHighlights);
      }
      if (response.autonomy) {
        setAutonomyState(response.autonomy);
        setAutonomyInbox(response.autonomy.inbox.filter((item) => item.status !== "acked"));
      }
      if (response.updatedAt) {
        setUpdatedAt(response.updatedAt);
      }
      setMomentumToast(
        response.remembered > 0
          ? `已写入 ${response.remembered} 条故障防复发守则。`
          : "当前没有可写入的故障防复发守则。"
      );
      await syncRuntimeGuardian({ silent: true });
    } catch (incidentError) {
      setStreamError(incidentError instanceof Error ? incidentError.message : "故障防复发守则写入失败");
    } finally {
      setIncidentGuardrailSaving(false);
    }
  };

  const syncCapabilityAudit = async () => {
    try {
      const data = await fetchCapabilityAssessment();
      setCapabilityAssessment(data.assessment);
    } catch (capabilityError) {
      setStreamError(capabilityError instanceof Error ? capabilityError.message : "能力评估同步失败");
    }
  };

  const syncWorkday = async () => {
    setWorkdayLoading(true);
    setStreamError("");
    try {
      const snapshot = await fetchWorkdayState();
      setWorkdayState(snapshot.workday);
    } catch (workdayError) {
      setStreamError(workdayError instanceof Error ? workdayError.message : "工作台同步失败");
    } finally {
      setWorkdayLoading(false);
    }
  };

  const syncWorkbench = async () => {
    setWorkbenchLoading(true);
    setStreamError("");
    try {
      const data = await fetchWorkbenchState();
      setWorkbenchState(data.workbench);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (workbenchError) {
      setStreamError(workbenchError instanceof Error ? workbenchError.message : "工作场景同步失败");
    } finally {
      setWorkbenchLoading(false);
    }
  };

  const syncFunGames = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchFunGames(40);
      setFunGames(data.games || []);
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
    } catch (funError) {
      if (!options.silent) {
        setStreamError(funError instanceof Error ? funError.message : "小游戏列表同步失败");
      }
    }
  };

  const submitWorkbenchDraft = async () => {
    const text = workbenchDraft.trim();
    if (!text) return;
    setWorkbenchLoading(true);
    setStreamError("");
    try {
      const tags = text.includes("#") ? text.split(/\s+/).filter((token) => token.startsWith("#")) : [];
      const data = await submitWorkbenchIntent(text, tags);
      setWorkbenchState(data.workbench);
      setWorkdayState(data.workday);
      if (data.autonomy) {
        setAutonomyState(data.autonomy);
        setAutonomyInbox((data.autonomy.inbox || []).filter((item) => item.status !== "acked"));
      }
      if (data.deviceOps) {
        setDeviceOpsState(data.deviceOps);
        setDeviceTasks((data.deviceOps.tasks || []).slice(0, 10));
      }
      if (data.expansion) {
        setExpansionState(data.expansion);
      }
      setDraft(text);
      setWorkbenchDraft("");
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      await syncCapabilityAudit();
      if (data.dispatch?.steps?.length) {
        const successCount = data.dispatch.steps.filter((step) => step.status === "completed").length;
        const blockedCount = data.dispatch.steps.filter((step) => step.status === "blocked").length;
        setMomentumToast(`Aria 已自动调度 ${data.dispatch.steps.length} 步：成功 ${successCount}，阻塞 ${blockedCount}。`);
      } else {
        setMomentumToast("已进入聊天执行入口：点击发送即可开始。");
      }
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (workbenchError) {
      setStreamError(workbenchError instanceof Error ? workbenchError.message : "工作目标提交失败");
    } finally {
      setWorkbenchLoading(false);
    }
  };

  const sendWorkSceneMessage = async () => {
    const text = workbenchDraft.trim();
    if (!text) return;
    setWorkbenchDraft("");
    setDraft(text);
    await sendMessage(text);
  };

  const withdrawLatestTaskMessage = async (sceneInput?: SceneKey) => {
    if (sending || withdrawingLastMessage || streamStatus === "loading" || streamStatus === "streaming") {
      return;
    }
    const scene = normalizeMessageScene(sceneInput || activeScene);
    if (!canWithdrawSceneMap[scene]) {
      setMomentumToast("当前场景没有可撤回任务。");
      return;
    }
    setWithdrawingLastMessage(true);
    setStreamError("");
    try {
      const data = await withdrawLastMessage({
        scene,
        removeAssistantReply: true
      });
      if (!data.ok) {
        if (data.reason === "scene_user_message_not_found" || data.reason === "user_message_not_found" || data.reason === "message_empty") {
          setMomentumToast("当前场景没有可撤回任务。");
          return;
        }
        throw new Error(data.reason || "撤回失败");
      }
      applyState(data.state);
      setLastFailedDraft("");
      setStreamStatus("idle");
      const removedCount = Number(data.withdrawn?.removedCount || 0);
      if (removedCount > 0) {
        setMomentumToast(`已撤回最近任务（移除 ${removedCount} 条消息）。`);
      } else {
        setMomentumToast("最近任务已撤回。");
      }
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (withdrawError) {
      setStreamError(withdrawError instanceof Error ? withdrawError.message : "撤回失败");
    } finally {
      setWithdrawingLastMessage(false);
    }
  };

  const executeWorkbenchToolAction = async (toolId: string) => {
    if (!toolId) return;
    setWorkbenchLoading(true);
    setActiveWorkbenchToolId(toolId);
    setStreamError("");
    try {
      const data = await runWorkbenchTool(toolId, {
        source: "desktop-work-scene"
      });
      setWorkbenchState(data.workbench);
      setDeviceOpsState(data.deviceOps);
      setDeviceTasks(data.deviceOps.tasks.slice(0, 10));
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setMomentumToast(`${data.feedItem.title}：${data.feedItem.summary}`);
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (workbenchError) {
      setStreamError(workbenchError instanceof Error ? workbenchError.message : "工具动作执行失败");
    } finally {
      setActiveWorkbenchToolId("");
      setWorkbenchLoading(false);
    }
  };

  const syncExpansion = async () => {
    setExpansionLoading(true);
    setStreamError("");
    try {
      const data = await fetchExpansionState();
      setExpansionState(data.expansion);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (expansionError) {
      setStreamError(expansionError instanceof Error ? expansionError.message : "扩展能力同步失败");
    } finally {
      setExpansionLoading(false);
    }
  };

  const syncSystemConfig = async (options: { silent?: boolean } = {}) => {
    setSystemConfigLoading(true);
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchSystemConfig();
      setSystemConfigState(data);
    } catch (configError) {
      if (!options.silent) {
        setStreamError(configError instanceof Error ? configError.message : "系统策略同步失败");
      }
    } finally {
      setSystemConfigLoading(false);
    }
  };

  const syncVoiceProfile = async (options: { silent?: boolean } = {}) => {
    setVoiceProfileLoading(true);
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchVoiceProfile();
      if (!data.ok || !data.profile) {
        throw new Error(data.error || data.reason || "voice_profile_sync_failed");
      }
      const profile = data.profile;
      setVoiceProfileState(profile);
      const nextPresetId = String(profile.activePresetId || "").trim()
        || profile.presets.find((item) => item.voice === profile.defaultVoice)?.id
        || "gentle_female";
      setVoicePresetDraftId(nextPresetId);
    } catch (voiceProfileError) {
      if (!options.silent) {
        setStreamError(voiceProfileError instanceof Error ? voiceProfileError.message : "音色配置同步失败");
      }
    } finally {
      setVoiceProfileLoading(false);
    }
  };

  const applyVoicePreset = async (presetId: string) => {
    const nextPresetId = String(presetId || "").trim();
    if (!nextPresetId) {
      return;
    }
    setVoicePresetDraftId(nextPresetId);
    setVoicePresetSaving(true);
    setStreamError("");
    try {
      const data = await updateVoiceProfile({
        presetId: nextPresetId
      });
      if (!data.ok || !data.profile) {
        throw new Error(data.error || data.reason || "voice_profile_update_failed");
      }
      const profile = data.profile;
      setVoiceProfileState(profile);
      const resolvedPreset = profile.presets.find((item) => item.id === nextPresetId) || activeVoicePreset;
      setVoicePresetDraftId(profile.activePresetId || resolvedPreset?.id || nextPresetId);
      const label = resolvedPreset?.label || profile.defaultVoice;
      setVoiceStatus(`默认音色已切换：${label}`);
      setMomentumToast(
        `音色已切换为 ${label}（${profile.defaultVoice} · 语速 ${profile.defaultRate}）`
      );
    } catch (voicePresetError) {
      setStreamError(voicePresetError instanceof Error ? voicePresetError.message : "音色切换失败");
    } finally {
      setVoicePresetSaving(false);
    }
  };

  const pushCodingWorkspaceNotice = (textInput: string, tone: "success" | "info" | "error" = "info") => {
    const text = String(textInput || "").trim();
    if (!text) {
      return;
    }
    setCodingWorkspaceNotice({
      tone,
      text
    });
  };

  const copyCodingWorkspacePath = async () => {
    const target = String(codingWorkspaceCurrentPath || "").trim();
    if (!target) {
      pushCodingWorkspaceNotice("当前目录为空，无法复制。", "error");
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(target);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = target;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      pushCodingWorkspaceNotice(`路径已复制：${target}`, "success");
    } catch (copyError) {
      pushCodingWorkspaceNotice(copyError instanceof Error ? copyError.message : "复制路径失败。", "error");
    }
  };

  const applyCodingWorkspaceDraft = async (options: { openInFinder?: boolean; createIfMissing?: boolean; cwd?: string } = {}) => {
    const cwd = String(options.cwd || codingPatchCwdDraft || "").trim();
    if (!cwd) {
      setStreamError("请先输入要打开的项目目录。");
      return;
    }
    const openInFinder = options.openInFinder === true;
    if (openInFinder) {
      setCodingWorkspaceOpening(true);
    } else {
      setCodingWorkspaceSyncing(true);
    }
    setStreamError("");
    try {
      const data = await updateCodingWorkspace({
        cwd,
        openInFinder,
        createIfMissing: options.createIfMissing === true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "coding-workspace-panel"
      });
      if (data.workbench) {
        setWorkbenchState(data.workbench);
      }
      const nextCwd = String(data.workspace?.cwd || "").trim();
      if (nextCwd) {
        setCodingPatchCwdDraft(nextCwd);
        setCodingSelectedDirectoryPath(nextCwd);
        pushCodingWorkspaceNotice(`已进入项目目录：${nextCwd}`, "success");
      }
      await syncCodingProjectTree({
        silent: true,
        cwd: nextCwd || cwd
      });
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      const summary = String(data.openResult?.summary || data.workspace?.lastAction || "").trim();
      if (summary) {
        setMomentumToast(summary);
      }
      if (openInFinder && data.openResult && data.openResult.ok === false) {
        pushCodingWorkspaceNotice(data.openResult.summary || "目录打开失败", "error");
        setStreamError(data.openResult.summary || "目录打开失败");
      }
    } catch (workspaceError) {
      pushCodingWorkspaceNotice(workspaceError instanceof Error ? workspaceError.message : "编程工作目录更新失败", "error");
      setStreamError(workspaceError instanceof Error ? workspaceError.message : "编程工作目录更新失败");
    } finally {
      if (openInFinder) {
        setCodingWorkspaceOpening(false);
      } else {
        setCodingWorkspaceSyncing(false);
      }
    }
  };

  const selectCodingDirectoryPath = (pathInput: string) => {
    const path = String(pathInput || "").trim();
    if (!path) {
      return;
    }
    setCodingSelectedDirectoryPath(path);
    setCodingPatchCwdDraft(path);
  };

  const applySelectedCodingDirectory = async (options: { openInFinder?: boolean; createIfMissing?: boolean } = {}) => {
    const target = String(
      codingSelectedDirectoryPath
      || codingProjectTreeState?.rootCwd
      || codingPatchCwdDraft
      || codingWorkspace?.cwd
      || ""
    ).trim();
    if (!target) {
      setStreamError("请先在项目树里选择目录。");
      return;
    }
    setCodingSelectedDirectoryPath(target);
    setCodingPatchCwdDraft(target);
    await applyCodingWorkspaceDraft({
      cwd: target,
      openInFinder: options.openInFinder === true,
      createIfMissing: options.createIfMissing === true
    });
  };

  const pickCodingWorkspaceAndApply = async () => {
    setCodingWorkspacePicking(true);
    setStreamError("");
    try {
      const picked = await pickCodingWorkspaceDirectory({
        prompt: "请选择编程项目文件夹"
      });
      if (!picked.ok || !String(picked.path || "").trim()) {
        const fallbackPath = "~/Desktop";
        setCodingPatchCwdDraft(fallbackPath);
        setCodingSelectedDirectoryPath(fallbackPath);
        await applyCodingWorkspaceDraft({
          cwd: fallbackPath
        });
        const fallbackMessage = picked.message
          ? `${picked.message} 已切到桌面目录，请直接点选子文件夹。`
          : "系统文件夹弹窗不可用，已切到桌面目录，请直接点选子文件夹。";
        pushCodingWorkspaceNotice(fallbackMessage, "info");
        setStreamError(fallbackMessage);
        return;
      }
      const pickedPath = String(picked.path || "").trim();
      setCodingPatchCwdDraft(pickedPath);
      setCodingSelectedDirectoryPath(pickedPath);
      await applyCodingWorkspaceDraft({
        cwd: pickedPath
      });
    } catch (pickError) {
      pushCodingWorkspaceNotice(pickError instanceof Error ? pickError.message : "文件夹选择失败", "error");
      setStreamError(pickError instanceof Error ? pickError.message : "文件夹选择失败");
    } finally {
      setCodingWorkspacePicking(false);
    }
  };

  const resolveCodingParentDirectoryPath = (pathInput: string) => {
    const input = String(pathInput || "").trim();
    if (!input) {
      return "";
    }
    if (/^[A-Za-z]:[\\/]?$/.test(input)) {
      return input;
    }
    const separator = input.includes("\\") ? "\\" : "/";
    const normalized = input.replace(/[\\/]+$/g, "");
    if (!normalized) {
      return separator;
    }
    const lastSlash = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));
    if (lastSlash <= 0) {
      return separator === "\\" && normalized.length >= 2 ? normalized : separator;
    }
    return normalized.slice(0, lastSlash);
  };

  const resolveCodingChildDirectoryPath = (baseInput: string, childNameInput: string) => {
    const base = String(baseInput || "").trim().replace(/[\\/]+$/g, "");
    const child = String(childNameInput || "").trim().replace(/^[\\/]+/g, "");
    if (!base || !child) {
      return "";
    }
    if (base.includes("\\")) {
      return `${base}\\${child}`;
    }
    return `${base}/${child}`;
  };

  const toggleCodingDirectoryCollapsed = (directoryPathInput: string) => {
    const directoryPath = String(directoryPathInput || "").trim();
    if (!directoryPath) {
      return;
    }
    setCodingTreeCollapsedPaths((previous) => {
      const current = new Set(previous.map((item) => String(item || "").trim()).filter(Boolean));
      if (current.has(directoryPath)) {
        current.delete(directoryPath);
      } else {
        current.add(directoryPath);
      }
      return Array.from(current);
    });
  };

  const expandAllCodingDirectories = () => {
    setCodingTreeCollapsedPaths([]);
  };

  const collapseAllCodingDirectories = () => {
    const candidates = codingDirectoryPaths.filter((path) => {
      const normalized = String(path || "").trim();
      if (!normalized) return false;
      return (codingDirectoryChildrenMap.get(normalized) || 0) > 0;
    });
    setCodingTreeCollapsedPaths(candidates);
  };

  const openCodingFilePreview = async (
    filePathInput: string,
    options: {
      silent?: boolean;
      cwd?: string;
      maxChars?: number;
    } = {}
  ) => {
    const filePath = String(filePathInput || "").trim();
    if (!filePath) {
      return;
    }
    setCodingSelectedFilePath(filePath);
    setCodingFilePreviewLoading(true);
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchCodingFilePreview({
        path: filePath,
        cwd: options.cwd || codingWorkspace?.cwd || codingPatchCwdDraft.trim(),
        maxChars: options.maxChars
      });
      setCodingSelectedFilePath(data.file.path || filePath);
      setCodingFilePreviewState(data.file);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch (previewError) {
      setCodingFilePreviewState(null);
      if (!options.silent) {
        setStreamError(previewError instanceof Error ? previewError.message : "文件预览失败");
      }
    } finally {
      setCodingFilePreviewLoading(false);
    }
  };

  const syncCodingProjectTree = async (options: {
    silent?: boolean;
    cwd?: string;
  } = {}) => {
    setCodingTreeLoading(true);
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchCodingProjectTree({
        cwd: options.cwd || codingWorkspace?.cwd || codingPatchCwdDraft.trim(),
        maxDepth: 5,
        maxNodes: 520
      });
      setCodingProjectTreeState(data.tree);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      const directoryCandidates = new Set<string>([
        String(data.tree.rootCwd || "").trim(),
        ...(data.tree.nodes || [])
          .filter((node) => node.kind === "dir")
          .map((node) => String(node.path || "").trim())
          .filter(Boolean)
      ]);
      const previousSelectedDirectory = String(codingSelectedDirectoryPath || "").trim();
      const nextSelectedDirectory = (
        previousSelectedDirectory && directoryCandidates.has(previousSelectedDirectory)
          ? previousSelectedDirectory
          : String(data.tree.rootCwd || "").trim()
      );
      if (nextSelectedDirectory) {
        setCodingSelectedDirectoryPath(nextSelectedDirectory);
      } else {
        setCodingSelectedDirectoryPath("");
      }
      setCodingTreeCollapsedPaths((previous) =>
        previous.filter((path) => directoryCandidates.has(String(path || "").trim()))
      );
      setCodingPatchCwdDraft((prev) => {
        const current = String(prev || "").trim();
        if (current && directoryCandidates.has(current)) {
          return prev;
        }
        if (nextSelectedDirectory) {
          return nextSelectedDirectory;
        }
        return prev;
      });
      const nextFilePath = (() => {
        const selected = codingSelectedFilePath.trim();
        if (selected && (data.tree.nodes || []).some((node) => node.kind === "file" && node.path === selected)) {
          return selected;
        }
        const preferTextFile = (data.tree.nodes || []).find((node) =>
          node.kind === "file"
          && /\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|scss|html|py|sh|yaml|yml|txt|dart|swift|go|rs|toml)$/i.test(node.path)
        );
        if (preferTextFile?.path) {
          return preferTextFile.path;
        }
        const firstFile = (data.tree.nodes || []).find((node) => node.kind === "file");
        return firstFile?.path || "";
      })();
      if (nextFilePath) {
        await openCodingFilePreview(nextFilePath, {
          silent: true,
          cwd: data.tree.rootCwd
        });
      } else {
        setCodingSelectedFilePath("");
        setCodingFilePreviewState(null);
      }
    } catch (treeError) {
      if (!options.silent) {
        setStreamError(treeError instanceof Error ? treeError.message : "项目树同步失败");
      }
    } finally {
      setCodingTreeLoading(false);
    }
  };

  const parseCodingPatchVerifyCommands = () =>
    codingPatchVerifyDraft
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  useEffect(() => {
    if (activeScene !== "coding" || rightPanel !== "workday") {
      return;
    }
    void syncCodingProjectTree({
      silent: true
    });
  }, [activeScene, rightPanel, codingWorkspace?.cwd]);

  useEffect(() => {
    if (!codingWorkspaceNotice?.text) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setCodingWorkspaceNotice(null);
    }, 3600);
    return () => window.clearTimeout(timerId);
  }, [codingWorkspaceNotice?.text]);

  const syncCodingPatchGate = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchCodingPatchGate();
      setCodingPatchGateState(data.gate || null);
      if (data.gate?.drafts?.length) {
        setCodingPatchDraftState(data.gate.drafts[0]);
      }
      if (data.gate?.receipts?.length) {
        setCodingPatchLastReceipt(data.gate.receipts[0]);
      }
    } catch (gateError) {
      if (!options.silent) {
        setStreamError(gateError instanceof Error ? gateError.message : "补丁安全闸状态同步失败");
      }
    }
  };

  const runCodingPatchPreview = async (objectiveOverride?: string) => {
    const objective = String(objectiveOverride || codingPatchObjectiveDraft || "").trim();
    if (!objective) {
      setStreamError("请先输入本轮修复目标。");
      return;
    }
    if (objective !== codingPatchObjectiveDraft.trim()) {
      setCodingPatchObjectiveDraft(objective);
    }
    setCodingPatchPreviewing(true);
    setStreamError("");
    try {
      const data = await previewCodePatch({
        objective,
        cwd: codingPatchCwdDraft.trim(),
        verifyCommands: parseCodingPatchVerifyCommands(),
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "coding-safety-gate"
      });
      setCodingPatchGateState(data.gate || null);
      if (data.draft) {
        setCodingPatchDraftState(data.draft);
      }
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      const riskText = data.draft?.riskLevel ? `风险 ${data.draft.riskLevel.toUpperCase()}` : "风险评估完成";
      setMomentumToast(`补丁预演完成：${riskText}，请确认后再应用。`);
    } catch (previewError) {
      setStreamError(previewError instanceof Error ? previewError.message : "补丁预演失败");
    } finally {
      setCodingPatchPreviewing(false);
    }
  };

  const runCodingPatchApply = async () => {
    const draftId = String(activeCodingPatchDraft?.id || "").trim();
    if (!draftId) {
      setStreamError("请先执行“预演 diff”。");
      return;
    }
    setCodingPatchApplying(true);
    setStreamError("");
    try {
      const data = await applyCodePatchDraft({
        draftId,
        verifyCommands: parseCodingPatchVerifyCommands(),
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "coding-safety-gate"
      });
      setCodingPatchGateState(data.gate || null);
      if (data.draft) {
        setCodingPatchDraftState(data.draft);
      }
      if (data.receipt) {
        setCodingPatchLastReceipt(data.receipt);
      }
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setMomentumToast(data.receipt?.summary || "补丁应用完成。");
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (applyError) {
      setStreamError(applyError instanceof Error ? applyError.message : "补丁应用失败");
    } finally {
      setCodingPatchApplying(false);
    }
  };

  const runCodingPatchRollback = async () => {
    const receiptId = String(activeCodingPatchReceipt?.id || "").trim();
    setCodingPatchRollbacking(true);
    setStreamError("");
    try {
      const data = await rollbackCodePatch({
        receiptId: receiptId || undefined,
        verifyCommands: parseCodingPatchVerifyCommands(),
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "coding-safety-gate"
      });
      setCodingPatchGateState(data.gate || null);
      if (data.receipt) {
        setCodingPatchLastReceipt(data.receipt);
      }
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setMomentumToast(data.receipt?.rollback?.summary || "补丁已回滚。");
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (rollbackError) {
      setStreamError(rollbackError instanceof Error ? rollbackError.message : "补丁回滚失败");
    } finally {
      setCodingPatchRollbacking(false);
    }
  };

  const refreshLegacyCompatBridge = () => {
    setLegacyCompatBridgeState(getLegacyCompatBridgeConfig());
  };

  const applyLegacyCompatBridgeToggle = async (enabled: boolean) => {
    if (legacyCompatBridgeState.enabled === enabled) {
      setMomentumToast(enabled ? "旧字段兼容桥接已处于开启状态。" : "旧字段兼容桥接已处于关闭状态。");
      return;
    }
    setLegacyCompatApplying(true);
    setStreamError("");
    const previousEnabled = legacyCompatBridgeState.enabled;
    try {
      setLegacyCompatRollbackTarget(previousEnabled);
      setLegacyCompatBridgeEnabled(enabled);
      refreshLegacyCompatBridge();
      await syncSystemConfig({ silent: true });
      setMomentumToast(
        enabled
          ? "已开启旧字段兼容桥接（适合迁移过渡期）。"
          : "已关闭旧字段兼容桥接（进入纯 Aria Kernel 模式）。"
      );
    } catch (toggleError) {
      setLegacyCompatBridgeEnabled(previousEnabled);
      refreshLegacyCompatBridge();
      setStreamError(toggleError instanceof Error ? toggleError.message : "兼容桥接切换失败");
    } finally {
      setLegacyCompatApplying(false);
    }
  };

  const rollbackLegacyCompatBridgeToggle = async () => {
    if (legacyCompatRollbackTarget === null) {
      setMomentumToast("暂无可回滚的兼容桥接版本。");
      return;
    }
    setLegacyCompatApplying(true);
    setStreamError("");
    try {
      setLegacyCompatBridgeEnabled(legacyCompatRollbackTarget);
      refreshLegacyCompatBridge();
      await syncSystemConfig({ silent: true });
      setMomentumToast(`兼容桥接已回滚到上一个可用状态：${legacyCompatRollbackTarget ? "开启" : "关闭"}。`);
      setLegacyCompatRollbackTarget(null);
    } catch (rollbackError) {
      setStreamError(rollbackError instanceof Error ? rollbackError.message : "兼容桥接回滚失败");
    } finally {
      setLegacyCompatApplying(false);
    }
  };

  const syncSystemConfigHistory = async (options: { silent?: boolean } = {}) => {
    setSystemConfigHistoryLoading(true);
    if (!options.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchSystemConfigHistory(40);
      setSystemConfigHistoryState(data.history);
    } catch (historyError) {
      if (!options.silent) {
        setStreamError(historyError instanceof Error ? historyError.message : "策略变更记录同步失败");
      }
    } finally {
      setSystemConfigHistoryLoading(false);
    }
  };

  const rollbackConfigSnapshot = async (input?: { snapshotId?: string; mode?: "previous_stable" | "snapshot" }) => {
    setSystemConfigRollbacking(true);
    setStreamError("");
    try {
      const payload = {
        mode: input?.snapshotId ? "snapshot" : (input?.mode || "previous_stable"),
        snapshotId: input?.snapshotId,
        persist: true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        note: configChangeReasonDraft.trim() || "执行策略回滚"
      } as const;
      const data = await rollbackSystemConfig(payload);
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setMomentumToast(
        data.changed
          ? `已回滚配置：${(data.changedSections || []).join("、") || "策略恢复完成"}`
          : "当前已是目标快照，无需再次回滚。"
      );
      await syncCapabilityAudit();
    } catch (rollbackError) {
      setStreamError(rollbackError instanceof Error ? rollbackError.message : "配置回滚失败");
    } finally {
      setSystemConfigRollbacking(false);
    }
  };

  const buildTaskRoutesPayload = () => {
    const existingTaskRouteKeys = Object.keys(systemConfigState?.modelRoutingPolicy?.taskRoutes || {});
    const draftTaskRouteKeys = Object.keys(systemTaskRoutesDraft);
    const routeKeys = Array.from(new Set([...existingTaskRouteKeys, ...draftTaskRouteKeys]));
    const taskRoutesPayload = routeKeys.reduce<Record<string, string[]>>((acc, taskTypeRaw) => {
      const taskType = taskTypeRaw.trim();
      if (!taskType) return acc;
      acc[taskType] = parseProviderRouteDraft(systemTaskRoutesDraft[taskType] || "");
      return acc;
    }, {});
    if (autonomyDispatchRouteDraft.trim() || Object.prototype.hasOwnProperty.call(taskRoutesPayload, "autonomy_dispatch")) {
      taskRoutesPayload.autonomy_dispatch = parseProviderRouteDraft(autonomyDispatchRouteDraft || "");
    }
    return taskRoutesPayload;
  };

  const saveSystemConfigDraft = async () => {
    if (!systemConfigState) {
      await syncSystemConfig();
      return;
    }
    const taskRoutesPayload = buildTaskRoutesPayload();

    const fallbackSuperSkillRegistry = parseSuperSkillRegistryDraft(
      asObjectRecord(systemConfigState.superAutonomyProfile).skillRegistry
    );
    const superSkillRegistryPayload = (superSkillDraftEntries.length > 0 ? superSkillDraftEntries : fallbackSuperSkillRegistry)
      .map((item) => ({
        id: item.id,
        name: item.name,
        source: item.source,
        innovationLevel: item.innovationLevel,
        endpoints: Array.from(new Set(item.endpoints.map((endpoint) => String(endpoint || "").trim()).filter(Boolean))),
        required: item.required !== false
      }));

    setSystemConfigSaving(true);
    setStreamError("");
    try {
      const payload = {
        persist: true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        changeReason: configChangeReasonDraft.trim() || "调整系统运营策略",
        systemProfilePatch: {
          layers: {
            technology: {
              mcpBrowserRuntime: {
                enabled: mcpBrowserRuntimeEnabledDraft
              },
              voiceAndDeviceBridge: {
                voiceCall: {
                  enabled: voiceEnabledDraft
                },
                hardwareAccess: {
                  bluetooth: bluetoothEnabledDraft
                }
              }
            },
            model: {
              defaultRoute: systemDefaultRouteDraft,
              fallbackRoute: systemFallbackRouteDraft
            },
            application: {
              enabledScenes: systemEnabledScenesDraft,
              personaIntensity: {
                enabled: true,
                activeLevel: personaIntensityLevelDraft
              },
              goalContract: {
                autoClarifyThreshold: parseFloatDraft(goalClarifyThresholdDraft, 0.72, 0.4, 0.95)
              }
            }
          },
          learningEngine: {
            autonomousEvolution: {
              schedules: {
                authorityKnowledgeSyncCron: authorityLearningCronDraft.trim() || "0 */6 * * *",
                feedbackDigestCron: feedbackDigestCronDraft.trim() || "*/30 * * * *"
              }
            }
          },
          memoryFramework: {
            crossSceneAssociation: {
              recallTopK: parseNumberDraft(crossSceneRecallTopKDraft, 6, 1, 20)
            }
          },
          contextRecycleSystem: {
            rules: {
              importanceThreshold: parseFloatDraft(contextImportanceThresholdDraft, 0.72, 0.4, 0.95)
            }
          },
          skillAndExpansionBuiltin: {
            githubOfficialSkillDiscovery: {
              enabled: githubSkillDiscoveryEnabledDraft
            }
          },
          multiDeviceRuntime: {
            voice: {
              enabled: voiceEnabledDraft
            },
            hardwareBridge: {
              bluetooth: bluetoothEnabledDraft
            }
          }
        },
        modelRoutingPatch: {
          degradeStrategy: {
            timeoutMs: systemDegradeTimeoutDraft,
            maxRetries: systemDegradeRetryDraft
          },
          taskRoutes: taskRoutesPayload
        },
        superAutonomyPatch: {
          skillRegistry: superSkillRegistryPayload,
          stabilityPolicy: {
            queue: {
              retryBudgetPerTask: parseNumberDraft(superQueueRetryBudgetDraft, 3, 1, 10),
              backoffMs: parseNumberDraft(superQueueBackoffDraft, 1200, 100, 60000)
            },
            circuitBreaker: {
              failureThreshold: parseNumberDraft(superCircuitFailureDraft, 3, 1, 20),
              coolDownMs: parseNumberDraft(superCircuitCooldownDraft, 45000, 1000, 600000)
            }
          }
        },
        ariaKernelFusionPatch: {
          automationProtocol: {
            progress: {
              longTaskThresholdSec: parseNumberDraft(fusionLongTaskThresholdDraft, 8, 3, 120),
              intervalSec: parseNumberDraft(fusionProgressIntervalDraft, 30, 5, 300),
              blockReportSec: parseNumberDraft(fusionBlockReportDraft, 30, 5, 300)
            }
          }
        }
      };
      const data = await updateSystemConfig(payload);
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setMomentumToast(
        data.changed
          ? `脑系统策略已更新：${(data.changedSections || []).join("、") || "已保存"}`
          : "脑系统策略无变更，已保持当前配置。"
      );
    } catch (configError) {
      setStreamError(configError instanceof Error ? configError.message : "系统策略保存失败");
    } finally {
      setSystemConfigSaving(false);
    }
  };

  const applyPersonaIntensityQuickLevel = async (
    nextLevelInput: PersonaIntensityLevel,
    options: { silent?: boolean; reason?: string } = {}
  ) => {
    const nextLevel = parsePersonaIntensityLevel(nextLevelInput, "L2");
    if (nextLevel === personaIntensityLevelDraft) {
      if (!options.silent) {
        const currentLabel = PERSONA_INTENSITY_LEVEL_OPTIONS.find((item) => item.value === nextLevel)?.label || nextLevel;
        setMomentumToast(`当前已是 ${currentLabel}。`);
      }
      return true;
    }
    setPersonaQuickSwitching(true);
    setSystemConfigSaving(true);
    setStreamError("");
    try {
      const data = await updateSystemConfig({
        persist: true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        changeReason: options.reason || configChangeReasonDraft.trim() || `快捷切换人格强度到 ${nextLevel}`,
        systemProfilePatch: {
          layers: {
            application: {
              personaIntensity: {
                enabled: true,
                activeLevel: nextLevel
              }
            }
          }
        }
      });
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setPersonaIntensityLevelDraft(nextLevel);
      if (!options.silent) {
        const levelLabel = PERSONA_INTENSITY_LEVEL_OPTIONS.find((item) => item.value === nextLevel)?.label || nextLevel;
        setMomentumToast(`已切换人格强度：${levelLabel}。`);
      }
      return true;
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : "人格强度切换失败");
      return false;
    } finally {
      setSystemConfigSaving(false);
      setPersonaQuickSwitching(false);
    }
  };

  const saveModelRoutingQuick = async () => {
    if (!systemConfigState) {
      await syncSystemConfig();
      return;
    }
    const taskRoutesPayload = buildTaskRoutesPayload();
    setSystemConfigSaving(true);
    setStreamError("");
    try {
      const data = await updateSystemConfig({
        persist: true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        changeReason: configChangeReasonDraft.trim() || "调整任务级模型路由策略",
        systemProfilePatch: {
          layers: {
            model: {
              defaultRoute: systemDefaultRouteDraft,
              fallbackRoute: systemFallbackRouteDraft
            }
          }
        },
        modelRoutingPatch: {
          degradeStrategy: {
            timeoutMs: systemDegradeTimeoutDraft,
            maxRetries: systemDegradeRetryDraft
          },
          taskRoutes: taskRoutesPayload
        }
      });
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setMomentumToast(
        data.changed
          ? "模型策略已即时生效。"
          : "模型策略无变更，已保持当前配置。"
      );
    } catch (configError) {
      setStreamError(configError instanceof Error ? configError.message : "模型策略保存失败");
    } finally {
      setSystemConfigSaving(false);
    }
  };

  const applyVectorBackendPolicy = async (targetMode?: "local" | "qdrant") => {
    if (!systemConfigState) {
      await syncSystemConfig();
      return;
    }
    const nextMode = targetMode || vectorBackendModeDraft;
    const nextQdrantUrl = vectorQdrantUrlDraft.trim();
    const nextCollection = vectorQdrantCollectionDraft.trim() || "aria_memory";
    const nextTimeout = parseNumberDraft(vectorQdrantTimeoutDraft, 6000, 1000, 30000);
    if (nextMode === "qdrant" && !nextQdrantUrl) {
      setStreamError("启用 Qdrant 前请先填写 URL（例如 http://127.0.0.1:6333）。");
      return;
    }
    setVectorBackendApplying(true);
    setStreamError("");
    try {
      const data = await updateSystemConfig({
        persist: true,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        changeReason: configChangeReasonDraft.trim() || "调整记忆向量后端策略",
        systemProfilePatch: {
          layers: {
            foundation: {
              storage: {
                vectorRuntime: {
                  mode: nextMode,
                  qdrant: {
                    url: nextQdrantUrl,
                    collection: nextCollection,
                    timeoutMs: nextTimeout
                  }
                }
              }
            }
          }
        }
      });
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setVectorBackendModeDraft(nextMode);
      setMomentumToast(
        nextMode === "qdrant"
          ? "已切换到 Qdrant 外部向量库模式（实时生效）。"
          : "已回滚到 local-index 本地向量模式。"
      );
      await syncSystemConfig({ silent: true });
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : "记忆后端切换失败");
    } finally {
      setVectorBackendApplying(false);
    }
  };

  const runMemoryBackendSelfCheck = async () => {
    setMemoryBackendChecking(true);
    setStreamError("");
    try {
      const check = await fetchMemoryBackendSelfCheck();
      setMemoryBackendCheck(check);
      if (check.overallStatus === "healthy") {
        setMomentumToast("记忆后端自检通过。");
      } else {
        setMomentumToast("记忆后端存在风险，已生成小白修复建议。");
      }
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : "记忆后端自检失败");
    } finally {
      setMemoryBackendChecking(false);
    }
  };

  const applyMemoryBackendRecommendedFix = async () => {
    if (!memoryBackendCheck) {
      await runMemoryBackendSelfCheck();
      return;
    }
    if (memoryBackendCheck.overallStatus === "healthy") {
      setMomentumToast("当前记忆后端健康，无需自动修复。");
      return;
    }
    const suggestionIds = new Set((memoryBackendCheck.suggestions || []).map((item) => item.id));
    if (suggestionIds.has("rollback_local")) {
      await applyVectorBackendPolicy("local");
      setMomentumToast("已按建议自动回滚到 local-index。");
      return;
    }
    if (suggestionIds.has("set_qdrant_url")) {
      setVectorBackendModeDraft("qdrant");
      if (!vectorQdrantUrlDraft.trim()) {
        setVectorQdrantUrlDraft("http://127.0.0.1:6333");
      }
      setMomentumToast("已按建议填充 Qdrant 默认地址，请点“保存向量后端策略”。");
      return;
    }
    const dockerSuggestion = memoryBackendCheck.suggestions.find((item) => item.id === "start_qdrant_with_docker");
    if (dockerSuggestion) {
      setStreamError(`${dockerSuggestion.detail}。启动成功后点“连接自检”。`);
      return;
    }
    const fallbackSuggestion = memoryBackendCheck.suggestions[0];
    setMomentumToast(fallbackSuggestion ? fallbackSuggestion.title : "暂无自动修复建议。");
  };

  const reloadSystemConfigFromDisk = async () => {
    setSystemConfigSaving(true);
    setStreamError("");
    try {
      const data = await reloadSystemConfig();
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      setMomentumToast("系统配置已从磁盘重新加载。");
    } catch (configError) {
      setStreamError(configError instanceof Error ? configError.message : "系统配置重载失败");
    } finally {
      setSystemConfigSaving(false);
    }
  };

  const syncAriaKernelProvidersIntoSystemConfig = async (mode: "merge" | "replace" = "merge") => {
    setSystemConfigAriaKernelSyncing(true);
    setStreamError("");
    try {
      const data = await syncSystemConfigAriaKernel({
        persist: true,
        mode,
        includeLocal: false,
        operatorName: configOperatorNameDraft.trim() || "运营负责人",
        operatorSource: "brain-policy-console",
        note: configChangeReasonDraft.trim() || "同步 Aria Kernel 模型与密钥映射"
      });
      setSystemConfigState(data);
      setSystemConfigHistoryState(data.configOps || null);
      if (!data.ok) {
        setStreamError(data.message || data.reason || "Aria Kernel 同步失败");
        return;
      }
      const syncedCount = (data.syncedProviders || []).length;
      if (data.changed) {
        setMomentumToast(`已同步 Aria Kernel Provider ${syncedCount} 个，模型路由已更新。`);
      } else {
        setMomentumToast(`Aria Kernel Provider 已就绪（${syncedCount} 个），当前配置无需改动。`);
      }
      await syncCapabilityAudit();
    } catch (syncError) {
      setStreamError(syncError instanceof Error ? syncError.message : "Aria Kernel 模型同步失败");
    } finally {
      setSystemConfigAriaKernelSyncing(false);
    }
  };

  const syncUnifiedTimelineState = async (payload?: { flowId?: string; limit?: number; silent?: boolean }) => {
    setTimelineLoading(true);
    if (!payload?.silent) {
      setStreamError("");
    }
    try {
      const data = await fetchUnifiedTimeline({
        flowId: payload?.flowId,
        limit: payload?.limit ?? 120
      });
      setUnifiedTimelineState(data.timeline);
    } catch (timelineError) {
      if (!payload?.silent) {
        setStreamError(timelineError instanceof Error ? timelineError.message : "统一时间线同步失败");
      }
    } finally {
      setTimelineLoading(false);
    }
  };

  const replayTimelineFlow = async (flowId: string) => {
    if (!flowId) return;
    setTimelineLoading(true);
    setStreamError("");
    try {
      const data = await replayUnifiedTimeline(flowId, 300);
      setTimelineReplayState(data.replay);
      if (data.replay.diagnosis) {
        setTimelineDiagnosisState(data.replay.diagnosis);
      } else {
        const diagnose = await fetchTimelineDiagnosis(flowId, 300);
        setTimelineDiagnosisState(diagnose.diagnosis);
      }
      setMomentumToast(`已回放任务链 ${flowId}，共 ${data.replay.events.length} 个事件。`);
    } catch (timelineError) {
      setStreamError(timelineError instanceof Error ? timelineError.message : "任务链回放失败");
    } finally {
      setTimelineLoading(false);
    }
  };

  const repairTimelineFlow = async (flowId: string, mode: "auto" | "queue_replay" | "rerun_dispatch" = "auto") => {
    if (!flowId) return;
    setTimelineRepairingFlowId(flowId);
    setStreamError("");
    try {
      const data = await replayRepairTimelineFlow({
        flowId,
        mode,
        processQueue: true,
        queueLimit: 24
      });
      setTimelineDiagnosisState(data.diagnosis);
      await Promise.all([
        syncAutonomy(),
        syncUnifiedTimelineState({
          silent: true,
          limit: 120
        })
      ]);
      if (data.rerunDispatch?.flowId) {
        const replayData = await replayUnifiedTimeline(data.rerunDispatch.flowId, 300);
        setTimelineReplayState(replayData.replay);
      } else {
        const replayData = await replayUnifiedTimeline(data.flowId, 300);
        setTimelineReplayState(replayData.replay);
      }
      setMomentumToast(
        `修复已执行：重放 ${data.retriedDeadLetterCount} 项，队列处理 ${data.queueProcessResult.processed} 项。`
      );
    } catch (repairError) {
      setStreamError(repairError instanceof Error ? repairError.message : "一键重放修复失败");
    } finally {
      setTimelineRepairingFlowId("");
    }
  };

  /* ─── Coworking Seat Handlers ─── */
  const saveCoworkingSeats = (seats: CoworkingSeat[]) => {
    setCoworkingSeats(seats);
    localStorage.setItem(COWORKING_SEATS_KEY, JSON.stringify(seats));
  };

  const saveCoworkingProfile = (profile: MyCoworkingProfile) => {
    setMyCoworkingProfile(profile);
    localStorage.setItem(COWORKING_STORAGE_KEY, JSON.stringify(profile));
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const hasCheckedInToday = myCoworkingProfile?.totalCheckins
    ? (() => {
      const mySeat = coworkingSeats.find((s) => s.id === myCoworkingProfile.currentSeatId);
      return mySeat?.occupant?.lastCheckin === todayStr();
    })()
    : false;

  const registerCoworking = () => {
    if (!cwRegName.trim() || !cwRegTitle.trim()) return;
    const profile: MyCoworkingProfile = {
      name: cwRegName.trim(),
      title: cwRegTitle.trim(),
      direction: cwRegDirection.trim() || "探索中",
      role: cwRegRole.trim() || "自由职业",
      avatar: cwRegAvatar,
      totalCheckins: 1,
      currentSeatId: null,
      registeredAt: new Date().toISOString(),
      status: "online",
      friendIds: [],
      buddyIds: [],
      helpRequest: null,
    };
    // Find an empty seat (prefer back row for first-timers)
    const seats = [...coworkingSeats];
    const emptySeat = seats
      .sort((a, b) => b.row - a.row || a.col - b.col)
      .find((s) => !s.occupant);
    if (emptySeat) {
      emptySeat.occupant = {
        name: profile.name,
        title: profile.title,
        direction: profile.direction,
        role: profile.role,
        avatar: profile.avatar,
        checkinCount: 1,
        lastCheckin: todayStr(),
        status: profile.status,
        isFriend: false,
        isBuddy: false,
        helpRequest: profile.helpRequest,
      };
      profile.currentSeatId = emptySeat.id;
    }
    saveCoworkingProfile(profile);
    saveCoworkingSeats(seats);
    setShowCoworkingRegistration(false);
    setCoworkingView(true);
    setMomentumToast(`🎉 欢迎入驻！${profile.name}，你的工位是 ${emptySeat?.id || "待分配"}`);
  };

  const coworkingCheckin = () => {
    if (!myCoworkingProfile) return;
    const updated = { ...myCoworkingProfile, totalCheckins: myCoworkingProfile.totalCheckins + 1 };
    const seats = [...coworkingSeats];

    // Update occupant checkin data
    if (updated.currentSeatId) {
      const seat = seats.find((s) => s.id === updated.currentSeatId);
      if (seat?.occupant) {
        seat.occupant.checkinCount = updated.totalCheckins;
        seat.occupant.lastCheckin = todayStr();
      }
    }

    // Seat upgrade logic: promote to a better row if enough check-ins
    const targetRow = updated.totalCheckins >= 14 ? 1 : updated.totalCheckins >= 7 ? 2 : 3;
    const currentSeat = seats.find((s) => s.id === updated.currentSeatId);
    if (currentSeat && currentSeat.row > targetRow) {
      const betterSeat = seats.find((s) => s.row === targetRow && !s.occupant);
      if (betterSeat) {
        betterSeat.occupant = currentSeat.occupant;
        currentSeat.occupant = null;
        updated.currentSeatId = betterSeat.id;
        setMomentumToast(`🚀 打卡成功！累计 ${updated.totalCheckins} 天，已升级到前排 ${betterSeat.id}！`);
      } else {
        setMomentumToast(`✅ 打卡成功！累计 ${updated.totalCheckins} 天。前排暂满，继续加油！`);
      }
    } else {
      setMomentumToast(`✅ 打卡成功！累计 ${updated.totalCheckins} 天。`);
    }

    saveCoworkingProfile(updated);
    saveCoworkingSeats(seats);
  };

  const claimCoworkingSeat = (seatId: string) => {
    if (!myCoworkingProfile) return;
    const seats = [...coworkingSeats];
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat || targetSeat.occupant) return;

    // Leave old seat
    if (myCoworkingProfile.currentSeatId) {
      const oldSeat = seats.find((s) => s.id === myCoworkingProfile.currentSeatId);
      if (oldSeat) oldSeat.occupant = null;
    }

    targetSeat.occupant = {
      name: myCoworkingProfile.name,
      title: myCoworkingProfile.title,
      direction: myCoworkingProfile.direction,
      role: myCoworkingProfile.role,
      avatar: myCoworkingProfile.avatar,
      checkinCount: myCoworkingProfile.totalCheckins,
      lastCheckin: todayStr(),
      status: myCoworkingProfile.status,
      isFriend: false,
      isBuddy: false,
      helpRequest: myCoworkingProfile.helpRequest,
    };

    const updated = { ...myCoworkingProfile, currentSeatId: seatId };
    saveCoworkingProfile(updated);
    saveCoworkingSeats(seats);
    setMomentumToast(`🪑 已入座 ${seatId}！`);
  };

  const updateCwStatus = (status: OccupantStatus) => {
    if (!myCoworkingProfile) return;
    const updated = { ...myCoworkingProfile, status };
    if (updated.currentSeatId) {
      const seats = [...coworkingSeats];
      const seat = seats.find((s) => s.id === updated.currentSeatId);
      if (seat?.occupant) seat.occupant.status = status;
      saveCoworkingSeats(seats);
    }
    saveCoworkingProfile(updated);
    setShowCwStatusPicker(false);
    setMomentumToast(`状态已更新为：${occupantStatusMeta(status).label}`);
  };

  const publishCwHelp = () => {
    if (!myCoworkingProfile) return;
    const requestText = cwHelpDraft.trim() || null;
    const updated = { ...myCoworkingProfile, helpRequest: requestText };
    if (updated.currentSeatId) {
      const seats = [...coworkingSeats];
      const seat = seats.find((s) => s.id === updated.currentSeatId);
      if (seat?.occupant) seat.occupant.helpRequest = requestText;
      saveCoworkingSeats(seats);
    }
    saveCoworkingProfile(updated);
    setMomentumToast(requestText ? "📣 告示已发布！" : "告示已清除");
  };

  const interactWithCoworker = (seatId: string, action: "pat" | "add-friend" | "add-buddy" | "send-coffee") => {
    if (!myCoworkingProfile) return;
    const seats = [...coworkingSeats];
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat || !targetSeat.occupant) return;
    if (targetSeat.occupant.name === myCoworkingProfile.name) return;

    const occupantName = targetSeat.occupant.name;
    const updatedProfile = { ...myCoworkingProfile };

    if (action === "pat") {
      setMomentumToast(`👏 你拍了拍 ${occupantName} 的肩膀！`);
    } else if (action === "send-coffee") {
      setMomentumToast(`☕ 给 ${occupantName} 送了一杯冰美式！`);
    } else if (action === "add-friend") {
      if (!updatedProfile.friendIds.includes(occupantName)) {
        updatedProfile.friendIds = [...updatedProfile.friendIds, occupantName];
        targetSeat.occupant.isFriend = true;
        setMomentumToast(`🤝 已发送搭讪！你和 ${occupantName} 成为了同事。`);
      }
    } else if (action === "add-buddy") {
      if (!updatedProfile.buddyIds.includes(occupantName)) {
        updatedProfile.buddyIds = [...updatedProfile.buddyIds, occupantName];
        targetSeat.occupant.isBuddy = true;
        setMomentumToast(`🔥 硬核连接！你和 ${occupantName} 成为了破局搭子。`);
      }
    }

    saveCoworkingProfile(updatedProfile);
    saveCoworkingSeats(seats);
  };

  const installExpansionFromUrl = async () => {
    const url = expansionDraftUrl.trim();
    if (!url) return;
    setExpansionLoading(true);
    setStreamError("");
    try {
      const normalized = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9./_-]/gi, "-");
      const packId = `pack.remote.${normalized.slice(0, 36)}`;
      const data = await installExpansionPack({
        packId,
        name: `远程扩展 ${normalized.slice(0, 14)}`,
        source: "remote-manifest",
        capabilities: ["web.fetch", "file.download", "tool.route"]
      });
      setExpansionState(data.expansion);
      setExpansionDraftUrl("");
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      setMomentumToast(`扩展已安装：${data.pack.name}`);
    } catch (installError) {
      setStreamError(installError instanceof Error ? installError.message : "扩展安装失败");
    } finally {
      setExpansionLoading(false);
    }
  };

  const triggerAutonomyFetchDownload = async () => {
    const url = expansionDraftUrl.trim();
    if (!url) return;
    setExpansionLoading(true);
    setStreamError("");
    try {
      const data = await runAutonomyFetchDownload({
        targetUrl: url,
        saveAs: `downloads/${Date.now()}-autonomy.bin`,
        reason: "work-scene-autonomy"
      });
      setExpansionState(data.expansion);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      if (data.ok) {
        setMomentumToast(`自主下载完成：${data.job?.output?.savedPath || "已保存到下载目录"}`);
      } else {
        setMomentumToast(`自主下载失败：${data.reason}`);
      }
    } catch (downloadError) {
      setStreamError(downloadError instanceof Error ? downloadError.message : "自主获取下载失败");
    } finally {
      setExpansionLoading(false);
    }
  };

  const syncXhsPipeline = async (jobId = "") => {
    try {
      const data = await fetchXhsPipelineStatus(jobId);
      setXhsPipelineJob(data.job || null);
      setXhsPipelineJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setXhsPipelineNextStepHint(String(data.nextStepHint || "").trim() || "按步骤执行即可。");
      if (!xhsAssetsDirDraft.trim() && data.defaults?.assetsDir) {
        setXhsAssetsDirDraft(data.defaults.assetsDir);
      }
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "小红书流水线状态同步失败";
      setXhsPipelineError(message);
    }
  };

  const startXhsPipelineRun = async (overrideInput: { theme?: string; assetsDir?: string } = {}) => {
    const theme = String(overrideInput.theme ?? xhsThemeDraft).trim();
    const assetsDir = String(overrideInput.assetsDir ?? xhsAssetsDirDraft).trim();
    if (!theme) {
      setXhsPipelineError("请先填写主题。");
      return;
    }
    if (!assetsDir) {
      setXhsPipelineError("请先填写素材目录。");
      return;
    }
    setXhsPipelineBusy(true);
    setXhsPipelineError("");
    try {
      const data = await startXhsPipeline({
        theme,
        assetsDir,
        publish: xhsPublishEnabled,
        headless: xhsHeadlessEnabled,
        skipUpload: xhsSkipUploadEnabled,
        model: xhsModelDraft.trim() || "gpt-4.1-mini"
      });
      setXhsPipelineJob(data.job || null);
      if (data.job) {
        setXhsPipelineJobs((prev) => {
          const next = [data.job, ...prev.filter((item) => item.id !== data.job.id)];
          return next.slice(0, 20);
        });
      }
      setXhsPipelineNextStepHint(String(data.nextStepHint || "").trim() || "任务已启动，请等待执行。");
      setMomentumToast("小红书流水线已启动。");
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : "小红书流水线启动失败";
      setXhsPipelineError(message);
      setStreamError(message);
      if (/assets_dir_missing|素材目录不存在/i.test(message)) {
        setXhsPipelineNextStepHint(`素材目录不存在：${assetsDir}。请先创建目录并放入视频/图片，再点击“开始执行闭环”。`);
      } else if (/job_already_running|已有执行中的任务/i.test(message)) {
        setXhsPipelineNextStepHint("已有任务在执行中。下一步：点击“刷新状态”查看进度，或先取消后再启动。");
      }
    } finally {
      setXhsPipelineBusy(false);
    }
  };

  const cancelXhsPipelineRun = async () => {
    const jobId = String(xhsActiveJob?.id || "").trim();
    if (!jobId) {
      setXhsPipelineError("当前没有可取消的任务。");
      return;
    }
    setXhsPipelineBusy(true);
    setXhsPipelineError("");
    try {
      const data = await cancelXhsPipeline(jobId);
      setXhsPipelineJob(data.job || null);
      setXhsPipelineJobs((prev) => {
        if (!data.job) return prev;
        return [data.job, ...prev.filter((item) => item.id !== data.job.id)].slice(0, 20);
      });
      setXhsPipelineNextStepHint("任务已取消。下一步：修正参数后重新执行。");
      setMomentumToast("小红书流水线已取消。");
    } catch (cancelError) {
      const message = cancelError instanceof Error ? cancelError.message : "取消任务失败";
      setXhsPipelineError(message);
    } finally {
      setXhsPipelineBusy(false);
    }
  };

  const syncDeviceOps = async () => {
    setDeviceLoading(true);
    setStreamError("");
    try {
      const [capabilityState, taskState] = await Promise.all([
        fetchDeviceCapabilities(),
        fetchDeviceTasks("", 20)
      ]);
      setDeviceOpsState(capabilityState.deviceOps);
      setDeviceTasks(taskState.tasks);
    } catch (deviceError) {
      setStreamError(deviceError instanceof Error ? deviceError.message : "设备能力同步失败");
    } finally {
      setDeviceLoading(false);
    }
  };

  const triggerAutonomyTick = async () => {
    setAutonomyLoading(true);
    setStreamError("");
    try {
      await runAutonomyTick();
      await syncAutonomy();
      await syncCapabilityAudit();
    } catch (tickError) {
      setStreamError(tickError instanceof Error ? tickError.message : "自主执行失败");
    } finally {
      setAutonomyLoading(false);
    }
  };

  const triggerAutonomyRepair = async () => {
    setAutonomyLoading(true);
    setStreamError("");
    try {
      await manualAutonomyRepair();
      const state = await fetchDemoState();
      applyState(state);
      await syncAutonomy();
      await syncCapabilityAudit();
    } catch (repairError) {
      setStreamError(repairError instanceof Error ? repairError.message : "自修复失败");
    } finally {
      setAutonomyLoading(false);
    }
  };

  const triggerAutonomyQueueProcess = async () => {
    setAutonomyLoading(true);
    setStreamError("");
    try {
      const data = await processAutonomyQueueNow();
      setAutonomyState((prev) => (prev ? { ...prev, queue: data.queue } : prev));
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
      await syncAutonomy();
      if (data.result.processed === 0) {
        setMomentumToast("重试队列当前无可执行项。");
      } else {
        setMomentumToast(
          `队列处理完成：成功 ${data.result.succeeded}，继续重试 ${data.result.retried}，转死信 ${data.result.deadLettered}。`
        );
      }
    } catch (queueError) {
      setStreamError(queueError instanceof Error ? queueError.message : "重试队列处理失败");
    } finally {
      setAutonomyLoading(false);
    }
  };

  const triggerFlywheelReplay = async (taskTypeInput = "") => {
    setFlywheelReplaying(true);
    setStreamError("");
    try {
      const data = await replayAriaKernelFlywheel({
        taskType: String(taskTypeInput || "").trim() || undefined,
        limit: 40
      });
      setFlywheelState(data.flywheel);
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
      const replayTaskType = String(data.taskType || taskTypeInput || "").trim();
      const replayTaskLabel = replayTaskType ? taskRouteDisplayLabel(replayTaskType) : "全任务";
      setMomentumToast(`Flywheel 回放完成：${replayTaskLabel} · 重放 ${data.replayed} 条信号。`);
    } catch (replayError) {
      setStreamError(replayError instanceof Error ? replayError.message : "Flywheel 回放失败");
    } finally {
      setFlywheelReplaying(false);
    }
  };

  const triggerDeadLetterRetry = async (item: DemoAutonomyQueueItem) => {
    if (!item?.id) return;
    setAutonomyQueueBusyId(item.id);
    setStreamError("");
    try {
      const data = await retryAutonomyDeadLetterItem(item.id);
      setAutonomyState((prev) => (prev ? { ...prev, queue: data.queue } : prev));
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
      await syncAutonomy();
      setMomentumToast("死信任务已重新入队，可点击“处理重试队列”继续执行。");
    } catch (deadLetterError) {
      setStreamError(deadLetterError instanceof Error ? deadLetterError.message : "死信重试失败");
    } finally {
      setAutonomyQueueBusyId("");
    }
  };

  const applyQueuePolicyPatch = async (
    patch: {
      enabled?: boolean;
      autoProcessOnTick?: boolean;
      processLimit?: number;
      strategies?: Record<string, {
        enabled?: boolean;
        maxAttempts?: number;
        baseDelayMs?: number;
        circuitBreakerThreshold?: number;
      }>;
    },
    successToast: string
  ) => {
    setAutonomyLoading(true);
    setStreamError("");
    try {
      const data = await updateAutonomyQueuePolicy(patch);
      setAutonomyState((prev) => (prev ? { ...prev, queue: data.queue } : prev));
      if (data.updatedAt) {
        setUpdatedAt(data.updatedAt);
      }
      await syncAutonomy();
      setMomentumToast(successToast);
    } catch (policyError) {
      setStreamError(policyError instanceof Error ? policyError.message : "重试策略更新失败");
    } finally {
      setAutonomyLoading(false);
    }
  };

  const toggleQueueGlobalEnabled = async () => {
    const enabled = autonomyState?.queue?.policy?.enabled !== false;
    await applyQueuePolicyPatch(
      { enabled: !enabled },
      !enabled ? "已开启全局重试队列。" : "已关闭全局重试队列。"
    );
  };

  const toggleQueueAutoProcessOnTick = async () => {
    const autoProcessOnTick = autonomyState?.queue?.policy?.autoProcessOnTick !== false;
    await applyQueuePolicyPatch(
      { autoProcessOnTick: !autoProcessOnTick },
      !autoProcessOnTick ? "已开启自动 Tick 重试。" : "已关闭自动 Tick 重试。"
    );
  };

  const toggleQueueStrategyEnabled = async (operationType: string, nextEnabled: boolean) => {
    await applyQueuePolicyPatch(
      {
        strategies: {
          [operationType]: {
            enabled: nextEnabled
          }
        }
      },
      `${queueOperationLabel(operationType)}重试已${nextEnabled ? "开启" : "关闭"}。`
    );
  };

  const adjustQueueStrategyMaxAttempts = async (operationType: string, delta: number) => {
    const current = autonomyState?.queue?.policy?.strategies?.[operationType];
    if (!current) return;
    const next = Math.max(1, Math.min(10, (current.maxAttempts || 1) + delta));
    if (next === current.maxAttempts) return;
    await applyQueuePolicyPatch(
      {
        strategies: {
          [operationType]: {
            maxAttempts: next
          }
        }
      },
      `${queueOperationLabel(operationType)}最大重试次数已调整到 ${next}。`
    );
  };

  const adjustQueueStrategyCircuitThreshold = async (operationType: string, delta: number) => {
    const current = autonomyState?.queue?.policy?.strategies?.[operationType];
    if (!current) return;
    const next = Math.max(1, Math.min(20, (current.circuitBreakerThreshold || 1) + delta));
    if (next === current.circuitBreakerThreshold) return;
    await applyQueuePolicyPatch(
      {
        strategies: {
          [operationType]: {
            circuitBreakerThreshold: next
          }
        }
      },
      `${queueOperationLabel(operationType)}熔断阈值已调整到 ${next}。`
    );
  };

  const adjustQueueStrategyBackoff = async (operationType: string, deltaMs: number) => {
    const current = autonomyState?.queue?.policy?.strategies?.[operationType];
    if (!current) return;
    const next = Math.max(500, Math.min(300000, (current.baseDelayMs || 1000) + deltaMs));
    if (next === current.baseDelayMs) return;
    await applyQueuePolicyPatch(
      {
        strategies: {
          [operationType]: {
            baseDelayMs: next
          }
        }
      },
      `${queueOperationLabel(operationType)}退避基线已调整到 ${Math.round(next / 1000)} 秒。`
    );
  };

  const consumeAutonomyInboxItem = async (item: DemoAutonomyInboxItem) => {
    if (!item) return;
    setDraft(item.prefillText || item.message);
    openPanel("chat", activeScene);
    try {
      await ackAutonomyInboxItem(item.id);
      await syncAutonomy();
      await syncCapabilityAudit();
      setMomentumToast("自主建议已接收，已同步到对话输入区。");
    } catch (ackError) {
      setStreamError(ackError instanceof Error ? ackError.message : "自主建议确认失败");
    }
  };

  const submitWorkdayCheckin = async () => {
    setWorkdayLoading(true);
    setStreamError("");
    try {
      const data = await checkinWorkday({
        energy: checkinEnergy,
        pressure: checkinPressure,
        focusIntent: checkinIntent
      });
      setWorkdayState(data.workday);
      setUpdatedAt(new Date().toISOString());
      await syncWorkday();
      setMomentumToast("签到成功：今日任务节奏已刷新。");
    } catch (checkinError) {
      setStreamError(checkinError instanceof Error ? checkinError.message : "工作签到失败");
    } finally {
      setWorkdayLoading(false);
    }
  };

  const completeQuest = async (questId: string) => {
    const targetQuest = workdayState?.quests.find((quest) => quest.id === questId);
    setWorkdayLoading(true);
    setStreamError("");
    try {
      const data = await completeWorkdayQuest(questId);
      setWorkdayState(data.workday);
      if (data.engagement) {
        setEngagement(data.engagement);
      }
      setUpdatedAt(new Date().toISOString());
      await syncWorkday();
      setMomentumToast(`Quest 完成：${targetQuest?.title || "任务"} 已结算。`);
    } catch (questError) {
      setStreamError(questError instanceof Error ? questError.message : "任务结算失败");
    } finally {
      setWorkdayLoading(false);
    }
  };

  const applyCapabilityPermission = async (
    capabilityId: string,
    status: "granted" | "blocked" | "prompt"
  ) => {
    setDeviceLoading(true);
    setStreamError("");
    try {
      const data = await updateDevicePermission(capabilityId, status, "desktop-panel");
      setDeviceOpsState(data.deviceOps);
      setUpdatedAt(new Date().toISOString());
      await syncDeviceOps();
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (permissionError) {
      setStreamError(permissionError instanceof Error ? permissionError.message : "权限更新失败");
    } finally {
      setDeviceLoading(false);
    }
  };

  const grantL3FullTakeoverPermissions = async () => {
    setL3TakeoverApplying(true);
    setDeviceLoading(true);
    setStreamError("");
    try {
      if (personaIntensityLevelDraft !== "L3") {
        const switched = await applyPersonaIntensityQuickLevel("L3", {
          silent: true,
          reason: "L3 全权限接管前置切换"
        });
        if (!switched) {
          setMomentumToast("L3 档位切换失败，已停止全权限授权。");
          return;
        }
      }

      let capabilities = Array.isArray(deviceOpsState?.capabilities) ? deviceOpsState.capabilities : [];
      if (capabilities.length === 0) {
        const capabilityState = await fetchDeviceCapabilities();
        setDeviceOpsState(capabilityState.deviceOps);
        capabilities = Array.isArray(capabilityState.deviceOps?.capabilities) ? capabilityState.deviceOps.capabilities : [];
      }
      if (capabilities.length === 0) {
        setMomentumToast("未检测到可授权能力项，请先刷新设备能力。");
        return;
      }

      const resultList = await Promise.allSettled(
        capabilities.map((capability) => updateDevicePermission(capability.id, "granted", "l3_full_takeover"))
      );
      const successCount = resultList.filter((result) => result.status === "fulfilled" && result.value.ok).length;
      const failedCount = capabilities.length - successCount;

      await syncDeviceOps();
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
      setMomentumToast(
        failedCount > 0
          ? `L3 全权限已执行：成功 ${successCount} 项，失败 ${failedCount} 项。`
          : `L3 全权限已放开：${successCount} 项能力全部授权。`
      );
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : "L3 全权限授权失败");
    } finally {
      setDeviceLoading(false);
      setL3TakeoverApplying(false);
    }
  };

  const quickPlanAndRunDeviceTask = async (taskType: Parameters<typeof planDeviceTask>[0]) => {
    setDeviceLoading(true);
    setStreamError("");
    try {
      const planned = await planDeviceTask(taskType, {
        source: "desktop-device-panel"
      });
      if (planned.task) {
        await executeDeviceTask(planned.task.id);
      }
      await syncDeviceOps();
      setMomentumToast(`设备执行完成：${planned.task?.title || "任务"} 已提交。`);
      void syncUnifiedTimelineState({ silent: true, limit: 120 });
    } catch (taskError) {
      setStreamError(taskError instanceof Error ? taskError.message : "设备任务执行失败");
    } finally {
      setDeviceLoading(false);
    }
  };

  const refreshHardware = async () => {
    setDeviceLoading(true);
    setStreamError("");
    try {
      const data = await fetchHardwareStatus();
      setHardwareStatus(data);
      setUpdatedAt(new Date().toISOString());
      await syncDeviceOps();
    } catch (hardwareError) {
      setStreamError(hardwareError instanceof Error ? hardwareError.message : "硬件状态获取失败");
    } finally {
      setDeviceLoading(false);
    }
  };

  const speakDailyBriefing = async () => {
    setDeviceLoading(true);
    setStreamError("");
    const summary = workdayState?.lastSummary || "今天先完成最关键的三件事，我会持续陪你推进。";
    try {
      const data = await runVoiceTts(summary, {
        dryRun: false
      });
      setVoiceStatus(data.result?.summary || (data.ok ? "语音播报完成" : "语音播报失败"));
      await syncDeviceOps();
      setMomentumToast("语音播报已触发，请查看执行回执。");
    } catch (voiceError) {
      setStreamError(voiceError instanceof Error ? voiceError.message : "语音播报失败");
    } finally {
      setDeviceLoading(false);
    }
  };

  const loadState = async () => {
    setLoading(true);
    setError("");
    try {
      const state = await fetchDemoState();
      applyState(state);
      const results = await Promise.allSettled([
        searchMemory(memoryQuery),
        syncAutonomy(),
        syncRuntimeGuardian({ silent: true }),
        syncSystemConfig({ silent: true }),
        syncCodingPatchGate({ silent: true }),
        syncUnifiedTimelineState({ silent: true, limit: 120 }),
        syncCapabilityAudit(),
        syncWorkday(),
        syncWorkbench(),
        syncExpansion(),
        syncDeviceOps()
      ]);
      const failedCount = results.filter((item) => item.status === "rejected").length;
      if (failedCount > 0) {
        setStreamError(`部分模块同步失败（${failedCount} 项），核心功能仍可使用。`);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败，请确认 Mock API 已启动。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPersona) return;
    let isMounted = true;
    const init = async () => {
      await loadState();
      try {
        await reportEngagementEvent("app_open", { scene: "desktop" });
        const snapshot = await fetchEngagementState();
        if (isMounted) {
          setEngagement(snapshot.engagement);
          if (snapshot.proactive) setProactiveState(snapshot.proactive);
          if (snapshot.autonomy) {
            setAutonomyState(snapshot.autonomy);
            setAutonomyInbox(snapshot.autonomy.inbox.filter((item) => item.status !== "acked"));
          }
          if (snapshot.workday) {
            setWorkdayState(snapshot.workday);
          }
          if (snapshot.deviceOps) {
            setDeviceOpsState(snapshot.deviceOps);
            setDeviceTasks(snapshot.deviceOps.tasks.slice(0, 10));
          }
        }
      } catch { /* ignore */ }
    };
    void init();
    return () => { isMounted = false; };
  }, [selectedPersona]);

  const updatePreferences = async (next: Partial<{ mode: CompanionMode; online: boolean }>) => {
    setSyncing(true);
    setError("");
    try {
      const data = await updateDemoPreferences(next);
      setMode(data.preferences.mode);
      setOnline(data.preferences.online);
      setUpdatedAt(data.updatedAt);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "同步偏好失败");
      await loadState();
    } finally {
      setSyncing(false);
    }
  };

  /* ── Image upload helpers ── */
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_IMAGE_COUNT = 4;

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // reset so same file can be re-selected
    if (files.length === 0) return;

    const remaining = MAX_IMAGE_COUNT - pendingImages.length;
    if (remaining <= 0) {
      setMomentumToast(`最多同时附加 ${MAX_IMAGE_COUNT} 张图片。`);
      return;
    }
    const batch = files.slice(0, remaining);
    let oversizedCount = 0;

    for (const file of batch) {
      if (file.size > MAX_IMAGE_SIZE) {
        oversizedCount += 1;
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPendingImages((prev) => {
          if (prev.length >= MAX_IMAGE_COUNT) return prev;
          return [...prev, { name: file.name, dataUrl }];
        });
      };
      reader.readAsDataURL(file);
    }
    if (oversizedCount > 0) {
      setMomentumToast(`${oversizedCount} 张图片超过 5MB 限制，已跳过。`);
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const MAX_WORK_FILE_BYTES = 2 * 1024 * 1024;
  const WORK_FILE_PREVIEW_LIMIT = 4;

  const handleWorkbenchFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }
    const picked = files.slice(0, WORK_FILE_PREVIEW_LIMIT);
    const attachmentLines: string[] = [];
    let oversizedCount = 0;

    for (const file of picked) {
      if (file.size > MAX_WORK_FILE_BYTES) {
        oversizedCount += 1;
        continue;
      }
      let preview = "";
      const canReadText = file.type.startsWith("text/")
        || /\.(md|txt|json|csv|yaml|yml|ts|tsx|js|jsx|py|java|go|rs|sql)$/i.test(file.name);
      if (canReadText) {
        try {
          const content = await file.text();
          const compact = content.replace(/\s+/g, " ").trim();
          if (compact) {
            preview = compact.slice(0, 120);
            if (compact.length > 120) {
              preview = `${preview}...`;
            }
          }
        } catch {
          preview = "";
        }
      }
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      attachmentLines.push(
        preview
          ? `- ${file.name} (${sizeKb}KB)：${preview}`
          : `- ${file.name} (${sizeKb}KB)`
      );
    }

    if (attachmentLines.length > 0) {
      const block = `[工作附件]\n${attachmentLines.join("\n")}\n请结合附件内容给出执行计划，并直接开始执行。`;
      setWorkbenchDraft((prev) => {
        const existing = prev.trim();
        return existing ? `${existing}\n${block}` : block;
      });
      setMomentumToast(`已附加 ${attachmentLines.length} 个文件到工作输入框。`);
    }
    if (oversizedCount > 0) {
      setMomentumToast(`${oversizedCount} 个文件超过 2MB 限制，已跳过。`);
    }
  };

  const getMessageBubbleClassName = (item: DemoMessage) => {
    const roleClass = item.role === "aria" ? "aria" : "user";
    if (item.role !== "aria") {
      return `message-bubble ${roleClass}`;
    }
    const text = String(item.text || "").trim();
    if (!text && (streamStatus === "loading" || streamStatus === "streaming")) {
      return `message-bubble ${roleClass} is-streaming`;
    }
    if (text.startsWith("⚠️")) {
      return `message-bubble ${roleClass} is-error`;
    }
    return `message-bubble ${roleClass}`;
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const tokenRegex = /\[(img:[^\]]+|aria_file:[^\]]+|aria_image:[^\]]+|aria_game:[^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    const decodeInlinePayload = (valueInput: string) => {
      const value = String(valueInput || "").trim();
      if (!value) {
        return "";
      }
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };
    const normalizeRuntimeAssetUrl = (urlInput: string) => {
      const raw = String(urlInput || "").trim();
      if (!raw || typeof window === "undefined") {
        return raw;
      }
      try {
        const parsed = new URL(raw, window.location.origin);
        const host = parsed.hostname.toLowerCase();
        const currentHost = String(window.location.hostname || "").trim().toLowerCase();
        const localHosts = new Set(["127.0.0.1", "localhost", "0.0.0.0", currentHost]);
        if (
          window.location.protocol === "https:"
          && parsed.protocol === "http:"
          && localHosts.has(host)
        ) {
          return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        if (!parsed.protocol.startsWith("http")) {
          return raw;
        }
        return parsed.toString();
      } catch {
        return raw;
      }
    };
    const parseInlineFilePayload = (encodedInput: string) => {
      const decoded = decodeInlinePayload(encodedInput);
      if (!decoded) {
        return null;
      }
      try {
        const payload = JSON.parse(decoded) as {
          title?: string;
          name?: string;
          path?: string;
          mime?: string;
          size?: number;
          url?: string;
        };
        const url = normalizeRuntimeAssetUrl(String(payload.url || "").trim());
        if (!url) {
          return null;
        }
        return {
          title: String(payload.title || payload.name || "文件").trim() || "文件",
          name: String(payload.name || payload.title || "文件").trim() || "文件",
          path: String(payload.path || "").trim(),
          mime: String(payload.mime || "").trim(),
          size: Number(payload.size || 0),
          url
        };
      } catch {
        return null;
      }
    };
    const canEmbedGameUrl = (urlInput: string) => {
      const url = String(urlInput || "").trim();
      if (!url || typeof window === "undefined") {
        return false;
      }
      try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.toLowerCase();
        const currentHost = String(window.location.hostname || "").trim().toLowerCase();
        const localHosts = new Set(["127.0.0.1", "localhost", currentHost]);
        return localHosts.has(host) && /\/fun\/games\/[a-z0-9_-]+\/play$/i.test(parsed.pathname);
      } catch {
        return false;
      }
    };
    const pushTextWithLinks = (content: string, prefix: string) => {
      if (!content) return;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let textLastIndex = 0;
      let urlMatch: RegExpExecArray | null;
      let localKey = 0;
      while ((urlMatch = urlRegex.exec(content)) !== null) {
        if (urlMatch.index > textLastIndex) {
          parts.push(
            <span key={`${prefix}-txt-${localKey}`}>
              {content.slice(textLastIndex, urlMatch.index)}
            </span>
          );
          localKey += 1;
        }
        const href = urlMatch[1];
        const normalizedHref = normalizeRuntimeAssetUrl(href);
        parts.push(
          <a
            key={`${prefix}-link-${localKey}`}
            href={normalizedHref || href}
            target="_blank"
            rel="noreferrer"
            className="message-inline-link"
          >
            {normalizedHref || href}
          </a>
        );
        localKey += 1;
        textLastIndex = urlMatch.index + href.length;
      }
      if (textLastIndex < content.length) {
        parts.push(
          <span key={`${prefix}-txt-${localKey}`}>
            {content.slice(textLastIndex)}
          </span>
        );
      }
    };
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIndex = 0;
    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        pushTextWithLinks(text.slice(lastIndex, match.index), `t-${keyIndex}`);
        keyIndex += 1;
      }
      const token = String(match[1] || "").trim();
      if (token.startsWith("img:")) {
        const dataUrl = token.slice(4).trim();
        if (dataUrl.startsWith("data:image/")) {
          parts.push(
            <img
              key={`img-${keyIndex}`}
              src={dataUrl}
              alt="用户图片"
              className="message-inline-img"
            />
          );
          keyIndex += 1;
        }
      } else if (token.startsWith("aria_image:")) {
        const imageUrl = normalizeRuntimeAssetUrl(decodeInlinePayload(token.slice("aria_image:".length)));
        if (imageUrl) {
          parts.push(
            <a key={`aria-img-link-${keyIndex}`} href={imageUrl} target="_blank" rel="noreferrer">
              <img
                src={imageUrl}
                alt="Aria 发送的图片"
                className="message-inline-img message-inline-attachment-img"
                loading="lazy"
              />
            </a>
          );
          keyIndex += 1;
        }
      } else if (token.startsWith("aria_file:")) {
        const filePayload = parseInlineFilePayload(token.slice("aria_file:".length));
        if (filePayload) {
          const metaParts: string[] = [];
          if (filePayload.size > 0) {
            metaParts.push(formatFileSize(filePayload.size));
          }
          if (filePayload.mime) {
            metaParts.push(filePayload.mime);
          }
          if (filePayload.path) {
            metaParts.push(filePayload.path);
          }
          parts.push(
            <div key={`aria-file-${keyIndex}`} className="message-file-card">
              <div className="message-file-main">
                <strong>{filePayload.title}</strong>
                {metaParts.length > 0 ? <small>{metaParts.join(" · ")}</small> : null}
              </div>
              <div className="message-file-actions">
                <a href={filePayload.url} target="_blank" rel="noreferrer" download={filePayload.name || filePayload.title}>
                  打开/下载
                </a>
              </div>
            </div>
          );
          keyIndex += 1;
        }
      } else if (token.startsWith("aria_game:")) {
        const gameUrl = normalizeRuntimeAssetUrl(decodeInlinePayload(token.slice("aria_game:".length)));
        if (gameUrl) {
          parts.push(
            <div key={`aria-game-${keyIndex}`} className="message-game-card">
              <div className="message-game-head">
                <strong>🎮 小游戏已就绪</strong>
                <a href={gameUrl} target="_blank" rel="noreferrer">全屏打开</a>
              </div>
              {canEmbedGameUrl(gameUrl) ? (
                <iframe
                  src={gameUrl}
                  className="message-game-iframe"
                  title={`aria-game-${keyIndex}`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <p className="message-game-fallback">当前链接暂不支持内嵌，点击“全屏打开”运行。</p>
              )}
            </div>
          );
          keyIndex += 1;
        }
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      pushTextWithLinks(text.slice(lastIndex), `t-${keyIndex}`);
    }
    return parts.length > 0 ? parts : text;
  };

  const sendMessage = async (
    retryText?: string,
    options?: {
      images?: PendingImageDraft[];
      scene?: SceneKey;
      panel?: PanelKey;
      fromQueue?: boolean;
      forcedProviderId?: string;
      fromAutoHeal?: boolean;
    }
  ) => {
    const sceneForSend = options?.scene || activeScene;
    const panelForSend = options?.panel || rightPanel;
    const rawText = (retryText || draft).trim();
    const images = clonePendingImages(options?.images || pendingImages);
    if (!rawText && images.length === 0) return;
    if (isVoiceSessionLive()) {
      resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
    }

    if (sending) {
      enqueueOutgoingMessage({
        text: rawText,
        images,
        scene: sceneForSend,
        panel: panelForSend
      });
      if (!retryText && !options?.fromQueue) {
        setDraft("");
        setPendingImages([]);
      }
      setMomentumToast(`已加入发送队列（前方 ${Math.max(0, outgoingQueueRef.current.length - 1)} 条）`);
      return;
    }

    const xhsQuickIntent = XHS_IN_ARIA_ENABLED && !options?.fromQueue && sceneForSend === "work"
      ? parseXhsQuickIntentFromText(rawText)
      : null;
    const xhsHasJob = Boolean(xhsActiveJob && String(xhsActiveJob.id || "").trim());
    const xhsRetryIntent = XHS_IN_ARIA_ENABLED
      && !options?.fromQueue
      && sceneForSend === "work"
      && xhsHasJob
      && /^(重试|再试|重新执行|再来一次|重新跑)/.test(rawText);
    const xhsProgressIntent = XHS_IN_ARIA_ENABLED
      && !options?.fromQueue
      && sceneForSend === "work"
      && xhsHasJob
      && /(啥进度|进度|状态|继续执行|查看进度|拉取进度)/.test(rawText);
    if (xhsRetryIntent || xhsProgressIntent) {
      const now = Date.now();
      const jobId = String(xhsActiveJob?.id || "").trim();
      const currentStatus = String(xhsActiveJob?.status || "unknown");
      const currentReason = String(xhsActiveJob?.reason || "n/a");
      let assistantReply = "";
      openPanel("workday", "work");
      setXhsPipelineError("");
      if (xhsProgressIntent) {
        if (jobId) {
          void syncXhsPipeline(jobId);
        }
        assistantReply = `小红书闭环当前状态：${currentStatus}（${currentReason}）。我已刷新状态，你看左侧卡片的最新日志。`;
      } else if (xhsJobIsRunning) {
        if (jobId) {
          void syncXhsPipeline(jobId);
        }
        assistantReply = `任务还在执行中（${currentStatus}）。我已刷新进度，左侧会持续更新日志。`;
      } else {
        const retryTheme = String(xhsThemeDraft || xhsActiveJob?.input?.theme || "").trim();
        const retryAssetsDir = String(xhsAssetsDirDraft || xhsActiveJob?.input?.assetsDir || "").trim();
        if (!retryTheme) {
          setXhsPipelineError("重试前还缺主题。");
          assistantReply = "重试前还缺主题。你回复“主题：xxx”，我立即重跑。";
        } else {
          setXhsPipelineNextStepHint(`收到重试指令：主题「${retryTheme}」。正在重启闭环执行。`);
          assistantReply = `收到重试，正在重跑小红书闭环：主题「${retryTheme}」。`;
          void startXhsPipelineRun({
            theme: retryTheme,
            assetsDir: retryAssetsDir
          });
        }
      }
      if (!retryText) {
        setDraft("");
      }
      setPendingImages([]);
      setStreamStatus("idle");
      setLastFailedDraft("");
      setStreamError("");
      setMessages((prev) => [
        ...prev,
        { id: `user-local-${now}`, role: "user", text: rawText, time: nowTime(), timestamp: now, scene: sceneForSend },
        { id: `aria-local-${now}`, role: "aria", text: assistantReply, time: nowTime(), timestamp: now + 1, scene: sceneForSend }
      ]);
      setMomentumToast("已接管小红书闭环控制。");
      return;
    }
    if (xhsQuickIntent) {
      const now = Date.now();
      const resolvedTheme = String(xhsQuickIntent.theme || xhsThemeDraft || "").trim();
      let assistantReply = "";
      if (xhsQuickIntent.theme) {
        setXhsThemeDraft(xhsQuickIntent.theme);
      }
      setXhsPipelineError("");
      openPanel("workday", "work");
      if (xhsQuickIntent.runNow) {
        if (!resolvedTheme) {
          setXhsPipelineError("还缺主题。你可以直接输入：主题：早起效率。");
          setXhsPipelineNextStepHint("第 1 步：先输入主题；第 2 步：确认素材目录；第 3 步：点击开始执行。");
          assistantReply = "要开始小红书闭环还缺主题。你直接回复“主题：xxx”，我就立刻执行。";
        } else {
          setXhsPipelineNextStepHint(`已接管执行：主题「${resolvedTheme}」。正在启动文案→剪辑→上传流程。`);
          assistantReply = `收到，已接管小红书闭环执行：主题「${resolvedTheme}」。左侧“小红书视频闭环”会持续回传进度。`;
          void startXhsPipelineRun({ theme: resolvedTheme });
        }
      } else if (resolvedTheme) {
        setXhsPipelineNextStepHint(`已识别主题「${resolvedTheme}」。下一步：确认素材目录后点击“开始执行闭环”。`);
        assistantReply = `已识别主题「${resolvedTheme}」，并填入第 1 步。下一步：确认素材目录后点击“开始执行闭环”。如果要我直接跑，回复“直接执行小红书闭环”。`;
      } else {
        assistantReply = "我可以接管小红书闭环。先给我主题，例如：主题：早起效率。";
      }
      if (!retryText) {
        setDraft("");
      }
      setPendingImages([]);
      setStreamStatus("idle");
      setLastFailedDraft("");
      setStreamError("");
      setMessages((prev) => [
        ...prev,
        { id: `user-local-${now}`, role: "user", text: rawText, time: nowTime(), timestamp: now, scene: sceneForSend },
        { id: `aria-local-${now}`, role: "aria", text: assistantReply, time: nowTime(), timestamp: now + 1, scene: sceneForSend }
      ]);
      setMomentumToast("已进入小红书闭环执行入口。");
      return;
    }

    // Build final text with embedded images
    const imageTags = images.map((img) => `[img:${img.dataUrl}]`).join("\n");
    const text = imageTags ? (rawText ? `${rawText}\n${imageTags}` : imageTags) : rawText;

    const now = Date.now();
    const optimisticUserId = `user-local-${now}`;
    const optimisticAriaId = `aria-local-${now}`;
    let continueDrainQueue = true;

    setSending(true);
    setError("");
    setStreamError("");
    setStreamStatus("loading");
    setLastFailedDraft("");
    if (!options?.fromQueue) {
      setPendingImages([]);
    }
    const stayInPlace =
      panelForSend === "funzone"
      || (panelForSend === "memory" && sceneForSend === "life")
      || (panelForSend === "workday" && (sceneForSend === "work" || sceneForSend === "coding"));
    if (!stayInPlace && !options?.fromQueue) {
      openPanel("chat", sceneForSend);
    }
    setMessages((prev) => [
      ...prev,
      { id: optimisticUserId, role: "user", text, time: nowTime(), timestamp: Date.now(), scene: sceneForSend },
      { id: optimisticAriaId, role: "aria", text: "", time: nowTime(), timestamp: Date.now(), scene: sceneForSend }
    ]);
    if (!retryText && !options?.fromQueue) setDraft("");
    let routeInfoForThisMessage: ModelRouteInfo | null = null;

    try {
      const preferredProviderId = String(options?.forcedProviderId || sceneModelDrafts[sceneForSend] || "").trim();
      const taskType = sceneTaskTypeMap[sceneForSend];
      await sendDemoMessageStream(text, {
        onMeta: (payload) => {
          setStreamStatus("loading");
          setLatestRouteScene(sceneForSend);
          setLatestRouteUserText(rawText);
          if (payload.modelRoute) {
            routeInfoForThisMessage = payload.modelRoute;
            setLatestRouteInfo(payload.modelRoute);
            appendRouteTraceEvent(
              sceneForSend,
              rawText,
              payload.modelRoute,
              "info",
              "模型路由开始",
              `provider=${payload.modelRoute.providerId || "unknown"} · model=${payload.modelRoute.model || "unknown"}`
            );
          }
        },
        onChunk: (payload) => {
          setStreamStatus("streaming");
          setMessages((prev) =>
            prev.map((item) =>
              item.id === optimisticAriaId
                ? { ...item, text: payload.fullText, time: nowTime() }
                : item
            )
          );
          queueVoiceTtsFromFullText(payload.fullText);
        },
        onDone: (payload) => {
          setLatestRouteScene(sceneForSend);
          setLatestRouteUserText(rawText);
          const autoExecution = payload.autoExecution || null;
          const shouldFollowupExecution = shouldStartChatExecutionFollowup(autoExecution);
          updateAgiSceneExecutionSignal(sceneForSend, autoExecution);
          if (payload.modelRoute) {
            routeInfoForThisMessage = payload.modelRoute;
            setLatestRouteInfo(payload.modelRoute);
            const hasFailedAttempts = (payload.modelRoute.attempts || []).some((item) => !item.ok);
            if (payload.modelRoute.fallback) {
              const fallbackReason = (payload.modelRoute.attempts || [])
                .filter((item) => !item.ok)
                .map((item) => item.reason)
                .filter(Boolean)[0] || "all_providers_failed";
              appendRouteTraceEvent(
                sceneForSend,
                rawText,
                payload.modelRoute,
                "warning",
                "模型路由降级",
                `已降级到模板回复 · reason=${fallbackReason}`
              );
              runRouteAutoHeal(sceneForSend, {
                routeInfo: payload.modelRoute,
                userText: rawText,
                reason: "fallback"
              });
            } else if (hasFailedAttempts) {
              const failedCount = (payload.modelRoute.attempts || []).filter((item) => !item.ok).length;
              appendRouteTraceEvent(
                sceneForSend,
                rawText,
                payload.modelRoute,
                "warning",
                "模型通道抖动后恢复",
                `前置失败 ${failedCount} 次，当前 provider=${payload.modelRoute.providerId || "unknown"}`
              );
              runRouteAutoHeal(sceneForSend, {
                routeInfo: payload.modelRoute,
                userText: rawText,
                reason: "通道抖动"
              });
            } else {
              appendRouteTraceEvent(
                sceneForSend,
                rawText,
                payload.modelRoute,
                "success",
                "模型路由成功",
                `provider=${payload.modelRoute.providerId || "unknown"} · model=${payload.modelRoute.model || "unknown"}`
              );
            }
          }
          applyState(payload.state);
          if (shouldFollowupExecution) {
            startChatExecutionFollowup(sceneForSend, autoExecution);
          }
          setStreamStatus("idle");
          void searchMemory(memoryQuery);
          void syncRuntimeGuardian({ silent: true });
          void syncUnifiedTimelineState({ silent: true, limit: 120 });
          if (!shouldFollowupExecution) {
            setMomentumToast("回复完成：可以继续推进下一步任务。");
          }
          queueVoiceTtsFromFullText(String(payload.delta?.assistantMessage?.text || ""), { finalFlush: true });
        }
      }, {
        preferredProviderId,
        taskType,
        scene: sceneForSend
      });
      setLastFailedDraft("");
    } catch (sendError) {
      continueDrainQueue = false;
      if (isVoiceSessionLive()) {
        resetVoiceTtsStreamState({ interruptPlayback: true, resetCursor: true });
      }
      setLatestRouteScene(sceneForSend);
      setLatestRouteUserText(rawText);
      const routeForError = routeInfoForThisMessage || latestRouteInfo;
      const routeErrorMessage = sendError instanceof Error ? sendError.message : "流式发送失败";
      appendRouteTraceEvent(
        sceneForSend,
        rawText,
        routeForError,
        "error",
        "模型路由失败",
        routeErrorMessage
      );
      if (!options?.fromAutoHeal && shouldTriggerRouteAutoHealByError(sendError)) {
        runRouteAutoHeal(sceneForSend, {
          routeInfo: routeForError,
          userText: rawText,
          reason: "network_recover"
        });
      }
      if (sendError instanceof Error && sendError.message.includes("401")) {
        await forceRefreshAuth();
      }
      const streamErrorMessage = routeErrorMessage;
      const compactError = streamErrorMessage.length > 120
        ? `${streamErrorMessage.slice(0, 117)}...`
        : streamErrorMessage;
      setStreamStatus("error");
      setLastFailedDraft(rawText);
      setStreamError(streamErrorMessage);
      setMessages((prev) =>
        prev.map((item) =>
          item.id === optimisticAriaId
            ? {
              ...item,
              text: `⚠️ 这次执行失败：${compactError}\n你可以点击「重试上一条」，或继续发新消息进入队列。`,
              time: nowTime()
            }
            : item
        )
      );
      if (!options?.fromQueue) {
        setDraft(rawText);
        setPendingImages(images);
        if (outgoingQueueRef.current.length > 0) {
          setMomentumToast("本条发送失败，队列已暂停。修复后可继续发送。");
        }
      } else {
        continueDrainQueue = false;
        outgoingQueueRef.current.unshift({
          text: rawText,
          images,
          scene: sceneForSend,
          panel: panelForSend
        });
        setQueuedSendCount(outgoingQueueRef.current.length);
        setMomentumToast("队列发送中断：上一条失败，请点击“重试上一条”。");
      }
    } finally {
      setSending(false);
      if (continueDrainQueue && outgoingQueueRef.current.length > 0) {
        const next = dequeueOutgoingMessage();
        if (next) {
          setMomentumToast(`正在自动发送队列（剩余 ${outgoingQueueRef.current.length} 条）`);
          void sendMessage(next.text, {
            images: next.images,
            scene: next.scene,
            panel: next.panel,
            fromQueue: true
          });
        }
      }
    }
  };

  const resetState = async () => {
    setSyncing(true);
    setError("");
    setStreamError("");
    try {
      const state = await resetDemoState();
      applyState(state);
      setProactiveResult(null);
      await searchMemory("");
      await syncAutonomy();
      await syncWorkday();
      await syncWorkbench();
      await syncExpansion();
      await syncDeviceOps();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "重置失败");
    } finally {
      setSyncing(false);
    }
  };

  const triggerEngagement = async (eventType: "daily_checkin" | "quest_complete") => {
    setSyncing(true);
    setStreamError("");
    try {
      const nextEngagement = await reportEngagementEvent(eventType, { scene: "desktop-panel" });
      setEngagement(nextEngagement);
      const fresh = await fetchEngagementState();
      setEngagement(fresh.engagement);
      if (fresh.proactive) setProactiveState(fresh.proactive);
      if (fresh.autonomy) {
        setAutonomyState(fresh.autonomy);
        setAutonomyInbox(fresh.autonomy.inbox.filter((item) => item.status !== "acked"));
      }
      if (fresh.workday) setWorkdayState(fresh.workday);
      if (fresh.deviceOps) {
        setDeviceOpsState(fresh.deviceOps);
        setDeviceTasks(fresh.deviceOps.tasks.slice(0, 10));
      }
      setUpdatedAt(new Date().toISOString());
      setMomentumToast(eventType === "daily_checkin" ? "成长签到已记录。" : "成长任务已记录。");
    } catch (engagementError) {
      setStreamError(engagementError instanceof Error ? engagementError.message : "成长状态同步失败");
    } finally {
      setSyncing(false);
    }
  };

  // ── Show character selection if no persona chosen ──
  if (!selectedPersona) {
    return <CharacterSelect onSelect={handleSelectPersona} />;
  }

  const persona = selectedPersona;
  const workSceneKey: SceneKey = activeScene === "coding" ? "coding" : "work";
  const isCodingScene = workSceneKey === "coding";
  const activeSceneMessages = sceneMessageBuckets[activeScene];
  const funSceneMessages = sceneMessageBuckets.fun;
  const lifeSceneMessages = sceneMessageBuckets.life;
  const loveSceneMessages = sceneMessageBuckets.love;
  const workSceneMessages = sceneMessageBuckets[workSceneKey];
  const workSceneLabel = sceneMeta[workSceneKey].label;
  const workScenePlaceholder = workSceneKey === "coding"
    ? "输入编程目标，例如：修复构建报错并给补丁预演..."
    : "输入工作目标，按回车执行...";
  const workVoicePrefill = workSceneKey === "coding"
    ? "请帮我先澄清需求，再给补丁预演 diff，确认后执行并验证。"
    : "请帮我语音收集今天工作目标，并生成执行计划。";
  const agiViewportVisible = agiViewportOpen && !canvasSceneActive;
  const personaLevelQuickActionBusy = systemConfigLoading || systemConfigSaving || personaQuickSwitching;
  const l3TakeoverActionDisabled = l3TakeoverApplying || deviceLoading || personaLevelQuickActionBusy;
  const l3TakeoverButtonLabel = l3TakeoverApplying ? "L3接管中..." : "L3全权限";
  const currentOnboarding = onboardingFlow[Math.min(Math.max(onboardingStep, 0), onboardingFlow.length - 1)];
  const onboardingProgress = Math.round(((onboardingStep + 1) / Math.max(1, onboardingFlow.length)) * 100);
  const onboardingRemainingSeconds = Math.max(
    0,
    onboardingFlow
      .slice(Math.max(0, onboardingStep))
      .reduce((sum, item) => sum + Math.max(0, item.seconds), 0)
  );
  const onboardingVisualOutfit = persona.outfits.find((item) => item.scene === currentOnboarding.scene) || persona.outfits[0];
  const onboardingVisualAvatar = onboardingVisualOutfit
    ? onboardingVisualOutfit.avatar
    : persona.avatar;

  // ── Main UI with Avatar + Chat ──
  return (
    <main
      className="app-shell"
      style={{ "--persona-accent": persona.accentColor, "--persona-accent-soft": persona.accentSoft } as React.CSSProperties}
      data-app-theme={appTheme}
    >
      {/* Left: Interactive Avatar */}
      <InteractiveAvatar
        persona={persona}
        engagement={engagement}
        mode={mode}
        activeScene={activeScene}
        panelQuickActions={visiblePanels.map((panel) => ({
          id: panel,
          label: panelMeta[panel].label,
          active: rightPanel === panel
        }))}
        brainConfigs={avatarBrainConfigs}
        actionConfigs={avatarActionConfigs}
        onPanelQuickOpen={(panel) => openPanel(panel, activeScene)}
        onConfigAction={handleAvatarConfigAction}
        onSwitchPersona={handleSwitchPersona}
        onToggleVoiceCall={toggleVoiceCallSession}
        voiceCallActive={voiceCallActive || voiceCallListening}
        appTheme={appTheme}
        onCycleTheme={cycleAppTheme}
      />

      {/* Right: Chat + Panels */}
      <section className={`chat-panel ${isCodingScene ? "chat-panel--coding" : ""} ${agiViewportVisible ? "agi-viewport-open" : "agi-viewport-closed"}`.trim()}>
        <header className="chat-header">
          <div className="title-wrap">
            <p className="eyebrow">ARIA · {persona.name}</p>
            <h1>{persona.name}·超级女友</h1>
            <p className="subline">{headerLine}</p>
          </div>
          <div className="status-wrap">
            <button
              type="button"
              className={`agi-inline-toggle ${agiViewportOpen ? "is-open" : ""}`.trim()}
              onClick={() => setAgiViewportOpen((previous) => !previous)}
              title="Agi任务动态视窗（四场景）"
              aria-label="切换 Agi任务动态视窗"
            >
              🧠
            </button>
            <button
              type="button"
              className={`network-chip ${online ? "is-online" : "is-offline"}`}
              onClick={() => void updatePreferences({ online: !online })}
              disabled={syncing}
            >
              {online ? "云端在线" : "离线模式"}
            </button>
            <div className="persona-level-shortcuts" role="group" aria-label="人格强度快捷切换">
              {PERSONA_INTENSITY_LEVEL_OPTIONS.map((option) => (
                <button
                  key={`persona-level-${option.value}`}
                  type="button"
                  className={`persona-level-shortcut-btn ${personaIntensityLevelDraft === option.value ? "is-active" : ""}`.trim()}
                  onClick={() => void applyPersonaIntensityQuickLevel(option.value)}
                  disabled={personaLevelQuickActionBusy}
                  title={option.hint}
                >
                  {option.value}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`l3-full-takeover-btn ${personaIntensityLevelDraft === "L3" ? "is-armed" : ""}`.trim()}
              onClick={() => void grantL3FullTakeoverPermissions()}
              disabled={l3TakeoverActionDisabled}
              title="一键放开设备能力权限，进入 L3 完整接管测试"
            >
              {l3TakeoverButtonLabel}
            </button>
            <div className="scene-tabs" role="tablist" aria-label="scene">
              {(Object.entries(sceneMeta) as Array<[SceneKey, typeof sceneMeta[SceneKey]]>).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={activeScene === key && !canvasSceneActive ? "active" : ""}
                  onClick={() => { setCanvasSceneActive(false); openScene(key); }}
                  disabled={syncing}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                className={canvasSceneActive ? "active canvas-tab" : "canvas-tab"}
                onClick={() => setCanvasSceneActive(true)}
              >
                留白场景
              </button>
            </div>
            <p className="mode-readonly">{modeCopy[mode]}</p>
          </div>
        </header>

        {showOnboarding && (
          <section className="onboarding-strip">
            <div className="onboarding-head">
              <p className="onboarding-step">30 秒上手引导 · Step {onboardingStep + 1}/{onboardingFlow.length}</p>
              <div className="onboarding-progress-wrap">
                <div className="onboarding-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={onboardingProgress}>
                  <span className="onboarding-progress-fill" style={{ width: `${onboardingProgress}%` }} />
                </div>
                <span className="onboarding-progress-time">预计剩余 {onboardingRemainingSeconds}s</span>
              </div>
            </div>
            <div className="onboarding-body">
              <div className="onboarding-visual">
                <img src={onboardingVisualAvatar} alt={`${persona.name} onboarding`} />
                <div className="onboarding-visual-badge">
                  <span>{currentOnboarding.visualEmoji}</span>
                  <strong>{currentOnboarding.visualTag}</strong>
                </div>
              </div>
              <div className="onboarding-copy">
                <h3>{currentOnboarding.title}</h3>
                <p>{currentOnboarding.desc}</p>
                <div className="onboarding-bullets">
                  {currentOnboarding.bullets.map((item, index) => (
                    <span key={`onboarding-bullet-${onboardingStep}-${index}`}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="onboarding-actions">
              <button type="button" className="ghost" onClick={() => finishOnboarding()}>
                跳过引导
              </button>
              <button
                type="button"
                className="quick"
                onClick={() => openPanel(currentOnboarding.panel, currentOnboarding.scene)}
              >
                {currentOnboarding.action}
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => nextOnboardingStep()}
              >
                {onboardingStep + 1 >= onboardingFlow.length ? "完成引导" : "下一步"}
              </button>
            </div>
          </section>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {canvasSceneActive ? (
            <section className="canvas-scene-fullpage">
              {renderCreativeCanvas()}
            </section>
          ) : (
            <>
              {/* ── Entertainment Tab ── */}
              {rightPanel === "funzone" && (
                <section className="fun-scene-layout">
                  <aside className="fun-scene-left">
                    <div className="fun-left-header">
                      <div className="fun-left-header-info">
                        <strong>{persona.name}</strong>
                        <span>{sceneMeta.fun.label}</span>
                      </div>
                      <div className="fun-left-header-status">
                        <span className="status-dot"></span>在线
                      </div>
                    </div>
                    {renderSceneModelConfig("fun", {
                      className: "scene-model-config--fun",
                      title: "娱乐模型配置",
                      subtitle: "切换后，娱乐场景聊天即时生效"
                    })}
                    <p className="fun-column-title">娱乐入口</p>
                    {funLeftModules.map((item) => {
                      const moduleStatus = formatSceneModuleStatus(
                        "fun",
                        item.id === "fun_soul" ? "soul-core" : item.id
                      );
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`fun-left-card ${activeFunLeftModuleId === item.id ? "is-active" : ""}`}
                          onClick={() => openFunConfigBubble(item.id)}
                        >
                          <span className="fun-left-badge">{item.badge}</span>
                          <strong>{item.title}</strong>
                          <small>{item.hint}</small>
                          <small className={`module-config-status is-${moduleStatus.tone}`}>
                            {moduleStatus.label} · {moduleStatus.detail}
                          </small>
                        </button>
                      );
                    })}
                    {showFunConfigBubble && (
                      <section className="fun-config-bubble">
                        <div className="fun-config-bubble-head">
                          <strong>{activeFunLeftModule.title} · 二级配置</strong>
                          <button type="button" onClick={() => setShowFunConfigBubble(false)}>关闭</button>
                        </div>

                        {activeFunLeftModuleId === "fun_soul" ? (
                          renderSceneSoulConfigPanel("fun", {
                            className: "scene-soul-config-panel--bubble",
                            title: "娱乐 Soul 调校",
                            subtitle: "可随时打开/隐藏，配置只作用于娱乐场景。"
                          })
                        ) : (
                          <>
                            <div className="fun-config-form">
                              <p className="fun-config-subtitle">选择一个小配置动作，再补充你的要求。</p>
                              <div className="fun-config-action-list">
                                {activeFunConfigActions.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={funSubConfigActionId === item.id ? "is-active" : ""}
                                    onClick={() => setFunSubConfigActionId(item.id)}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                              {(activeFunLeftModuleId === "mini_game" || activeFunLeftModuleId === "handmade_game") ? (
                                <div className="fun-game-params">
                                  <label>
                                    难度
                                    <select
                                      value={funGameDraft.difficulty}
                                      onChange={(event) => setFunGameDraft((prev) => ({
                                        ...prev,
                                        difficulty: event.target.value as FunGameDraft["difficulty"]
                                      }))}
                                    >
                                      {FUN_GAME_DIFFICULTY_OPTIONS.map((option) => (
                                        <option key={`fun-difficulty-${option.value}`} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label>
                                    回合
                                    <input
                                      type="number"
                                      min={1}
                                      max={30}
                                      value={funGameDraft.rounds}
                                      onChange={(event) => setFunGameDraft((prev) => ({
                                        ...prev,
                                        rounds: Math.max(1, Math.min(30, Number.parseInt(event.target.value || "1", 10) || 1))
                                      }))}
                                    />
                                  </label>
                                  {activeFunLeftModuleId === "handmade_game" ? (
                                    <label>
                                      模板名（可复用）
                                      <input
                                        value={funGameDraft.templateName}
                                        onChange={(event) => setFunGameDraft((prev) => ({ ...prev, templateName: event.target.value }))}
                                        placeholder="例如：晚间放松局"
                                      />
                                    </label>
                                  ) : null}
                                  <div className="fun-game-switch-grid">
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={funGameDraft.scoreEnabled}
                                        onChange={(event) => setFunGameDraft((prev) => ({ ...prev, scoreEnabled: event.target.checked }))}
                                      />
                                      计分
                                    </label>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={funGameDraft.rewardEnabled}
                                        onChange={(event) => setFunGameDraft((prev) => ({ ...prev, rewardEnabled: event.target.checked }))}
                                      />
                                      奖励
                                    </label>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={funGameDraft.reviveEnabled}
                                        onChange={(event) => setFunGameDraft((prev) => ({ ...prev, reviveEnabled: event.target.checked }))}
                                      />
                                      失败复活
                                    </label>
                                  </div>
                                </div>
                              ) : null}
                              <label>
                                备注
                                <input
                                  value={funSubConfigInput}
                                  onChange={(event) => setFunSubConfigInput(event.target.value)}
                                  placeholder="例如：节奏慢一点，适合晚上放松"
                                />
                              </label>
                            </div>
                            <div className="fun-config-actions">
                              <button
                                type="button"
                                onClick={() => applyFunSecondaryConfigDraft(false)}
                                disabled={sceneConfigApplyingKey === `fun:${activeFunLeftModuleId}`}
                              >
                                写入输入框
                              </button>
                              <button
                                type="button"
                                onClick={() => applyFunSecondaryConfigDraft(true)}
                                disabled={sceneConfigApplyingKey === `fun:${activeFunLeftModuleId}`}
                              >
                                {sceneConfigApplyingKey === `fun:${activeFunLeftModuleId}` ? "执行中..." : "应用并执行"}
                              </button>
                            </div>
                          </>
                        )}
                      </section>
                    )}
                  </aside>

                  <section className="fun-scene-center">
                    <article className="fun-scene-main-stage">
                      <h3>固定聊天互动区</h3>
                      <p>小游戏、手搓小游戏、交个朋友、Soul 调校都隐藏在左侧入口按钮内，点击后用二级配置页操作。</p>
                      <p className="fun-stage-meta">
                        当前入口：{activeFunLeftModule.title}（已隐藏配置） · 当前好友：{activeFunFriend.avatar} {activeFunFriend.name}
                      </p>
                      <div className="fun-stage-actions">
                        <button
                          type="button"
                          onClick={() => openFunConfigBubble(activeFunLeftModuleId)}
                        >
                          打开当前入口配置
                        </button>
                        <button
                          type="button"
                          onClick={() => fillFriendReplyDraft(activeFunFriend.name, funFriendFeedPreview[0]?.text || "")}
                        >
                          回复当前好友
                        </button>
                        <button
                          type="button"
                          onClick={() => void generateFunGameFromDraft()}
                          disabled={sceneConfigApplyingKey === "fun:quick_generate"}
                        >
                          {sceneConfigApplyingKey === "fun:quick_generate" ? "生成中..." : "按当前输入生成小游戏"}
                        </button>
                      </div>
                    </article>

                    <div className="fun-chat-wall" ref={activeMessageListRef}>
                      {loading ? <div className="loading-card">正在加载娱乐会话...</div> : null}
                      {!loading && funSceneMessages.length === 0 ? (
                        <div className="loading-card">
                          {persona.sceneGreetings?.fun || `${persona.name} 已进入娱乐场景。你可以从左侧选入口，直接在中间聊天区开玩。`}
                        </div>
                      ) : null}
                      {!loading ? funSceneMessages.map((item) => (
                        <article key={`fun-msg-${item.id}`} className={getMessageBubbleClassName(item)}>
                          {item.role === "aria" && (
                            <span className="bubble-avatar-name">{persona.name}</span>
                          )}
                          <div className="bubble-content">
                            {item.text
                              ? renderMessageContent(item.text)
                              : (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}
                          </div>
                          <time>{item.time}</time>
                        </article>
                      )) : null}
                      {streamStatus === "loading" ? (
                        <div className="stream-tip">{persona.name} 正在组织娱乐回复...</div>
                      ) : null}
                      <div ref={messageEndRef} />
                    </div>

                    <div className="fun-input-dock">
                      <div className="fun-input-tags">
                        {funBottomQuickActions.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            className="fun-bottom-chip"
                            onClick={(event) => {
                              void launchFunStarter(item.starterPrompt, `快捷 ${index + 1}`, {
                                writeOnly: event.shiftKey
                              });
                            }}
                          >
                            <span>{index + 1}</span>
                            <strong>{item.label}</strong>
                          </button>
                        ))}
                      </div>
                      <div className="fun-input-row">
                        <button
                          type="button"
                          className="fun-input-attach"
                          onClick={() => imageInputRef.current?.click()}
                          title="上传图片"
                          disabled={loading || pendingImages.length >= MAX_IMAGE_COUNT}
                        >
                          📷
                        </button>
                        <textarea
                          className="fun-input"
                          rows={3}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void sendMessage();
                            }
                          }}
                          placeholder="固定聊天输入框：输入玩法、交友话题或手搓游戏需求..."
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="fun-input-send"
                          onClick={() => void sendMessage()}
                          disabled={loading}
                        >
                          {sending
                            ? `发送中${queuedSendCount > 0 ? ` +${queuedSendCount}` : ""}...`
                            : queuedSendCount > 0
                              ? `发送（队列${queuedSendCount}）`
                              : "发送"}
                        </button>
                        <button
                          type="button"
                          className="chat-withdraw-btn"
                          onClick={() => void withdrawLatestTaskMessage("fun")}
                          disabled={
                            loading
                            || sending
                            || withdrawingLastMessage
                            || streamStatus === "loading"
                            || streamStatus === "streaming"
                            || !canWithdrawSceneMap.fun
                          }
                          title="撤回最近一次已发出的任务"
                        >
                          {withdrawingLastMessage ? "撤回中..." : "撤回"}
                        </button>
                      </div>
                    </div>
                  </section>

                  <aside className="fun-scene-right">
                    <p className="fun-column-title">好友头像</p>
                    <div className="fun-friend-avatar-list">
                      {funFriendList.map((friend) => (
                        <button
                          key={friend.id}
                          type="button"
                          className={`fun-friend-avatar ${activeFunFriendId === friend.id ? "is-active" : ""}`}
                          onClick={() => {
                            setActiveFunFriendId(friend.id);
                            setFunFriendUnread((prev) => ({ ...prev, [friend.id]: 0 }));
                          }}
                        >
                          <span className="fun-friend-emoji">{friend.avatar}</span>
                          <strong>{friend.name}</strong>
                          <small>{friend.status === "online" ? "在线" : friend.status === "busy" ? "忙碌" : "离线"}</small>
                          {(funFriendUnread[friend.id] || 0) > 0 ? (
                            <em>{Math.min(99, funFriendUnread[friend.id] || 0)}</em>
                          ) : null}
                        </button>
                      ))}
                    </div>
                    <div className="fun-friend-feed">
                      {funFriendFeedPreview.length === 0 ? (
                        <p className="memory-empty">好友消息会在这里弹出，你可以一键回复。</p>
                      ) : (
                        funFriendFeedPreview.map((item) => (
                          <article key={item.id} className={`fun-friend-note ${item.friendId === activeFunFriendId ? "is-active" : ""}`}>
                            <div className="fun-friend-note-head">
                              <span>{item.avatar} {item.friendName}</span>
                              <small>{item.at}</small>
                            </div>
                            <p>{item.text}</p>
                            <div className="fun-friend-note-actions">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveFunFriendId(item.friendId);
                                  fillFriendReplyDraft(item.friendName, item.text);
                                  setFunFriendUnread((prev) => ({ ...prev, [item.friendId]: 0 }));
                                }}
                              >
                                写入回复
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveFunFriendId(item.friendId);
                                  setFunFriendUnread((prev) => ({ ...prev, [item.friendId]: 0 }));
                                  void sendMessage(buildFriendReplyPrompt(item.friendName, item.text));
                                }}
                                disabled={loading}
                              >
                                快速回复
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                    <p className="fun-column-title">我的小游戏</p>
                    <div className="fun-game-list">
                      {funGames.length === 0 ? (
                        <p className="memory-empty">还没有生成小游戏。你可以在聊天输入框说“帮我做个小游戏”。</p>
                      ) : (
                        funGames.slice(0, 6).map((game) => (
                          <article key={game.id} className="fun-game-item">
                            <div className="fun-game-item-head">
                              <strong>{game.title}</strong>
                              <small>{game.mode === "handmade_game" ? "手搓" : "小游戏"}</small>
                            </div>
                            <p>{game.difficulty} · {game.rounds} 回合 · {game.rewardEnabled ? "奖励开" : "奖励关"}</p>
                            <div className="fun-game-item-actions">
                              <a href={game.playUrl} target="_blank" rel="noreferrer">立即开玩</a>
                              <button type="button" onClick={() => void copyFunGameLink(game)}>复制链接</button>
                              <button type="button" onClick={() => reuseFunGameTemplate(game)}>复用模板</button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                    <p className="fun-column-title">游戏库 / 攻略</p>
                    {funRightModules.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`fun-right-card ${activeFunRightModuleId === item.id ? "is-active" : ""}`}
                        onClick={() => {
                          setActiveFunRightModuleId(item.id);
                          void launchFunStarter(item.starterPrompt, `「${item.title}」`);
                        }}
                      >
                        <strong>{item.title}</strong>
                        <small>{item.hint}</small>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="fun-right-add"
                      onClick={() => {
                        void launchFunStarter("帮我创建一个自定义娱乐场景玩法模板，可直接复制使用。", "「自定义玩法」");
                      }}
                    >
                      ＋ 自定义玩法
                    </button>
                  </aside>
                </section>
              )}

              {/* ── Chat Tab ── */}
              {rightPanel === "chat" && (
                activeScene === "love" ? (
                  <section className="love-scene-layout">
                    <aside className="love-scene-left">
                      {renderSceneModelConfig("love", {
                        className: "scene-model-config--love",
                        title: "情感模型配置",
                        subtitle: "先共情再执行，按你的节奏回复"
                      })}
                      <p className="love-column-title">情感入口</p>
                      {loveLeftModules.map((item) => {
                        const moduleStatus = formatSceneModuleStatus(
                          "love",
                          item.id === "love-model" ? "soul-core" : item.id
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`love-left-card ${activeLoveModuleId === item.id ? "is-active" : ""}`}
                            onClick={() => openLoveConfigBubble(item.id)}
                          >
                            <strong>{item.title}</strong>
                            <small>{item.hint}</small>
                            <small className={`module-config-status is-${moduleStatus.tone}`}>
                              {moduleStatus.label} · {moduleStatus.detail}
                            </small>
                          </button>
                        );
                      })}
                      {showLoveConfigBubble ? (
                        <section className="love-config-bubble">
                          <div className="love-config-head">
                            <strong>{activeLoveModule.title} · 二级配置</strong>
                            <button type="button" onClick={() => setShowLoveConfigBubble(false)}>关闭</button>
                          </div>
                          {activeLoveModuleId === "love-model" ? (
                            renderSceneSoulConfigPanel("love", {
                              className: "scene-soul-config-panel--bubble",
                              title: "Love Soul 调校",
                              subtitle: "可随时打开/隐藏，配置仅作用于情感场景。"
                            })
                          ) : (
                            <>
                              <p>{activeLoveModule.hint}</p>
                              <input
                                value={loveConfigInput}
                                onChange={(event) => setLoveConfigInput(event.target.value)}
                                placeholder="补充要求，比如‘语气更温柔，减少说教感’"
                              />
                              <div className="love-config-actions">
                                <button
                                  type="button"
                                  onClick={() => applyLoveConfigDraft(false)}
                                  disabled={sceneConfigApplyingKey === `love:${activeLoveModuleId}`}
                                >
                                  写入输入框
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyLoveConfigDraft(true)}
                                  disabled={sceneConfigApplyingKey === `love:${activeLoveModuleId}`}
                                >
                                  {sceneConfigApplyingKey === `love:${activeLoveModuleId}` ? "执行中..." : "应用并执行"}
                                </button>
                              </div>
                            </>
                          )}
                        </section>
                      ) : null}
                    </aside>

                    <section className="love-scene-center">
                      <article className="love-main-stage">
                        <div className="love-stage-head">
                          <p className="engagement-title">情感互动中台</p>
                          <span>{persona.name} · 情感世界 · 固定输入框</span>
                        </div>
                        <p>左侧入口用于情感配置，中间负责实时对话和回执，保持“一个输入框”完成所有互动。</p>
                      </article>

                      <div className="love-chat-wall" ref={activeMessageListRef}>
                        {loading ? <div className="loading-card">正在加载聊天记录...</div> : null}
                        {!loading && loveSceneMessages.length === 0 ? (
                          <div className="loading-card">{persona.sceneGreetings?.love || persona.greeting}</div>
                        ) : null}
                        {!loading ? loveSceneMessages.map((item) => (
                          <article key={`love-msg-${item.id}`} className={getMessageBubbleClassName(item)}>
                            {item.role === "aria" && (
                              <span className="bubble-avatar-name">{persona.name}</span>
                            )}
                            <div className="bubble-content">
                              {item.text
                                ? renderMessageContent(item.text)
                                : (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}
                            </div>
                            <time>{item.time}</time>
                          </article>
                        )) : null}
                        {streamStatus === "loading" ? (
                          <div className="stream-tip">{persona.name} 正在组织回应...</div>
                        ) : null}
                        <div ref={messageEndRef} />
                      </div>

                      <div className="love-input-dock">
                        <div className="love-action-row">
                          {loveQuickActions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={(event) => {
                                void triggerSceneQuickAction({
                                  prompt: item.prompt,
                                  scene: "love",
                                  panel: "chat",
                                  label: `情感快捷「${item.label}」`,
                                  writeOnly: event.shiftKey
                                });
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className="love-input-row">
                          <button
                            type="button"
                            className={`love-input-voice ${voiceCallActive ? "is-active" : ""}`.trim()}
                            onClick={() => toggleVoiceCallSession()}
                            title={voiceCallActive ? "结束语音通话" : "语音入口"}
                          >
                            {voiceCallActive ? "停" : "语"}
                          </button>
                          <input
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void sendMessage();
                              }
                            }}
                            placeholder="固定输入框：输入打招呼、夸夸她、比心密语或情感诉求..."
                            disabled={loading}
                          />
                          <button type="button" className="love-input-send" onClick={() => void sendMessage()} disabled={loading}>
                            {sending
                              ? `发送中${queuedSendCount > 0 ? ` +${queuedSendCount}` : ""}...`
                              : queuedSendCount > 0
                                ? `发送（队列${queuedSendCount}）`
                                : "＋"}
                          </button>
                          <button
                            type="button"
                            className="chat-withdraw-btn"
                            onClick={() => void withdrawLatestTaskMessage("love")}
                            disabled={
                              loading
                              || sending
                              || withdrawingLastMessage
                              || streamStatus === "loading"
                              || streamStatus === "streaming"
                              || !canWithdrawSceneMap.love
                            }
                            title="撤回最近一次已发出的任务"
                          >
                            {withdrawingLastMessage ? "撤回中..." : "撤回"}
                          </button>
                        </div>
                      </div>
                    </section>
                  </section>
                ) : (
                  <div className="message-list" ref={activeMessageListRef}>
                    {loading ? <div className="loading-card">正在加载聊天记录...</div> : null}
                    {!loading && activeSceneMessages.length === 0 ? (
                      <div className="loading-card">{persona.sceneGreetings?.[activeScene] || persona.greeting}</div>
                    ) : null}
                    {!loading ? activeSceneMessages.map((item) => (
                      <article key={item.id} className={getMessageBubbleClassName(item)}>
                        {item.role === "aria" && (
                          <span className="bubble-avatar-name">{persona.name}</span>
                        )}
                        <p>{item.text || (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}</p>
                        <time>{item.time}</time>
                      </article>
                    )) : null}
                    {streamStatus === "loading" ? (
                      <div className="stream-tip">{persona.name} 正在组织回应...</div>
                    ) : null}
                    <div ref={messageEndRef} />
                  </div>
                )
              )}

              {/* ── Memory Tab ── */}
              {rightPanel === "memory" && (
                activeScene === "life" ? (
                  <section className="life-scene-layout">
                    <aside className="life-scene-left">
                      {renderSceneModelConfig("life", {
                        className: "scene-model-config--life",
                        title: "生活模型配置",
                        subtitle: "关注家庭与事务，聊天窗口立即使用"
                      })}
                      <p className="life-column-title">生活入口</p>
                      {lifeLeftModules.map((item) => {
                        const moduleStatus = formatSceneModuleStatus(
                          "life",
                          item.id === "life-soul" ? "soul-core" : item.id
                        );
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`life-left-card ${activeLifeModuleId === item.id ? "is-active" : ""}`}
                            onClick={() => openLifeConfigBubble(item.id)}
                          >
                            <strong>{item.title}</strong>
                            <small>{item.hint}</small>
                            <small className={`module-config-status is-${moduleStatus.tone}`}>
                              {moduleStatus.label} · {moduleStatus.detail}
                            </small>
                          </button>
                        );
                      })}
                      {showLifeConfigBubble ? (
                        <section className="life-config-bubble">
                          <div className="life-config-head">
                            <strong>{activeLifeModule.title} · 二级配置</strong>
                            <button type="button" onClick={() => setShowLifeConfigBubble(false)}>关闭</button>
                          </div>
                          {activeLifeModuleId === "life-soul" ? (
                            renderSceneSoulConfigPanel("life", {
                              className: "scene-soul-config-panel--bubble",
                              title: "Life Soul 调校",
                              subtitle: "可随时打开/隐藏，配置仅作用于生活场景。"
                            })
                          ) : (
                            <>
                              <p>{activeLifeModule.hint}</p>
                              <input
                                value={lifeConfigInput}
                                onChange={(event) => setLifeConfigInput(event.target.value)}
                                placeholder="补充要求，比如‘优先提醒妈妈吃药’"
                              />
                              <div className="life-config-actions">
                                <button
                                  type="button"
                                  onClick={() => applyLifeConfigDraft(false)}
                                  disabled={sceneConfigApplyingKey === `life:${activeLifeModuleId}`}
                                >
                                  写入输入框
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyLifeConfigDraft(true)}
                                  disabled={sceneConfigApplyingKey === `life:${activeLifeModuleId}`}
                                >
                                  {sceneConfigApplyingKey === `life:${activeLifeModuleId}` ? "执行中..." : "应用并执行"}
                                </button>
                              </div>
                            </>
                          )}
                        </section>
                      ) : null}
                    </aside>

                    <section className="life-scene-center">
                      <article className="life-main-stage">
                        <div className="life-stage-head">
                          <p className="engagement-title">生活互动中台</p>
                          <span>{persona.name} · 生活场景 · 聊天主窗口</span>
                        </div>
                        <p>中间就是聊天与输入，左侧做配置，右侧看事件，底部工具做快速触发。</p>
                        <div className="life-role-chips">
                          {lifeRoleChips.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={(event) => {
                                void triggerSceneQuickAction({
                                  prompt: `以「${item.label}」为核心，给我一条今天可执行的生活关怀计划。`,
                                  scene: "life",
                                  panel: "memory",
                                  label: `${item.label}生活计划`,
                                  writeOnly: event.shiftKey
                                });
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </article>

                      <div className="life-chat-wall" ref={activeMessageListRef}>
                        {loading ? <div className="loading-card">正在加载生活会话...</div> : null}
                        {!loading && lifeSceneMessages.length === 0 ? (
                          <div className="loading-card">
                            {persona.sceneGreetings?.life || `${persona.name} 已进入生活场景。输入一句话就能安排提醒、家务、健康和家庭任务。`}
                          </div>
                        ) : null}
                        {!loading ? lifeSceneMessages.map((item) => (
                          <article key={`life-msg-${item.id}`} className={getMessageBubbleClassName(item)}>
                            {item.role === "aria" && (
                              <span className="bubble-avatar-name">{persona.name}</span>
                            )}
                            <div className="bubble-content">
                              {item.text
                                ? renderMessageContent(item.text)
                                : (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}
                            </div>
                            <time>{item.time}</time>
                          </article>
                        )) : null}
                        {streamStatus === "loading" ? (
                          <div className="stream-tip">{persona.name} 正在组织生活建议...</div>
                        ) : null}
                        <div ref={messageEndRef} />
                      </div>

                      <div className="life-input-dock">
                        <div className="life-input-row">
                          <button
                            type="button"
                            className="life-input-attach"
                            onClick={() => imageInputRef.current?.click()}
                            title="上传图片"
                            disabled={loading || pendingImages.length >= MAX_IMAGE_COUNT}
                          >
                            📷
                          </button>
                          <input
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void sendMessage();
                              }
                            }}
                            placeholder="固定输入框：输入生活需求、提醒、家务、健康或家庭任务..."
                            disabled={loading}
                          />
                          <button type="button" className="life-input-send" onClick={() => void sendMessage()} disabled={loading}>
                            {sending
                              ? `发送中${queuedSendCount > 0 ? ` +${queuedSendCount}` : ""}...`
                              : queuedSendCount > 0
                                ? `发送（队列${queuedSendCount}）`
                                : "发送"}
                          </button>
                          <button
                            type="button"
                            className="chat-withdraw-btn"
                            onClick={() => void withdrawLatestTaskMessage("life")}
                            disabled={
                              loading
                              || sending
                              || withdrawingLastMessage
                              || streamStatus === "loading"
                              || streamStatus === "streaming"
                              || !canWithdrawSceneMap.life
                            }
                            title="撤回最近一次已发出的任务"
                          >
                            {withdrawingLastMessage ? "撤回中..." : "撤回"}
                          </button>
                        </div>
                        <div className="life-tool-grid">
                          {lifeToolCards.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              className="life-tool-card"
                              title="点击立即执行；按住 Shift 仅写入输入框"
                              onClick={(event) => {
                                const prompt = item.prompt.trim();
                                if (!prompt) {
                                  return;
                                }
                                if (event.shiftKey) {
                                  setDraft(prompt);
                                  setMomentumToast(`${item.title} 指令已写入输入框。`);
                                  return;
                                }
                                setDraft(prompt);
                                setMomentumToast(`${item.title} 已发起执行（Shift+点击可仅写入输入框）。`);
                                void sendMessage(prompt, {
                                  scene: "life",
                                  panel: "memory"
                                });
                              }}
                            >
                              <strong>{item.title}</strong>
                              <small>{item.subtitle} · 点击即执行</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <aside className="life-scene-right">
                      <p className="life-column-title">活动事件</p>
                      {lifeEventCards.map((item) => (
                        <article key={item.id} className="life-event-card">
                          <strong>{item.title}</strong>
                          <p>{item.hint}</p>
                        </article>
                      ))}
                      <button
                        type="button"
                        className="life-event-action"
                        title="点击立即执行；按住 Shift 仅写入输入框"
                        onClick={(event) => {
                          void triggerSceneQuickAction({
                            prompt: "汇总今天生活场景执行动态，输出可读回执和明日建议。",
                            scene: "life",
                            panel: "memory",
                            label: "生活动态回执",
                            writeOnly: event.shiftKey
                          });
                        }}
                      >
                        生成动态回执
                      </button>
                    </aside>
                  </section>
                ) : (
                  <div className="side-panel-content">
                    <h2>🧠 {persona.name}的记忆</h2>

                    {/* Proactive card */}
                    <section className="proactive-card">
                      <div className="proactive-head">
                        <p className="engagement-title">主动触达建议</p>
                        <button type="button" onClick={() => void requestProactiveNext()} disabled={proactiveLoading || syncing || loading}>
                          {proactiveLoading ? "生成中..." : "获取建议"}
                        </button>
                      </div>
                      <p className="proactive-budget">
                        日预算 {proactiveState?.sentCount ?? 0}/{proactiveState?.maxDaily ?? 3} · 冷却 {proactiveState?.cooldownMinutes ?? 90} 分钟
                      </p>
                      {proactiveResult?.suggestion ? (
                        <article className="proactive-item">
                          <h3>{proactiveResult.suggestion.title}</h3>
                          <p>{proactiveResult.suggestion.message}</p>
                          <div className="proactive-actions">
                            <button type="button" onClick={() => { setDraft(proactiveResult.suggestion?.prefillText || ""); openPanel("chat", "love"); }} disabled={sending}>写入输入框</button>
                            <button type="button" onClick={() => void sendMessage(proactiveResult.suggestion?.prefillText)} disabled={loading}>立即执行</button>
                          </div>
                        </article>
                      ) : (
                        <p className="memory-empty">{proactiveResult?.reason || "点击获取建议"}</p>
                      )}
                    </section>

                    {/* Memory search */}
                    <section className="memory-search-box">
                      <div className="memory-search-row">
                        <input value={memoryQuery} onChange={(e) => setMemoryQuery(e.target.value)} placeholder="检索记忆关键词..." />
                        <button type="button" onClick={() => void searchMemory()} disabled={memorySearching || loading}>{memorySearching ? "检索中" : "检索"}</button>
                      </div>
                      <div className="memory-search-row">
                        <input value={memoryDraft} onChange={(e) => setMemoryDraft(e.target.value)} placeholder="写入新记忆..." />
                        <button type="button" onClick={() => void saveMemoryDraft()} disabled={syncing || memoryDraft.trim().length === 0}>写入</button>
                      </div>
                    </section>

                    <div className="memory-list">
                      {memorySearching ? (
                        <p className="memory-empty">正在检索记忆...</p>
                      ) : memoryResults.length > 0 ? (
                        memoryResults.map((item) => (
                          <article key={item.id} className="memory-item search-result">
                            <p>{item.content}</p>
                            <div className="memory-item-meta">
                              <span>{memorySourceLabel(item)} · 匹配{Math.round(item.score * 100)}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft(item.content.replace("用户近期提到：", ""));
                                  const targetScene = ["work", "fun", "life", "love", "coding"].includes(String(item.scene || ""))
                                    ? (String(item.scene) as SceneKey)
                                    : activeScene;
                                  openPanel("chat", targetScene);
                                }}
                              >
                                引用
                              </button>
                            </div>
                          </article>
                        ))
                      ) : memoryHighlights.length === 0 ? (
                        <p className="memory-empty">还没有记忆数据，和{persona.name}聊几句试试看。</p>
                      ) : (
                        memoryHighlights.map((item) => (
                          <article key={item} className="memory-item">{item}</article>
                        ))
                      )}
                    </div>
                  </div>
                )
              )}

              {/* ── Autonomy Tab ── */}
              {rightPanel === "autonomy" && (
                <div className="side-panel-content">
                  <h2>⚡ {persona.name}的自主内核</h2>

                  <section className="brain-map-card">
                    <div className="brain-map-head">
                      <p className="engagement-title">脑系统总览（小白版）</p>
                      <button type="button" className="brain-map-enter" onClick={() => openPanel("brain", activeScene)}>
                        进入超级脑图
                      </button>
                    </div>
                    <p className="brain-map-subline">
                      少看术语，直接看模块和进度条：点击后可进入 6 模块图像化界面。
                    </p>
                    <div className="brain-module-grid">
                      {(Object.entries(brainModuleMeta) as Array<[BrainModuleKey, typeof brainModuleMeta[BrainModuleKey]]>).map(([key, item]) => (
                        <article key={key} className="brain-module-item">
                          <div className="brain-module-main">
                            <span className="brain-module-icon">{item.icon}</span>
                            <div>
                              <h3>{item.title}</h3>
                              <p>{item.nonTech}</p>
                            </div>
                            <span className="brain-module-score">{brainModuleScores[key]}%</span>
                          </div>
                          <div className="brain-module-track">
                            <div style={{ width: `${brainModuleScores[key]}%` }} />
                          </div>
                          <div className="brain-module-tags">
                            {item.tags.map((tag) => (
                              <span key={`${key}-${tag}`}>{tag}</span>
                            ))}
                          </div>
                          <button type="button" onClick={() => { setActiveBrainModule(key); openPanel("brain", activeScene); }}>
                            {item.cta}
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="autonomy-card">
                    <div className="autonomy-head">
                      <p className="engagement-title">独立运行内核</p>
                      <span>{autonomyState?.enabled ? "运行中" : "暂停"}</span>
                    </div>
                    <p className="autonomy-meta">
                      Tick {autonomyState?.tickCount ?? 0} · 自主生成 {autonomyState?.generatedCount ?? 0} 条 · 内核 {autonomyState?.kernelVersion || "loading"}
                    </p>
                    <p className="autonomy-meta">
                      重试队列 {autonomyQueuePending} 项 · dead-letter {autonomyQueueDeadLetters} 项 · 最近处理 {autonomyState?.queue?.stats?.lastProcessAt ? new Date(autonomyState.queue.stats.lastProcessAt).toLocaleString() : "暂无"}
                    </p>
                    <div className="autonomy-actions">
                      <button type="button" onClick={() => void triggerAutonomyTick()} disabled={autonomyLoading || loading}>
                        {autonomyLoading ? "执行中..." : "立即自主执行"}
                      </button>
                      <button type="button" onClick={() => void triggerAutonomyRepair()} disabled={autonomyLoading || loading}>
                        自修复检查
                      </button>
                      <button type="button" onClick={() => void triggerAutonomyQueueProcess()} disabled={autonomyLoading || loading}>
                        处理重试队列
                      </button>
                    </div>
                    <div className="autonomy-queue-stats">
                      <span>累计处理 {autonomyState?.queue?.stats?.processed ?? 0}</span>
                      <span>累计成功 {autonomyState?.queue?.stats?.succeeded ?? 0}</span>
                      <span>累计死信 {autonomyState?.queue?.stats?.deadLettered ?? 0}</span>
                    </div>
                    <div className="flywheel-panel">
                      <div className="flywheel-head">
                        <p className="engagement-title">Data Flywheel（情感 + 执行）</p>
                        <span>{flywheelState?.totalSignals ? `${flywheelState.totalSignals} signals` : "等待学习信号"}</span>
                      </div>
                      <p className="autonomy-meta">
                        情感质量 {ratioToPercent(flywheelState?.emotionalQualityAvg || 0)} · 执行成功 {ratioToPercent(flywheelState?.executionSuccessAvg || 0)}
                        · 综合评分 {ratioToPercent(flywheelState?.combinedScoreAvg || 0)}
                      </p>
                      <div className="flywheel-metric-grid">
                        <article className="flywheel-metric-item">
                          <small>执行完成率</small>
                          <strong>{ratioToPercent(flywheelState?.executionCompletionRate || 0)}</strong>
                        </article>
                        <article className="flywheel-metric-item">
                          <small>Fallback 触发率</small>
                          <strong>{ratioToPercent(flywheelState?.fallbackRate || 0)}</strong>
                        </article>
                        <article className="flywheel-metric-item">
                          <small>累计学习轮次</small>
                          <strong>{flywheelState?.learningRuns ?? 0}</strong>
                        </article>
                        <article className="flywheel-metric-item">
                          <small>可执行样本</small>
                          <strong>{flywheelState?.executionEligibleCount ?? 0}</strong>
                        </article>
                      </div>
                      <p className="autonomy-meta">
                        最优任务类型 {flywheelBestTaskType ? taskRouteDisplayLabel(flywheelBestTaskType) : "待学习"}
                        {" "}· Top Provider {flywheelTopProvider
                          ? `${flywheelTopProvider.providerId}（${ratioToPercent(flywheelTopProvider.combinedAvg || 0)} / ${flywheelTopProvider.runs} runs）`
                          : "待学习"}
                      </p>
                      <p className="autonomy-meta">
                        最近信号 {formatRuntimeTimestamp(flywheelState?.lastSignalAt)} · 最近学习 {formatRuntimeTimestamp(flywheelState?.lastLearnedAt)}
                      </p>
                      <div className="flywheel-actions">
                        <button
                          type="button"
                          onClick={() => void triggerFlywheelReplay()}
                          disabled={flywheelReplaying || autonomyLoading || loading}
                        >
                          {flywheelReplaying ? "回放中..." : "重放策略学习"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void syncAutonomy()}
                          disabled={flywheelReplaying || autonomyLoading || loading}
                        >
                          刷新 Flywheel
                        </button>
                      </div>
                      <div className="flywheel-leaderboard-list">
                        {flywheelTopRows.length === 0 ? (
                          <p className="memory-empty">暂无可学习榜单，先多聊几轮并触发任务执行。</p>
                        ) : (
                          flywheelTopRows.map((row) => (
                            <article key={`flywheel-row-${row.providerId}`} className="flywheel-leaderboard-item">
                              <div>
                                <strong>{row.providerId}</strong>
                                <p>{row.model || "unknown-model"}</p>
                              </div>
                              <div>
                                <small>综合 {ratioToPercent(row.combinedAvg || 0)} · 运行 {row.runs} 次</small>
                                <small>Fallback {ratioToPercent(row.fallbackRate || 0)} · 最近 {formatRuntimeTimestamp(row.lastAt)}</small>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                      {flywheelRecentSignalPreview.length > 0 ? (
                        <div className="flywheel-signal-list">
                          {flywheelRecentSignalPreview.map((signal) => (
                            <article key={signal.id} className="flywheel-signal-item">
                              <strong>{taskRouteDisplayLabel(signal.taskType || "")} · {signal.providerId || "unknown-provider"}</strong>
                              <p>
                                情感 {ratioToPercent(signal.emotionalScore || 0)} · 执行 {ratioToPercent(signal.executionScore || 0)}
                                · 综合 {ratioToPercent(signal.combinedScore || 0)}
                              </p>
                              <small>
                                {signal.fallback ? "fallback" : "direct"} ·
                                {" "}dispatch {signal.dispatchStatus || "chat_only"} ·
                                {" "}{formatRuntimeTimestamp(signal.at)}
                              </small>
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="autonomy-policy-head">
                      <p>重试策略开关</p>
                      <div className="autonomy-policy-actions">
                        <button type="button" onClick={() => void toggleQueueGlobalEnabled()} disabled={autonomyLoading || loading}>
                          {autonomyState?.queue?.policy?.enabled === false ? "开启全局重试" : "关闭全局重试"}
                        </button>
                        <button type="button" onClick={() => void toggleQueueAutoProcessOnTick()} disabled={autonomyLoading || loading}>
                          {autonomyState?.queue?.policy?.autoProcessOnTick === false ? "开启自动 Tick 重试" : "关闭自动 Tick 重试"}
                        </button>
                      </div>
                    </div>
                    <div className="autonomy-strategy-list">
                      {queueStrategyRows.map((row) => (
                        <article key={`strategy-${row.id}`} className="autonomy-strategy-item">
                          <div className="autonomy-strategy-title">
                            <strong>{queueOperationLabel(row.id)}</strong>
                            <span>{row.strategy?.enabled === false ? "已关闭" : "已开启"}</span>
                          </div>
                          <p>
                            最大重试 {row.strategy?.maxAttempts ?? 0} 次 ·
                            退避基线 {Math.round((row.strategy?.baseDelayMs ?? 0) / 1000)} 秒 ·
                            熔断阈值 {row.strategy?.circuitBreakerThreshold ?? 0} 连续失败
                          </p>
                          <div className="autonomy-strategy-actions">
                            <button
                              type="button"
                              onClick={() => void toggleQueueStrategyEnabled(row.id, row.strategy?.enabled === false)}
                              disabled={autonomyLoading || loading}
                            >
                              {row.strategy?.enabled === false ? "开启" : "关闭"}
                            </button>
                            <button type="button" onClick={() => void adjustQueueStrategyMaxAttempts(row.id, -1)} disabled={autonomyLoading || loading}>重试-</button>
                            <button type="button" onClick={() => void adjustQueueStrategyMaxAttempts(row.id, 1)} disabled={autonomyLoading || loading}>重试+</button>
                            <button type="button" onClick={() => void adjustQueueStrategyBackoff(row.id, -1000)} disabled={autonomyLoading || loading}>退避-</button>
                            <button type="button" onClick={() => void adjustQueueStrategyBackoff(row.id, 1000)} disabled={autonomyLoading || loading}>退避+</button>
                            <button type="button" onClick={() => void adjustQueueStrategyCircuitThreshold(row.id, -1)} disabled={autonomyLoading || loading}>熔断-</button>
                            <button type="button" onClick={() => void adjustQueueStrategyCircuitThreshold(row.id, 1)} disabled={autonomyLoading || loading}>熔断+</button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="runtime-guardian-panel">
                      <div className="runtime-guardian-head">
                        <p className="engagement-title">Runtime Guardian（系统层）</p>
                        <span className={`runtime-outage-badge status-${runtimeOutage?.status || "unknown"}`}>
                          {runtimeOutage?.status === "critical"
                            ? "严重异常"
                            : runtimeOutage?.status === "warning"
                              ? "风险预警"
                              : runtimeOutage?.status === "ok"
                                ? "运行稳定"
                                : "待同步"}
                        </span>
                      </div>
                      <div className="runtime-guardian-actions">
                        <button
                          type="button"
                          onClick={() => void runRuntimeGuardianHeal("full_heal")}
                          disabled={runtimeHealing || runtimeConfigSaving || autonomyLoading || loading}
                        >
                          {runtimeHealing ? "自愈处理中..." : "一键自愈并重放失败任务"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void runRuntimeGuardianHeal("queue_replay")}
                          disabled={runtimeHealing || runtimeConfigSaving || autonomyLoading || loading}
                        >
                          仅重放失败任务
                        </button>
                        <button
                          type="button"
                          onClick={() => void runRuntimeGuardianHeal("schema_repair")}
                          disabled={runtimeHealing || runtimeConfigSaving || autonomyLoading || loading}
                        >
                          仅结构修复
                        </button>
                        <button
                          type="button"
                          onClick={() => void syncRuntimeGuardian()}
                          disabled={runtimeHealing || runtimeConfigSaving || loading}
                        >
                          刷新系统状态
                        </button>
                      </div>
                      <div className="runtime-guardian-actions">
                        <button
                          type="button"
                          onClick={() => void toggleRuntimeGuardianAuto()}
                          disabled={runtimeHealing || runtimeConfigSaving || loading}
                        >
                          {runtimeWatchdog?.enabled === false ? "恢复自动巡检" : "暂停自动巡检"}
                        </button>
                        <button
                          type="button"
                          className={runtimeWatchdog?.mode === "eco" ? "runtime-mode-btn is-active" : "runtime-mode-btn"}
                          title={runtimeModeHint("eco", runtimeModeQueueLimitMap.get("eco") ?? 1)}
                          onClick={() => void switchRuntimeGuardianMode("eco")}
                          disabled={runtimeHealing || runtimeConfigSaving || loading}
                        >
                          节能
                        </button>
                        <button
                          type="button"
                          className={runtimeWatchdog?.mode === "balanced" ? "runtime-mode-btn is-active" : "runtime-mode-btn"}
                          title={runtimeModeHint("balanced", runtimeModeQueueLimitMap.get("balanced") ?? 3)}
                          onClick={() => void switchRuntimeGuardianMode("balanced")}
                          disabled={runtimeHealing || runtimeConfigSaving || loading}
                        >
                          平衡
                        </button>
                        <button
                          type="button"
                          className={runtimeWatchdog?.mode === "peak" ? "runtime-mode-btn is-active" : "runtime-mode-btn"}
                          title={runtimeModeHint("peak", runtimeModeQueueLimitMap.get("peak") ?? 6)}
                          onClick={() => void switchRuntimeGuardianMode("peak")}
                          disabled={runtimeHealing || runtimeConfigSaving || loading}
                        >
                          高峰
                        </button>
                      </div>
                      <p className="autonomy-meta">
                        API {runtimeHealth?.runtime?.api?.status || "unknown"} · Bridge {runtimeHealth?.runtime?.bridge?.status || "unknown"} ·
                        队列积压 {runtimeHealth?.runtime?.queue?.pending ?? 0} · dead-letter {runtimeHealth?.runtime?.queue?.deadLetters ?? 0}
                      </p>
                      <p className="autonomy-meta">
                        自动巡检 {runtimeWatchdog?.enabled === false ? "已暂停" : "已启用"} ·
                        模式 {runtimeWatchdog?.modeLabel || runtimeWatchdog?.mode || "balanced"} ·
                        单轮队列上限 {runtimeWatchdog?.queueLimit ?? 0}
                      </p>
                      <p className="autonomy-meta">
                        SLO：失败率 {ratioToPercent(runtimeSlo?.failureRate ?? 0)} · 慢请求占比 {ratioToPercent(runtimeSlo?.slowRate ?? 0)} ·
                        状态 {runtimeSlo?.status || "unknown"}
                      </p>
                      {runtimeOutage ? (
                        <div className={`runtime-outage-banner status-${runtimeOutage.status}`}>
                          <strong>{runtimeOutage.summary}</strong>
                          <p>{runtimeOutage.recommendation}</p>
                        </div>
                      ) : (
                        <p className="memory-empty">正在拉取 Runtime Guardian 状态...</p>
                      )}
                      <div className="runtime-failure-grid">
                        {runtimeFailureLayers.map((layer) => (
                          <article key={`runtime-failure-${layer.id}`} className="runtime-failure-item">
                            <strong>{layer.label} · {layer.count}</strong>
                            <p>{layer.hint}</p>
                            <small>{layer.examples[0] || "暂无样本，当前链路稳定"}</small>
                          </article>
                        ))}
                        {runtimeFailureLayers.length === 0 ? (
                          <p className="memory-empty">暂无系统失败样本，等待首次巡检结果。</p>
                        ) : null}
                      </div>
                      <div className="runtime-incident-playbook">
                        <div className="runtime-incident-head">
                          <p className="engagement-title">Aria Kernel 防复发手册</p>
                          <button
                            type="button"
                            onClick={() => void rememberIncidentGuardrails()}
                            disabled={incidentGuardrailSaving || runtimeHealing || loading}
                          >
                            {incidentGuardrailSaving ? "写入中..." : "一键写入记忆守则"}
                          </button>
                        </div>
                        <p className="autonomy-meta">
                          手册版本 {runtimeIncidentPlaybook?.version || "unknown"} · 命中 {runtimeIncidentPlaybook?.matchedCount ?? 0}/{runtimeIncidentPlaybook?.totalIncidents ?? 0}
                        </p>
                        <div className="runtime-incident-grid">
                          {runtimeIncidentMatches.map((item) => (
                            <article key={`runtime-incident-${item.id}`} className="runtime-incident-item">
                              <strong>{item.title} · {item.hitCount} 次</strong>
                              <p>{item.guardrail || item.rootCause || "建议优先执行健康检查并开启重试保护。"}</p>
                              <small>{item.samples[0] || "暂无样本"}</small>
                              <button
                                type="button"
                                onClick={() => void rememberIncidentGuardrails(item.id)}
                                disabled={incidentGuardrailSaving || runtimeHealing || loading}
                              >
                                写入该守则
                              </button>
                            </article>
                          ))}
                          {runtimeIncidentMatches.length === 0 ? (
                            <p className="memory-empty">暂无命中故障，系统会持续跟踪并沉淀守则。</p>
                          ) : null}
                        </div>
                        {runtimeIncidentRecommendations.length > 0 ? (
                          <div className="runtime-incident-recommendations">
                            {runtimeIncidentRecommendations.slice(0, 4).map((item, index) => (
                              <p key={`runtime-incident-rec-${index}`}>{item}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="runtime-watchdog-meta">
                        <span>Watchdog 轮询 {runtimeWatchdog?.tickCount ?? 0} 次</span>
                        <span>冷却剩余 {Math.max(0, Math.round((runtimeWatchdog?.cooldownRemainingMs || 0) / 1000))} 秒</span>
                        <span>最近探针 {runtimeWatchdog?.lastProbeStatus || "unknown"}</span>
                      </div>
                      <p className="runtime-self-heal-tip">
                        最近自愈：{
                          runtimeSelfHealReport
                            ? `${runtimeActionLabel(runtimeSelfHealReport.action)} · ${runtimeSelfHealReport.summary}`
                            : runtimeWatchdog?.lastSelfHealSummary || "暂无自愈动作"
                        }
                      </p>
                      <p className="runtime-self-heal-tip">
                        最近跳过：{runtimeSkipReasonLabel(runtimeWatchdog?.skippedReason || "")}
                      </p>
                      <p className="runtime-self-heal-tip">
                        最近手动动作：{
                          runtimeWatchdog?.lastManualAction
                            ? `${runtimeActionLabel(runtimeWatchdog.lastManualAction)} · ${runtimeActionStatusLabel(runtimeWatchdog.lastManualActionStatus)}`
                            : "暂无手动动作记录"
                        }{runtimeWatchdog?.lastManualActionSummary ? ` · ${runtimeWatchdog.lastManualActionSummary}` : ""}
                      </p>
                      <p className="runtime-self-heal-tip">
                        最近配置变更：{runtimeWatchdog?.lastConfigChangeSummary || "暂无配置变更"}
                      </p>
                    </div>
                    <div className="autonomy-failure-panel">
                      <p className="engagement-title">任务执行失败根因（自治层）</p>
                      <div className="autonomy-failure-grid">
                        {autonomyFailureLayers.map((layer) => (
                          <article key={`failure-${layer.id}`} className="autonomy-failure-item">
                            <strong>{layer.label} · {layer.count}</strong>
                            <p>{layer.hint}</p>
                            <small>{layer.examples[0] || "暂无样本"}</small>
                          </article>
                        ))}
                        {autonomyFailureLayers.length === 0 ? (
                          <p className="memory-empty">暂无失败样本，当前链路稳定。</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="autonomy-inbox">
                      {autonomyInbox.length === 0 ? (
                        <p className="memory-empty">暂无自主建议队列。</p>
                      ) : (
                        autonomyInbox.slice(0, 3).map((item) => (
                          <article key={item.id} className="autonomy-item">
                            <h3>{item.title}</h3>
                            <p>{item.message}</p>
                            <button type="button" onClick={() => void consumeAutonomyInboxItem(item)}>接收并确认</button>
                          </article>
                        ))
                      )}
                    </div>
                    <details className="workbench-feed-toggle">
                      <summary>查看异常死信（{autonomyQueueDeadLetters}）</summary>
                      <div className="autonomy-deadletters">
                        {autonomyQueueDeadLetterPreview.length === 0 ? (
                          <p className="memory-empty">暂无 dead-letter，重试链路稳定。</p>
                        ) : (
                          autonomyQueueDeadLetterPreview.map((item) => (
                            <article key={item.id} className="autonomy-deadletter-item">
                              <div>
                                <strong>{queueOperationLabel(String(item.operation?.type || ""))} · 已尝试 {item.attempts}/{item.maxAttempts}</strong>
                                <p>{item.lastError || item.lastSummary || "未知错误"}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void triggerDeadLetterRetry(item)}
                                disabled={autonomyQueueBusyId === item.id || autonomyLoading || loading}
                              >
                                {autonomyQueueBusyId === item.id ? "处理中..." : "重新入队"}
                              </button>
                            </article>
                          ))
                        )}
                      </div>
                    </details>
                    <details className="workbench-feed-toggle">
                      <summary>统一任务时间线（提交 → 执行 → 重试 → 完成）</summary>
                      <div className="autonomy-flow-list">
                        {timelineFlowPreview.length === 0 ? (
                          <p className="memory-empty">暂无任务链，可先在工作场景提交目标。</p>
                        ) : (
                          timelineFlowPreview.map((flow) => (
                            <article key={`flow-${flow.flowId}`} className="autonomy-flow-item">
                              <div>
                                <strong>{flow.flowId}</strong>
                                <p>{flow.sources.join(" / ")} · {flow.total} 事件 · 错误 {flow.errors}</p>
                              </div>
                              <div className="autonomy-flow-actions">
                                <button
                                  type="button"
                                  onClick={() => void replayTimelineFlow(flow.flowId)}
                                  disabled={timelineLoading}
                                >
                                  回放
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void repairTimelineFlow(flow.flowId, "auto")}
                                  disabled={timelineLoading || timelineRepairingFlowId === flow.flowId}
                                >
                                  {timelineRepairingFlowId === flow.flowId ? "修复中..." : "一键修复"}
                                </button>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                      <div className="autonomy-timeline">
                        {autonomyTimelinePreview.length === 0 ? (
                          <p className="memory-empty">暂无时间线事件，请先在工作场景提交任务。</p>
                        ) : (
                          autonomyTimelinePreview.map((event) => (
                            <article key={event.id} className="autonomy-timeline-item">
                              <div className="autonomy-timeline-head">
                                <strong>{event.title}</strong>
                                <span>{timelineStatusLabel(event.status)}</span>
                              </div>
                              <p>{event.detail || event.stage}</p>
                              <small>
                                {event.flowId ? `${event.flowId} · ` : ""}
                                {new Date(event.at).toLocaleString()}
                              </small>
                            </article>
                          ))
                        )}
                      </div>
                      {timelineReplayState ? (
                        <div className="autonomy-replay-card">
                          <p className="engagement-title">任务链回放：{timelineReplayState.flowId}</p>
                          <p className="autonomy-meta">
                            状态 {timelineReplayState.summary.status} · 事件 {timelineReplayState.summary.total}
                            · 来源 {timelineReplayState.summary.sources.join(" / ") || "unknown"}
                          </p>
                          {timelineDiagnosisState && timelineDiagnosisState.flowId === timelineReplayState.flowId ? (
                            <div className="timeline-diagnosis-card">
                              <div className="timeline-diagnosis-head">
                                <strong>任务图编排（依赖可视化）</strong>
                                <span>
                                  节点 {timelineDiagnosisState.graph.stats.totalNodes} · 依赖 {timelineDiagnosisState.graph.stats.totalEdges}
                                </span>
                              </div>
                              <div className="timeline-graph-nodes">
                                {timelineDiagnosisState.graph.nodes.slice(0, 10).map((node) => (
                                  <article key={`graph-node-${node.id}`} className={`timeline-graph-node status-${node.status}`}>
                                    <strong>{node.index}. {node.title}</strong>
                                    <p>{queueOperationLabel(node.type)} · {timelineStatusLabel(node.status)}</p>
                                    <small>{node.reason || "执行中未返回原因"}</small>
                                  </article>
                                ))}
                                {timelineDiagnosisState.graph.nodes.length === 0 ? (
                                  <p className="memory-empty">暂无图节点，等待任务事件回流。</p>
                                ) : null}
                              </div>
                              <div className="timeline-root-cause-list">
                                <p className="engagement-title">失败根因面板（网络 / 权限 / 策略 / 执行）</p>
                                {timelineDiagnosisState.rootCauses.length === 0 ? (
                                  <p className="memory-empty">当前任务链无明显失败根因。</p>
                                ) : (
                                  timelineDiagnosisState.rootCauses.map((layer) => (
                                    <article key={`cause-${layer.layerId}`} className="timeline-root-cause-item">
                                      <strong>{layer.layerLabel} · {layer.count}</strong>
                                      <p>{layer.hint}</p>
                                      <small>{layer.samples[0] || "暂无样本"}</small>
                                    </article>
                                  ))
                                )}
                              </div>
                              <div className="timeline-repair-actions">
                                <button
                                  type="button"
                                  onClick={() => void repairTimelineFlow(timelineReplayState.flowId, "auto")}
                                  disabled={timelineRepairingFlowId === timelineReplayState.flowId || timelineLoading}
                                >
                                  {timelineRepairingFlowId === timelineReplayState.flowId ? "修复中..." : "一键重放修复"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void repairTimelineFlow(timelineReplayState.flowId, "queue_replay")}
                                  disabled={timelineRepairingFlowId === timelineReplayState.flowId || timelineLoading}
                                >
                                  仅重放失败步骤
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void repairTimelineFlow(timelineReplayState.flowId, "rerun_dispatch")}
                                  disabled={timelineRepairingFlowId === timelineReplayState.flowId || timelineLoading}
                                >
                                  重跑整条任务链
                                </button>
                              </div>
                              <p className="autonomy-meta">
                                推荐动作：{timelineDiagnosisState.suggestedRepair.label} · {timelineDiagnosisState.suggestedRepair.reason}
                              </p>
                            </div>
                          ) : null}
                          <div className="autonomy-replay-list">
                            {timelineReplayState.events.slice(0, 10).map((event) => (
                              <article key={`replay-${event.id}`} className="autonomy-replay-item">
                                <strong>{event.stage}</strong>
                                <p>{event.detail || event.title}</p>
                                <small>{new Date(event.at).toLocaleString()}</small>
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </details>
                  </section>

                  <section className="capability-audit-card">
                    <div className="workday-head">
                      <p className="engagement-title">三方能力注入评估（已产品化）</p>
                      <button type="button" onClick={() => void syncCapabilityAudit()} disabled={autonomyLoading || loading}>
                        刷新评估
                      </button>
                    </div>
                    <p className="autonomy-meta">
                      独立运营评分 {capabilityAssessment?.independenceScore ?? 0}% · 状态 {capabilityAssessment?.independent ? "可独立运行" : "持续增强中"}
                    </p>
                    <div className="injected-capability-grid">
                      {(capabilityAssessment?.cores || []).map((core) => {
                        const entry = capabilityCoreEntryMap[core.id];
                        const readyCount = core.abilities.filter((item) => item.status === "ready").length;
                        return (
                          <button
                            key={`core-${core.id}`}
                            type="button"
                            className="injected-capability-item"
                            onClick={() => openPanel(entry.panel, entry.scene)}
                          >
                            <span>{core.owner}</span>
                            <strong>{core.name} · {core.score}%</strong>
                            <small>{core.summary}</small>
                            <em>{core.state} · 已落地 {readyCount}/{core.abilities.length}</em>
                          </button>
                        );
                      })}
                    </div>
                    <details className="workbench-feed-toggle">
                      <summary>查看最近调度回执</summary>
                      <div className="workbench-feed">
                        {(autonomyState?.dispatch?.history || []).slice(0, 4).map((item) => (
                          <article key={item.id} className="workbench-feed-item">
                            <div className="workbench-feed-head">
                              <strong>{item.status} · {item.kernel}</strong>
                              <span>{item.steps.length} steps</span>
                            </div>
                            <p>{item.prompt}</p>
                          </article>
                        ))}
                        {!(autonomyState?.dispatch?.history || []).length ? (
                          <p className="memory-empty">暂无调度历史，先在工作场景输入任务试试。</p>
                        ) : null}
                      </div>
                    </details>
                  </section>

                  {/* Engagement card */}
                  {engagement && (
                    <section className="engagement-card">
                      <p className="engagement-title">成长进度</p>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: `${levelProgress(engagement)}%` }} />
                      </div>
                      <p className="engagement-meta">
                        今日消息 {engagement.today.messageCount} 条 · 签到{engagement.today.checkinDone ? "已完成" : "未完成"} · 微任务{engagement.today.questCompleted ? "已完成" : "未完成"}
                      </p>
                      <div className="engagement-actions">
                        <button type="button" onClick={() => void triggerEngagement("daily_checkin")} disabled={syncing || engagement.today.checkinDone}>
                          {engagement.today.checkinDone ? "今日已签到" : "完成今日签到"}
                        </button>
                        <button type="button" onClick={() => void triggerEngagement("quest_complete")} disabled={syncing || engagement.today.questCompleted}>
                          {engagement.today.questCompleted ? "微任务已完成" : "完成微任务"}
                        </button>
                      </div>
                    </section>
                  )}

                  <div className="memory-actions">
                    <button type="button" onClick={() => void loadState()} disabled={loading || syncing}>刷新</button>
                    <button type="button" onClick={() => void resetState()} disabled={loading || syncing}>重置</button>
                  </div>
                </div>
              )}

              {/* ── Brain Tab ── */}
              {rightPanel === "brain" && (
                <div className="side-panel-content">
                  <h2>🧠 超级脑图（6 模块）</h2>

                  <section className="brain-surface-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">点击图像按钮进入模块</p>
                      <span>小白可读</span>
                    </div>
                    <div className="brain-surface-grid">
                      {(Object.entries(brainModuleMeta) as Array<[BrainModuleKey, typeof brainModuleMeta[BrainModuleKey]]>).map(([key, item]) => (
                        <button
                          key={`surface-${key}`}
                          type="button"
                          className={`brain-image-btn ${activeBrainModule === key ? "active" : ""}`}
                          onClick={() => setActiveBrainModule(key)}
                        >
                          <span className="brain-image-icon">{item.icon}</span>
                          <strong>{item.title}</strong>
                          <small>{item.nonTech}</small>
                          <span className="brain-image-score">{brainModuleScores[key]}%</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="brain-detail-panel">
                    <div className="brain-detail-head">
                      <h3>{brainModuleMeta[activeBrainModule].title}</h3>
                      <span>{brainModuleScores[activeBrainModule]}%</span>
                    </div>
                    <p>{brainModuleDetail[activeBrainModule].plain}</p>
                    <div className="brain-detail-steps">
                      {brainModuleDetail[activeBrainModule].steps.map((step) => (
                        <span key={`${activeBrainModule}-${step}`}>{step}</span>
                      ))}
                    </div>
                    <div className="brain-detail-actions">
                      <button type="button" onClick={() => openPanel(brainModuleMeta[activeBrainModule].focusPanel, activeScene)}>
                        {brainModuleDetail[activeBrainModule].entryLabel}
                      </button>
                      <button type="button" onClick={() => void loadState()}>
                        执行全链路同步检查
                      </button>
                    </div>
                    {(error.includes("无法连接 Aria API") || streamError.includes("无法连接 Aria API")) ? (
                      <p className="brain-detail-warning">
                        当前同步失败：请先启动运行时 `bash scripts/dev-runtime.sh`，再点“执行全链路同步检查”。
                      </p>
                    ) : null}
                  </section>

                  <section className="brain-policy-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">脑系统策略配置（实时连后端）</p>
                      <span>{systemConfigState?.runtime?.versions?.modelRouting || "未加载"}</span>
                    </div>
                    <p className="workday-meta">
                      这部分直接读写 `GET/POST /v1/system/config`，保存后会立刻影响模型路由和场景策略。
                    </p>
                    <div className="super-ops-section">
                      <div className="super-ops-head">
                        <strong>Legacy 兼容桥接开关</strong>
                        <span>{legacyCompatBridgeState.enabled ? "迁移保护中" : "纯净模式"}</span>
                      </div>
                      <p className="workday-meta">
                        当前状态：{legacyCompatBridgeState.enabled ? "开启（兼容 openclaw 旧字段）" : "关闭（仅接受 aria-kernel 字段）"}
                        {" "}· 来源：{legacyCompatBridgeState.source === "localStorage" ? "本机配置" : "环境默认"}。
                      </p>
                      <div className="super-ops-presets">
                        <button
                          type="button"
                          className={legacyCompatBridgeState.enabled ? "active" : ""}
                          onClick={() => void applyLegacyCompatBridgeToggle(true)}
                          disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || legacyCompatApplying}
                        >
                          开启兼容桥接（推荐迁移期）
                        </button>
                        <button
                          type="button"
                          className={!legacyCompatBridgeState.enabled ? "active" : ""}
                          onClick={() => void applyLegacyCompatBridgeToggle(false)}
                          disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || legacyCompatApplying}
                        >
                          关闭兼容桥接（纯净模式）
                        </button>
                        <button
                          type="button"
                          onClick={() => void rollbackLegacyCompatBridgeToggle()}
                          disabled={
                            systemConfigLoading
                            || systemConfigSaving
                            || systemConfigRollbacking
                            || legacyCompatApplying
                            || legacyCompatRollbackTarget === null
                          }
                        >
                          {legacyCompatApplying ? "处理中..." : "回滚到上一个可用版本"}
                        </button>
                      </div>
                      <div className="super-ops-guide-grid">
                        <article className="super-ops-guide-item">
                          <strong>风险说明</strong>
                          <small>关闭兼容桥接后，旧字段不再自动映射。</small>
                          <p>若后端或插件仍输出 `openclaw*` 字段，前端显示可能缺项或空白。</p>
                          <em>建议先在灰度环境验证，再全量关闭。</em>
                        </article>
                        <article className="super-ops-guide-item">
                          <strong>推荐策略</strong>
                          <small>迁移期：开启；收口期：关闭。</small>
                          <p>当接口和配置全部完成 `aria-kernel` 化，再切换到纯净模式。</p>
                          <em>切换后建议立刻点击“刷新策略”检查字段完整性。</em>
                        </article>
                        <article className="super-ops-guide-item">
                          <strong>回滚机制</strong>
                          <small>本地即时回滚，不改后端数据。</small>
                          <p>可一键恢复到上一个可用状态，避免因字段迁移造成页面不可用。</p>
                          <em>回滚后会自动重新拉取系统配置。</em>
                        </article>
                      </div>
                    </div>
                    <div className="brain-policy-grid">
                      <label>
                        <span>默认模型路由</span>
                        <select
                          value={systemDefaultRouteDraft}
                          onChange={(event) => setSystemDefaultRouteDraft(event.target.value)}
                          disabled={systemConfigLoading || systemConfigSaving || systemProviderOptions.length === 0}
                        >
                          {systemProviderOptions.map((provider) => (
                            <option key={`route-default-${provider.id}`} value={provider.id}>
                              {provider.id} · {provider.model}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>降级模型路由</span>
                        <select
                          value={systemFallbackRouteDraft}
                          onChange={(event) => setSystemFallbackRouteDraft(event.target.value)}
                          disabled={systemConfigLoading || systemConfigSaving || systemProviderOptions.length === 0}
                        >
                          {systemProviderOptions.map((provider) => (
                            <option key={`route-fallback-${provider.id}`} value={provider.id}>
                              {provider.id} · {provider.model}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>路由超时(ms)</span>
                        <input
                          type="number"
                          min={1000}
                          max={120000}
                          value={systemDegradeTimeoutDraft}
                          onChange={(event) => setSystemDegradeTimeoutDraft(Number(event.target.value || 0))}
                          disabled={systemConfigLoading || systemConfigSaving}
                        />
                      </label>
                      <label>
                        <span>最大重试</span>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          value={systemDegradeRetryDraft}
                          onChange={(event) => setSystemDegradeRetryDraft(Number(event.target.value || 0))}
                          disabled={systemConfigLoading || systemConfigSaving}
                        />
                      </label>
                      <label>
                        <span>Aria 人格强度</span>
                        <select
                          value={personaIntensityLevelDraft}
                          onChange={(event) => setPersonaIntensityLevelDraft(
                            parsePersonaIntensityLevel(event.target.value, "L2")
                          )}
                          disabled={systemConfigLoading || systemConfigSaving}
                        >
                          {PERSONA_INTENSITY_LEVEL_OPTIONS.map((option) => (
                            <option key={`persona-level-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <p className="workday-meta">
                      当前档位说明：
                      {" "}
                      {
                        PERSONA_INTENSITY_LEVEL_OPTIONS.find(
                          (option) => option.value === personaIntensityLevelDraft
                        )?.hint || "目标闭环、主动跟进，默认推荐。"
                      }
                    </p>
                    <div className="brain-policy-scene">
                      <strong>启用场景</strong>
                      <div>
                        {(Object.keys(sceneMeta) as SceneKey[]).map((scene) => (
                          <button
                            key={`scene-toggle-${scene}`}
                            type="button"
                            className={systemEnabledScenesDraft.includes(scene) ? "active" : ""}
                            onClick={() => toggleEnabledSceneDraft(scene)}
                            disabled={systemConfigLoading || systemConfigSaving}
                          >
                            {sceneMeta[scene].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="brain-policy-routes">
                      <div className="brain-policy-routes-head">
                        <strong>闭环内置能力入口（已接后端配置）</strong>
                        <span>对应脑系统/记忆/学习/硬件四条主链，保存后即时生效</span>
                      </div>
                      <div className="brain-policy-grid">
                        <label>
                          <span>目标确认阈值(0-1)</span>
                          <input
                            type="number"
                            min={0.4}
                            max={0.95}
                            step={0.01}
                            value={goalClarifyThresholdDraft}
                            onChange={(event) => setGoalClarifyThresholdDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>权威学习定时(CRON)</span>
                          <input
                            type="text"
                            value={authorityLearningCronDraft}
                            onChange={(event) => setAuthorityLearningCronDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving}
                            placeholder="0 */6 * * *"
                          />
                        </label>
                        <label>
                          <span>反馈学习定时(CRON)</span>
                          <input
                            type="text"
                            value={feedbackDigestCronDraft}
                            onChange={(event) => setFeedbackDigestCronDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving}
                            placeholder="*/30 * * * *"
                          />
                        </label>
                        <label>
                          <span>跨场景联想 TopK</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={crossSceneRecallTopKDraft}
                            onChange={(event) => setCrossSceneRecallTopKDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>上下文升入长期阈值</span>
                          <input
                            type="number"
                            min={0.4}
                            max={0.95}
                            step={0.01}
                            value={contextImportanceThresholdDraft}
                            onChange={(event) => setContextImportanceThresholdDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>MCP 浏览执行</span>
                          <select
                            value={mcpBrowserRuntimeEnabledDraft ? "on" : "off"}
                            onChange={(event) => setMcpBrowserRuntimeEnabledDraft(event.target.value === "on")}
                            disabled={systemConfigLoading || systemConfigSaving}
                          >
                            <option value="on">开启（推荐）</option>
                            <option value="off">关闭</option>
                          </select>
                        </label>
                        <label>
                          <span>GitHub 官方技能发现</span>
                          <select
                            value={githubSkillDiscoveryEnabledDraft ? "on" : "off"}
                            onChange={(event) => setGithubSkillDiscoveryEnabledDraft(event.target.value === "on")}
                            disabled={systemConfigLoading || systemConfigSaving}
                          >
                            <option value="on">开启（推荐）</option>
                            <option value="off">关闭</option>
                          </select>
                        </label>
                        <label>
                          <span>语音能力</span>
                          <select
                            value={voiceEnabledDraft ? "on" : "off"}
                            onChange={(event) => setVoiceEnabledDraft(event.target.value === "on")}
                            disabled={systemConfigLoading || systemConfigSaving}
                          >
                            <option value="on">开启</option>
                            <option value="off">关闭</option>
                          </select>
                        </label>
                        <div className="brain-policy-voice-preset-panel">
                          <div className="brain-policy-voice-preset-head">
                            <span>音色一键切换</span>
                            <button
                              type="button"
                              onClick={() => void syncVoiceProfile()}
                              disabled={voiceProfileLoading || voicePresetSaving || systemConfigLoading || systemConfigSaving}
                            >
                              {voiceProfileLoading ? "同步中..." : "刷新"}
                            </button>
                          </div>
                          <div className="brain-policy-voice-preset-grid">
                            {voicePresetOptions.map((preset) => (
                              <button
                                key={`voice-preset-${preset.id}`}
                                type="button"
                                className={`brain-policy-voice-preset-btn ${voicePresetDraftId === preset.id ? "is-active" : ""}`.trim()}
                                onClick={() => void applyVoicePreset(preset.id)}
                                disabled={voiceProfileLoading || voicePresetSaving || !voiceEnabledDraft}
                              >
                                <strong>{preset.label}</strong>
                                <small>{preset.voice} · 语速 {preset.rate}</small>
                              </button>
                            ))}
                          </div>
                          <small className="brain-policy-voice-preset-meta">
                            {voicePresetSaving
                              ? "正在切换音色..."
                              : `当前默认：${activeVoicePreset?.label || voiceProfileState?.defaultVoice || "未加载"}${voiceProfileState ? `（${voiceProfileState.defaultVoice} · 语速 ${voiceProfileState.defaultRate}）` : ""}`}
                          </small>
                        </div>
                        <label>
                          <span>蓝牙接入</span>
                          <select
                            value={bluetoothEnabledDraft ? "on" : "off"}
                            onChange={(event) => setBluetoothEnabledDraft(event.target.value === "on")}
                            disabled={systemConfigLoading || systemConfigSaving}
                          >
                            <option value="on">开启</option>
                            <option value="off">关闭</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="brain-policy-routes">
                      <div className="brain-policy-routes-head">
                        <strong>任务级路由策略</strong>
                        <span>点击选择 provider，并上下调整优先级；保存后即时生效</span>
                      </div>
                      <div className="brain-policy-route-list">
                        {systemTaskRouteEntries.map(([taskType, providerDraft]) => (
                          <article key={`route-${taskType}`} className="brain-policy-route-item">
                            <div className="brain-policy-route-item-head">
                              <label>
                                <span>任务类型</span>
                                <input type="text" value={taskRouteDisplayLabel(taskType)} disabled />
                              </label>
                              <button
                                type="button"
                                onClick={() => applyDefaultTaskRoute(taskType)}
                                disabled={systemConfigLoading || systemConfigSaving || !systemDefaultRouteDraft.trim()}
                              >
                                用默认路由
                              </button>
                            </div>
                            {parseProviderRouteDraft(providerDraft).length > 0 ? (
                              <div className="brain-policy-route-pill-list">
                                {parseProviderRouteDraft(providerDraft).map((providerId, index, items) => {
                                  const provider = systemProviderMap.get(providerId);
                                  return (
                                    <article key={`task-route-${taskType}-${providerId}-${index}`} className="brain-policy-route-pill">
                                      <span className="brain-policy-route-pill-order">{index + 1}</span>
                                      <div>
                                        <strong>{providerId}</strong>
                                        <small>{provider?.model || "未注册模型"}</small>
                                      </div>
                                      <div className="brain-policy-route-pill-actions">
                                        <button
                                          type="button"
                                          onClick={() => moveTaskRouteProvider(taskType, providerId, "up")}
                                          disabled={systemConfigLoading || systemConfigSaving || index === 0}
                                          aria-label={`上移 ${providerId}`}
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveTaskRouteProvider(taskType, providerId, "down")}
                                          disabled={systemConfigLoading || systemConfigSaving || index === items.length - 1}
                                          aria-label={`下移 ${providerId}`}
                                        >
                                          ↓
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeTaskRouteProvider(taskType, providerId)}
                                          disabled={systemConfigLoading || systemConfigSaving}
                                          aria-label={`移除 ${providerId}`}
                                        >
                                          移除
                                        </button>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="memory-empty">当前任务暂无 provider，先从下方下拉框添加。</p>
                            )}
                            <div className="brain-policy-route-inline-add">
                              <label>
                                <span>添加 Provider（按顺序追加）</span>
                                <select
                                  defaultValue=""
                                  disabled={systemConfigLoading || systemConfigSaving || systemProviderOptions.length === 0}
                                  onChange={(event) => {
                                    const providerId = event.target.value.trim();
                                    if (!providerId) return;
                                    addTaskRouteProvider(taskType, providerId);
                                    event.currentTarget.value = "";
                                  }}
                                >
                                  <option value="">请选择 provider...</option>
                                  {systemProviderOptions.map((provider) => (
                                    <option
                                      key={`route-add-${taskType}-${provider.id}`}
                                      value={provider.id}
                                      disabled={parseProviderRouteDraft(providerDraft).includes(provider.id)}
                                    >
                                      {provider.id} · {provider.model}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span>可视化预览</span>
                                <input type="text" value={providerDraft} disabled />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTaskRouteDraft(taskType)}
                              disabled={systemConfigLoading || systemConfigSaving}
                            >
                              删除任务路由
                            </button>
                          </article>
                        ))}
                        {systemTaskRouteEntries.length === 0 ? (
                          <p className="memory-empty">暂无任务路由，请新增任务类型后配置。</p>
                        ) : null}
                      </div>
                      <div className="brain-policy-route-add">
                        <input
                          type="text"
                          value={systemTaskRouteKeyDraft}
                          onChange={(event) => setSystemTaskRouteKeyDraft(event.target.value)}
                          disabled={systemConfigLoading || systemConfigSaving}
                          placeholder="新增任务类型，例如 coding_review"
                        />
                        <button
                          type="button"
                          onClick={addTaskRouteDraft}
                          disabled={systemConfigLoading || systemConfigSaving || !systemTaskRouteKeyDraft.trim()}
                        >
                          新增任务
                        </button>
                      </div>
                      <div className="brain-policy-route-save">
                        <button
                          type="button"
                          onClick={() => void saveModelRoutingQuick()}
                          disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking}
                        >
                          {systemConfigSaving ? "保存中..." : "仅保存模型路由（即时生效）"}
                        </button>
                      </div>
                    </div>
                    <div className="super-ops-section">
                      <div className="super-ops-head">
                        <strong>独立运营策略台（小白模式）</strong>
                        <span>不改代码，直接改运行策略</span>
                      </div>
                      <div className="super-ops-operator-grid">
                        <label>
                          <span>本次修改人</span>
                          <input
                            type="text"
                            value={configOperatorNameDraft}
                            onChange={(event) => setConfigOperatorNameDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking}
                            placeholder="例如：运营负责人"
                          />
                        </label>
                        <label>
                          <span>修改目的（给未来自己看）</span>
                          <input
                            type="text"
                            value={configChangeReasonDraft}
                            onChange={(event) => setConfigChangeReasonDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking}
                            placeholder="例如：降低失败重试风暴"
                          />
                        </label>
                      </div>
                      <div className="super-ops-presets">
                        <button
                          type="button"
                          onClick={() => applyOpsPreset("safe")}
                          disabled={systemConfigLoading || systemConfigSaving}
                        >
                          稳态运营
                        </button>
                        <button
                          type="button"
                          onClick={() => applyOpsPreset("balanced")}
                          disabled={systemConfigLoading || systemConfigSaving}
                        >
                          日常平衡
                        </button>
                        <button
                          type="button"
                          onClick={() => applyOpsPreset("aggressive")}
                          disabled={systemConfigLoading || systemConfigSaving}
                        >
                          冲刺吞吐
                        </button>
                      </div>
                      <div className="super-ops-guide-grid">
                        {superOpsGuideCards.map((item) => (
                          <article key={`guide-${item.key}`} className="super-ops-guide-item">
                            <strong>{item.title}</strong>
                            <small>推荐值：{item.recommended}</small>
                            <p>风险：{item.risk}</p>
                            <em>{item.plain}</em>
                          </article>
                        ))}
                      </div>
                      <div className="super-ops-grid">
                        <label>
                          <span>自治任务回退优先级</span>
                          <input
                            type="text"
                            value={autonomyDispatchRouteDraft}
                            onChange={(event) => setAutonomyDispatchRouteDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving}
                            placeholder="code-specialist, companion-fallback"
                          />
                        </label>
                        <label>
                          <span>任务重试预算(次)</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={superQueueRetryBudgetDraft}
                            onChange={(event) => setSuperQueueRetryBudgetDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>重试退避(ms)</span>
                          <input
                            type="number"
                            min={100}
                            max={60000}
                            value={superQueueBackoffDraft}
                            onChange={(event) => setSuperQueueBackoffDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>熔断阈值(失败次数)</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={superCircuitFailureDraft}
                            onChange={(event) => setSuperCircuitFailureDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>熔断冷却(ms)</span>
                          <input
                            type="number"
                            min={1000}
                            max={600000}
                            value={superCircuitCooldownDraft}
                            onChange={(event) => setSuperCircuitCooldownDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>长任务阈值(秒)</span>
                          <input
                            type="number"
                            min={3}
                            max={120}
                            value={fusionLongTaskThresholdDraft}
                            onChange={(event) => setFusionLongTaskThresholdDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>进度回报间隔(秒)</span>
                          <input
                            type="number"
                            min={5}
                            max={300}
                            value={fusionProgressIntervalDraft}
                            onChange={(event) => setFusionProgressIntervalDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                        <label>
                          <span>阻塞上报间隔(秒)</span>
                          <input
                            type="number"
                            min={5}
                            max={300}
                            value={fusionBlockReportDraft}
                            onChange={(event) => setFusionBlockReportDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving}
                          />
                        </label>
                      </div>
                      <div className="super-skill-required-list">
                        {superSkillDraftEntries.length === 0 ? (
                          <p className="memory-empty">暂无技能配置，点击“刷新策略”拉取。</p>
                        ) : (
                          superSkillDraftEntries.map((skill) => (
                            <article key={`super-skill-${skill.id}`} className="super-skill-required-item">
                              <div>
                                <strong>{skill.name}</strong>
                                <small>{skill.source} · {skill.id}</small>
                              </div>
                              <div className="super-skill-required-actions">
                                <button
                                  type="button"
                                  className={skill.required ? "active" : ""}
                                  onClick={() => setSuperSkillRequired(skill.id, true)}
                                  disabled={systemConfigLoading || systemConfigSaving}
                                >
                                  必需
                                </button>
                                <button
                                  type="button"
                                  className={!skill.required ? "active" : ""}
                                  onClick={() => setSuperSkillRequired(skill.id, false)}
                                  disabled={systemConfigLoading || systemConfigSaving}
                                >
                                  可选
                                </button>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                      <p className="workday-meta">
                        小白口诀：先用“日常平衡”预设，再微调 1-2 个参数，保存后观察 1 天再继续调。
                      </p>
                    </div>
                    <div className="brain-policy-runtime">
                      <article>
                        <strong>Aria Kernel 密钥桥</strong>
                        <span>
                          {systemConfigState?.modelRouterRuntime?.ariaKernel?.ok
                            ? "已连接"
                            : "未连接"}
                        </span>
                        <em>
                          {(systemConfigState?.modelRouterRuntime?.ariaKernel?.ok
                            ? `已发现 ${(systemConfigState?.modelRouterRuntime?.ariaKernel?.providerCount || 0)} 个 provider`
                            : `未检测到 Aria Kernel 配置：${systemConfigState?.modelRouterRuntime?.ariaKernel?.reason || "config_missing"}`)}
                        </em>
                      </article>
                      {(systemConfigState?.modelRouterRuntime?.providerRuntimes || []).map((provider) => (
                        <article key={`runtime-${provider.id}`}>
                          <strong>{provider.id}</strong>
                          <span>{provider.model}</span>
                          <em>
                            {provider.apiKeyConfigured
                              ? `API Key 已就绪 · 来源 ${provider.authSource || "unknown"}`
                              : "缺少 API Key（将自动降级）"}
                            {provider.ariaKernelProvider
                              ? ` · Aria Kernel:${provider.ariaKernelProvider}`
                              : ""}
                          </em>
                        </article>
                      ))}
                      {(systemConfigState?.modelRouterRuntime?.providerRuntimes || []).length === 0 ? (
                        <p className="memory-empty">暂无模型运行时信息，点击下方“刷新策略”加载。</p>
                      ) : null}
                    </div>
                    <div className="brain-memory-runtime">
                      <div className="brain-memory-runtime-head">
                        <strong>记忆平面实时状态卡</strong>
                        <span>{memoryPlaneVectorMode === "qdrant" ? "外部向量模式" : "本地向量模式"}</span>
                      </div>
                      <div className="brain-memory-config">
                        <label>
                          <span>向量后端模式</span>
                          <select
                            value={vectorBackendModeDraft}
                            onChange={(event) => setVectorBackendModeDraft(event.target.value === "qdrant" ? "qdrant" : "local")}
                            disabled={systemConfigLoading || systemConfigSaving || vectorBackendApplying}
                          >
                            <option value="local">local-index（推荐新手）</option>
                            <option value="qdrant">qdrant（大规模记忆）</option>
                          </select>
                        </label>
                        <label>
                          <span>Qdrant URL</span>
                          <input
                            type="text"
                            value={vectorQdrantUrlDraft}
                            onChange={(event) => setVectorQdrantUrlDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving || vectorBackendApplying || vectorBackendModeDraft !== "qdrant"}
                            placeholder="http://127.0.0.1:6333"
                          />
                        </label>
                        <label>
                          <span>Collection</span>
                          <input
                            type="text"
                            value={vectorQdrantCollectionDraft}
                            onChange={(event) => setVectorQdrantCollectionDraft(event.target.value)}
                            disabled={systemConfigLoading || systemConfigSaving || vectorBackendApplying || vectorBackendModeDraft !== "qdrant"}
                            placeholder="aria_memory"
                          />
                        </label>
                        <label>
                          <span>超时(ms)</span>
                          <input
                            type="number"
                            min={1000}
                            max={30000}
                            value={vectorQdrantTimeoutDraft}
                            onChange={(event) => setVectorQdrantTimeoutDraft(Number(event.target.value || 0))}
                            disabled={systemConfigLoading || systemConfigSaving || vectorBackendApplying || vectorBackendModeDraft !== "qdrant"}
                          />
                        </label>
                      </div>
                      <div className="brain-memory-risk-grid">
                        <article>
                          <strong>风险提示</strong>
                          <small>切换到 Qdrant 前必须先确保服务可访问，否则检索会降级本地并提示错误。</small>
                        </article>
                        <article>
                          <strong>推荐值</strong>
                          <small>小白默认：`local-index`；需要海量记忆再切 `qdrant`，URL 用 `http://127.0.0.1:6333`。</small>
                        </article>
                      </div>
                      <div className="brain-memory-actions">
                        <button
                          type="button"
                          onClick={() => void applyVectorBackendPolicy()}
                          disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || vectorBackendApplying}
                        >
                          {vectorBackendApplying ? "应用中..." : "保存向量后端策略"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void applyVectorBackendPolicy("local")}
                          disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || vectorBackendApplying}
                        >
                          一键回滚到 local-index
                        </button>
                        <button
                          type="button"
                          onClick={() => void syncSystemConfig({ silent: true })}
                          disabled={systemConfigLoading || vectorBackendApplying}
                        >
                          刷新状态卡
                        </button>
                        <button
                          type="button"
                          onClick={() => void runMemoryBackendSelfCheck()}
                          disabled={memoryBackendChecking || systemConfigLoading || vectorBackendApplying}
                        >
                          {memoryBackendChecking ? "自检中..." : "连接自检"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void applyMemoryBackendRecommendedFix()}
                          disabled={memoryBackendChecking || vectorBackendApplying || systemConfigLoading}
                        >
                          按建议一键修复
                        </button>
                      </div>
                      {memoryBackendCheck ? (
                        <div className="brain-memory-check-card">
                          <div className="brain-memory-check-head">
                            <strong>自检结果：{memoryBackendCheck.overallStatus === "healthy" ? "健康" : memoryBackendCheck.overallStatus === "error" ? "异常" : "警告"}</strong>
                            <span>{formatRuntimeTimestamp(memoryBackendCheck.checkedAt)}</span>
                          </div>
                          <div className="brain-memory-check-list">
                            {memoryBackendCheck.checks.map((item) => (
                              <article key={`check-${item.id}`} className={`brain-memory-check-item status-${item.status}`}>
                                <strong>{item.label}</strong>
                                <small>{item.detail}</small>
                              </article>
                            ))}
                          </div>
                          <div className="brain-memory-suggestion-list">
                            {(memoryBackendCheck.suggestions || []).map((item) => (
                              <article key={`suggestion-${item.id}`} className={`brain-memory-suggestion-item level-${item.level}`}>
                                <strong>{item.title}</strong>
                                <small>{item.detail}</small>
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="workday-meta">
                        小白提示：先点“连接自检”，再点“按建议一键修复”；如果仍异常，先回滚 local-index 保证可用。
                      </div>
                      <div className="brain-memory-runtime-grid">
                        <article className="brain-memory-runtime-item">
                          <strong>向量后端</strong>
                          <span>{memoryPlaneRuntime?.backend || "local"}</span>
                          <em>模式：{memoryPlaneVectorMode}</em>
                        </article>
                        <article className="brain-memory-runtime-item">
                          <strong>Qdrant 运行状态</strong>
                          <span>
                            {qdrantRuntime?.configured
                              ? qdrantRuntime.ready
                                ? "已就绪"
                                : "连接中 / 异常"
                              : "未配置"}
                          </span>
                          <em>
                            {qdrantRuntime?.configured
                              ? `status=${qdrantRuntime.lastStatus || "unknown"} · hits=${qdrantRuntime.lastSearchHits || 0}`
                              : "设置 ARIA_VECTOR_BACKEND=qdrant + ARIA_QDRANT_URL 后启用"}
                          </em>
                          {qdrantRuntime?.configured ? (
                            <small>
                              集合：{qdrantRuntime.collection || "aria_memory"} ·
                              最后检查 {formatRuntimeTimestamp(qdrantRuntime.lastCheckAt)}
                            </small>
                          ) : null}
                          {qdrantRuntime?.lastError ? (
                            <small className="brain-memory-runtime-error">错误：{qdrantRuntime.lastError}</small>
                          ) : null}
                        </article>
                        <article className="brain-memory-runtime-item">
                          <strong>记忆层计数</strong>
                          <span>
                            长期 {memoryPlaneSummary?.longTerm || 0} ·
                            短期 {memoryPlaneSummary?.shortTerm || 0} ·
                            临时 {memoryPlaneSummary?.temporary || 0}
                          </span>
                          <em>向量索引：{memoryPlaneSummary?.vectorIndex || 0}</em>
                        </article>
                        <article className="brain-memory-runtime-item">
                          <strong>四场景存储</strong>
                          <div className="brain-memory-scene-list">
                            {memoryPlaneScenePreview.map((sceneItem) => (
                              <span key={`memory-scene-${sceneItem.scene}`} className="brain-memory-scene-pill">
                                {sceneItem.label}：{sceneItem.count}
                              </span>
                            ))}
                          </div>
                        </article>
                        <article className="brain-memory-runtime-item">
                          <strong>学习作业时间</strong>
                          <span>权威学习：{formatRuntimeTimestamp(memoryPlaneJobs.lastAuthorityLearningAt)}</span>
                          <span>反馈学习：{formatRuntimeTimestamp(memoryPlaneJobs.lastFeedbackDigestAt)}</span>
                          <span>预学习：{formatRuntimeTimestamp(memoryPlaneJobs.lastPrelearningAt)}</span>
                          <span>回收分类：{formatRuntimeTimestamp(memoryPlaneJobs.lastContextRecycleAt)}</span>
                        </article>
                        <article className="brain-memory-runtime-item">
                          <strong>记忆平面统计</strong>
                          <span>总写入：{memoryPlaneStats.totalWrites || 0}</span>
                          <span>去重压缩：{memoryPlaneStats.dedupeRemovals || 0}</span>
                          <span>晋升长期：{memoryPlaneStats.promotions || 0}</span>
                          <span>{memoryPlaneStats.bootstrappedFromHighlights ? "已完成历史记忆引导" : "未触发历史记忆引导"}</span>
                        </article>
                      </div>
                    </div>
                    <div className="brain-detail-actions">
                      <button
                        type="button"
                        onClick={() => void syncAriaKernelProvidersIntoSystemConfig("merge")}
                        disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || systemConfigAriaKernelSyncing}
                      >
                        {systemConfigAriaKernelSyncing ? "同步中..." : "同步 Aria Kernel 模型与密钥"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void syncAriaKernelProvidersIntoSystemConfig("replace")}
                        disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking || systemConfigAriaKernelSyncing}
                      >
                        仅保留 Aria Kernel 路由
                      </button>
                    </div>
                    <div className="brain-detail-actions">
                      <button
                        type="button"
                        onClick={() => void saveSystemConfigDraft()}
                        disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking}
                      >
                        {systemConfigSaving ? "保存中..." : "保存策略"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void syncSystemConfig()}
                        disabled={systemConfigLoading || systemConfigSaving || systemConfigRollbacking}
                      >
                        {systemConfigLoading ? "同步中..." : "刷新策略"}
                      </button>
                    </div>
                    <div className="brain-detail-actions">
                      <button
                        type="button"
                        onClick={() => void reloadSystemConfigFromDisk()}
                        disabled={systemConfigSaving || systemConfigLoading || systemConfigRollbacking}
                      >
                        从磁盘重载配置
                      </button>
                      <button
                        type="button"
                        onClick={() => void syncUnifiedTimelineState({ limit: 120 })}
                        disabled={timelineLoading}
                      >
                        {timelineLoading ? "刷新中..." : "刷新统一时间线"}
                      </button>
                    </div>
                  </section>

                  <section className="config-history-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">策略变更记录（谁改了什么）</p>
                      <span>可追踪 · 可回滚</span>
                    </div>
                    <p className="workday-meta">
                      最新快照：{systemConfigHistoryState?.latestSnapshotId || "未加载"} ·
                      记录数 {(systemConfigHistoryState?.timeline || []).length}
                    </p>
                    <div className="config-history-actions">
                      <button
                        type="button"
                        onClick={() => void syncSystemConfigHistory()}
                        disabled={systemConfigHistoryLoading || systemConfigSaving || systemConfigRollbacking}
                      >
                        {systemConfigHistoryLoading ? "同步中..." : "刷新变更记录"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void rollbackConfigSnapshot({ mode: "previous_stable" })}
                        disabled={!canRollbackPreviousConfig || systemConfigRollbacking || systemConfigSaving}
                      >
                        {systemConfigRollbacking ? "回滚中..." : "一键回滚到上一个可用版本"}
                      </button>
                    </div>
                    <div className="config-history-timeline">
                      {systemConfigTimelinePreview.length === 0 ? (
                        <p className="memory-empty">暂无策略变更记录，保存一次策略后会自动生成。</p>
                      ) : (
                        systemConfigTimelinePreview.map((event) => (
                          <article key={`cfg-event-${event.id}`} className={`config-history-item risk-${event.riskLevel}`}>
                            <div className="config-history-item-head">
                              <strong>{event.summary}</strong>
                              <span>{event.riskLevel}</span>
                            </div>
                            <p>{event.actorName} · {new Date(event.at).toLocaleString()}</p>
                            <small>{event.changedSections.join("、") || "无字段变更"}</small>
                            {event.note ? <em>{event.note}</em> : null}
                            {event.snapshotId ? (
                              <button
                                type="button"
                                onClick={() => void rollbackConfigSnapshot({ snapshotId: event.snapshotId })}
                                disabled={systemConfigRollbacking || systemConfigSaving}
                              >
                                回滚到该版本
                              </button>
                            ) : null}
                          </article>
                        ))
                      )}
                    </div>
                    <details className="workbench-feed-toggle">
                      <summary>查看全部快照版本（可定点回滚）</summary>
                      <div className="config-history-snapshots">
                        {systemConfigSnapshotPreview.map((snapshot) => (
                          <article key={`cfg-snap-${snapshot.id}`} className="config-history-snapshot-item">
                            <div>
                              <strong>{snapshot.id}</strong>
                              <p>{snapshot.actorName} · {new Date(snapshot.createdAt).toLocaleString()}</p>
                              <small>{snapshot.summary}</small>
                            </div>
                            <button
                              type="button"
                              onClick={() => void rollbackConfigSnapshot({ snapshotId: snapshot.id })}
                              disabled={systemConfigRollbacking || systemConfigSaving}
                            >
                              回滚
                            </button>
                          </article>
                        ))}
                        {systemConfigSnapshotPreview.length === 0 ? (
                          <p className="memory-empty">暂无快照。</p>
                        ) : null}
                      </div>
                    </details>
                    <p className="workday-meta">
                      说明书：`/Users/bear/Desktop/Aria/Aria/docs/运营策略台-小白说明书.md`
                    </p>
                  </section>

                  <section className="limb-matrix-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">手脚躯体执行矩阵（Skill + MCP）</p>
                      <span>12 模块</span>
                    </div>
                    <div className="limb-matrix-grid">
                      {limbExecutionModules.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="limb-matrix-item"
                          onClick={() => openPanel(item.focusPanel, activeScene)}
                        >
                          <span>{item.icon}</span>
                          <strong>{item.title}</strong>
                          <small>{item.hint}</small>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="backend-plain-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">后端结构（小白版）</p>
                      <span>6 层</span>
                    </div>
                    <p className="workday-meta">
                      你只要点按钮，后端会自动做复杂事：安全、思考、记忆、执行、技能调用、场景切换。
                    </p>
                    <div className="backend-plain-grid">
                      {backendPlainBlocks.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="backend-plain-item"
                          onClick={() => openPanel(item.focusPanel, item.scene)}
                        >
                          <span>{item.icon}</span>
                          <strong>{item.title}</strong>
                          <small>{item.plain}</small>
                          <em>{item.technical}</em>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="injected-capability-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">能力注入（Codex + Aria Kernel）</p>
                      <span>4 核心能力</span>
                    </div>
                    <div className="injected-capability-grid">
                      {injectedCapabilityCards.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="injected-capability-item"
                          onClick={() => openPanel(item.focusPanel, item.scene)}
                        >
                          <span>{item.source}</span>
                          <strong>{item.title}</strong>
                          <small>{item.plain}</small>
                          <em>{item.backend}</em>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="super-autonomy-card">
                    <div className="brain-surface-head">
                      <p className="engagement-title">超级自主底层（全能力灌注）</p>
                      <span>readiness {superAutonomyRuntime?.readinessScore ?? 0}%</span>
                    </div>
                    <p className="workday-meta">
                      不做重复开发，直接复用并增强 Codex + Aria Kernel + Antigravity 核心能力；这里展示底层是否真正跑通。
                    </p>
                    <div className="super-autonomy-metrics">
                      <article>
                        <strong>总健康度</strong>
                        <span>{superAutonomyRuntime?.readinessScore ?? 0}%</span>
                        <small>{superAutonomyRuntime?.enabled ? "已开启" : "未开启"}</small>
                      </article>
                      <article>
                        <strong>技能就绪度</strong>
                        <span>{superAutonomyRuntime?.summary?.skillReadiness ?? 0}%</span>
                        <small>
                          {superAutonomyRuntime?.summary?.requiredSkillsReady ?? 0}/
                          {superAutonomyRuntime?.summary?.requiredSkillsTotal ?? 0} 必需技能
                        </small>
                      </article>
                      <article>
                        <strong>缺失技能</strong>
                        <span>{superAutonomyRuntime?.summary?.missingRequiredSkillCount ?? 0}</span>
                        <small>应为 0 才算可独立运营</small>
                      </article>
                      <article>
                        <strong>重复开发风险</strong>
                        <span>{fusionRuntime?.summary?.duplicateRiskCount ?? 0}</span>
                        <small>应为 0，避免重复造轮子</small>
                      </article>
                    </div>
                    <div className="super-autonomy-inline">
                      <span>网关状态：{superAutonomyRuntime?.summary?.gatewayStatus || "unknown"}</span>
                      <span>会话数：{superAutonomyRuntime?.summary?.sessionCount ?? 0}</span>
                      <span>积压任务：{superAutonomyRuntime?.summary?.taskLedgerPending ?? 0}</span>
                      <span>死信：{superAutonomyRuntime?.summary?.taskLedgerDeadLetters ?? 0}</span>
                    </div>
                    <div className="super-autonomy-skill-list">
                      {superAutonomySkillPreview.length === 0 ? (
                        <p className="memory-empty">还没有拿到技能运行状态，点“刷新评估”即可同步。</p>
                      ) : (
                        superAutonomySkillPreview.map((skill) => (
                          <article key={`sa-skill-${skill.id}`} className={`super-autonomy-skill ${skill.ready ? "is-ready" : "is-missing"}`}>
                            <div>
                              <strong>{skill.name}</strong>
                              <small>{skill.source} · {skill.innovationLevel}</small>
                            </div>
                            <span>{skill.ready ? "已就绪" : "待补齐"}</span>
                          </article>
                        ))
                      )}
                    </div>
                    {superAutonomyMissingPreview.length > 0 ? (
                      <div className="super-autonomy-missing">
                        {superAutonomyMissingPreview.map((skill) => (
                          <p key={`sa-missing-${skill.id}`}>
                            {skill.name} 缺少接口：{skill.missingEndpoints.join("、")}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="memory-empty">所有必需技能接口已接通，可进入独立运行模式。</p>
                    )}
                  </section>

                </div>
              )}

              {/* ── Workday Tab: Work Scene 3-Column Layout ── */}
              {rightPanel === "workday" && (
                <div className={`work-scene-layout ${isCodingScene ? "work-scene-layout--coding" : ""}`.trim()}>
                  {/* Left Sidebar: Avatar + Capabilities */}
                  <aside className={`work-sidebar-left ${isCodingScene ? "work-sidebar-left--coding" : ""}`.trim()}>
                    {renderSceneModelConfig(workSceneKey, {
                      className: "scene-model-config--work",
                      title: workSceneKey === "coding" ? "编程模型配置" : "工作模型配置",
                      subtitle: workSceneKey === "coding"
                        ? "代码执行优先模型：用于编程指令、补丁预演和验证回执"
                        : "统一模型入口：选择后立即用于工作场景聊天"
                    })}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>💗 工作 Soul</summary>
                        <div className="work-collapse-body">
                          {renderSceneSoulConfigPanel("work", {
                            className: "scene-soul-config-panel--work",
                            title: "工作 Soul 调校",
                            subtitle: "可随时打开/隐藏，配置仅作用于工作场景。"
                          })}
                        </div>
                      </details>
                    )}

                    {isCodingScene ? (
                      <section className="coding-workspace-card">
                        <div className="coding-workspace-head">
                          <strong>📁 项目工作目录</strong>
                          <small>先选目录，再执行编程任务</small>
                        </div>
                        <label className="patch-gate-field">
                          <span>目录路径</span>
                          <input
                            type="text"
                            value={codingPatchCwdDraft}
                            onChange={(event) => setCodingPatchCwdDraft(event.target.value)}
                            placeholder="例如：apps/desktop 或 /绝对路径"
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          />
                        </label>
                        <div className="coding-workspace-presets">
                          {Array.from(new Set([
                            "apps/desktop",
                            "apps/mobile",
                            "services/api",
                            "~/Desktop",
                            "~",
                            "/",
                            String(codingWorkspace?.cwd || "").trim()
                          ].filter(Boolean))).map((preset) => (
                            <button
                              key={`coding-cwd-preset-${preset}`}
                              type="button"
                              className={codingPatchCwdDraft.trim() === preset ? "is-active" : ""}
                              onClick={() => setCodingPatchCwdDraft(preset)}
                              disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <div className="coding-workspace-actions">
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void applyCodingWorkspaceDraft()}
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking || !codingPatchCwdDraft.trim()}
                          >
                            {codingWorkspaceSyncing ? "保存中..." : "设为当前目录"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void applyCodingWorkspaceDraft({ openInFinder: true })}
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking || !codingPatchCwdDraft.trim()}
                          >
                            {codingWorkspaceOpening ? "打开中..." : "打开文件夹"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void pickCodingWorkspaceAndApply()}
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking}
                          >
                            {codingWorkspacePicking ? "选择中..." : "点选文件夹"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void applyCodingWorkspaceDraft({ createIfMissing: true })}
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking || !codingPatchCwdDraft.trim()}
                          >
                            新建并切换
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => {
                              const parent = resolveCodingParentDirectoryPath(codingWorkspace?.cwd || codingPatchCwdDraft);
                              if (!parent) {
                                return;
                              }
                              setCodingPatchCwdDraft(parent);
                              setCodingSelectedDirectoryPath(parent);
                              void applyCodingWorkspaceDraft({ cwd: parent });
                            }}
                            disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking}
                          >
                            上一级目录
                          </button>
                        </div>
                        <div className="coding-workspace-meta">
                          <p>当前目录：{codingWorkspace?.cwd || "未设置"}</p>
                          <p>{codingWorkspace?.lastAction || "设置后会自动同步到编程执行链路。"}</p>
                        </div>
                        <div className="coding-workspace-entries">
                          {(codingWorkspace?.entries || []).map((entry) => {
                            const entryKey = `coding-workspace-entry-${entry.kind}-${entry.name}`;
                            if (entry.kind === "dir") {
                              const targetPath = resolveCodingChildDirectoryPath(
                                codingWorkspace?.cwd || codingPatchCwdDraft,
                                entry.name
                              );
                              return (
                                <button
                                  key={entryKey}
                                  type="button"
                                  className="is-dir"
                                  onClick={() => {
                                    if (!targetPath) {
                                      return;
                                    }
                                    setCodingPatchCwdDraft(targetPath);
                                    setCodingSelectedDirectoryPath(targetPath);
                                    void applyCodingWorkspaceDraft({ cwd: targetPath });
                                  }}
                                  disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingWorkspacePicking || !targetPath}
                                  title={targetPath ? `切换到 ${targetPath}` : "无法切换目录"}
                                >
                                  📂 {entry.name}
                                </button>
                              );
                            }
                            return (
                              <span key={entryKey} className="is-file">
                                📄 {entry.name}
                              </span>
                            );
                          })}
                          {(codingWorkspace?.entries || []).length === 0 ? (
                            <span className="is-empty">目录预览为空，先点“设为当前目录”。</span>
                          ) : null}
                        </div>
                      </section>
                    ) : null}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>🧩 Skill 技能</summary>
                        <div className="work-collapse-body">
                          {workbenchLeftModules.filter(m => m.id === "coding_skill").map(item => (
                            <article key={item.id} className={`work-collapse-item ${item.enabled ? "is-on" : ""}`}>
                              <strong>{item.title}</strong>
                              <p>{item.note}</p>
                            </article>
                          ))}
                          {workbenchLeftModules.filter(m => m.id === "coding_skill").length === 0 && (
                            <p className="work-collapse-empty">暂无 Skill 数据</p>
                          )}
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>🔌 MCP 协议</summary>
                        <div className="work-collapse-body">
                          {workbenchLeftModules.filter(m => m.id === "mcp_hub").map(item => (
                            <article key={item.id} className={`work-collapse-item ${item.enabled ? "is-on" : ""}`}>
                              <strong>{item.title}</strong>
                              <p>{item.note}</p>
                            </article>
                          ))}
                          {workbenchLeftModules.filter(m => m.id === "mcp_hub").length === 0 && (
                            <p className="work-collapse-empty">暂无 MCP 数据</p>
                          )}
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>⚙️ 自动化工作</summary>
                        <div className="work-collapse-body">
                          <p className="work-collapse-empty">任务链、规则引擎、重试策略</p>
                          <button type="button" className="work-collapse-btn" onClick={() => openPanel("autonomy", workSceneKey)}>
                            查看执行队列
                          </button>
                        </div>
                      </details>
                    )}

                    {!isCodingScene && XHS_IN_ARIA_ENABLED && (
                      <details className="work-collapse-section" open>
                        <summary>🎬 小红书视频闭环</summary>
                        <div className="work-collapse-body xhs-pipeline-card">
                          <p className="xhs-pipeline-hint">{xhsPipelineNextStepHint}</p>
                          <div className="xhs-step-track">
                            {XHS_WORKFLOW_STEPS.map((step, index) => {
                              const stepNo = index + 1;
                              const tone = xhsWorkflowStepIndex >= stepNo ? "is-done" : xhsWorkflowStepIndex + 1 === stepNo ? "is-active" : "";
                              return (
                                <span key={`xhs-step-${stepNo}`} className={`xhs-step-chip ${tone}`.trim()}>
                                  {stepNo}. {step}
                                </span>
                              );
                            })}
                          </div>
                          <label className="patch-gate-field">
                            <span>主题（第1步）</span>
                            <input
                              type="text"
                              value={xhsThemeDraft}
                              onChange={(event) => setXhsThemeDraft(event.target.value)}
                              placeholder="例如：减脂便当、早起效率、通勤穿搭"
                              disabled={xhsPipelineBusy || xhsJobIsRunning}
                            />
                          </label>
                          <label className="patch-gate-field">
                            <span>素材目录（第3步）</span>
                            <input
                              type="text"
                              value={xhsAssetsDirDraft}
                              onChange={(event) => setXhsAssetsDirDraft(event.target.value)}
                              placeholder={XHS_DEFAULT_ASSETS_DIR}
                              disabled={xhsPipelineBusy || xhsJobIsRunning}
                            />
                          </label>
                          <label className="patch-gate-field">
                            <span>文案模型</span>
                            <input
                              type="text"
                              value={xhsModelDraft}
                              onChange={(event) => setXhsModelDraft(event.target.value)}
                              placeholder="gpt-4.1-mini"
                              disabled={xhsPipelineBusy || xhsJobIsRunning}
                            />
                          </label>
                          <div className="xhs-toggle-row">
                            <label>
                              <input
                                type="checkbox"
                                checked={xhsPublishEnabled}
                                onChange={(event) => setXhsPublishEnabled(event.target.checked)}
                                disabled={xhsPipelineBusy || xhsJobIsRunning}
                              />
                              自动点击发布
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={xhsHeadlessEnabled}
                                onChange={(event) => setXhsHeadlessEnabled(event.target.checked)}
                                disabled={xhsPipelineBusy || xhsJobIsRunning}
                              />
                              无头模式
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                checked={xhsSkipUploadEnabled}
                                onChange={(event) => setXhsSkipUploadEnabled(event.target.checked)}
                                disabled={xhsPipelineBusy || xhsJobIsRunning}
                              />
                              仅文案+剪辑
                            </label>
                          </div>
                          <div className="xhs-action-row">
                            <button
                              type="button"
                              className="work-collapse-btn"
                              onClick={() => void startXhsPipelineRun()}
                              disabled={xhsPipelineBusy || xhsJobIsRunning}
                            >
                              {xhsPipelineBusy ? "启动中..." : "开始执行闭环"}
                            </button>
                            <button
                              type="button"
                              className="work-collapse-btn"
                              onClick={() => void syncXhsPipeline(String(xhsActiveJob?.id || ""))}
                              disabled={xhsPipelineBusy}
                            >
                              刷新状态
                            </button>
                            <button
                              type="button"
                              className="work-collapse-btn"
                              onClick={() => void cancelXhsPipelineRun()}
                              disabled={xhsPipelineBusy || !xhsJobIsRunning}
                            >
                              取消执行
                            </button>
                          </div>
                          {xhsPipelineError ? <p className="xhs-error-text">{xhsPipelineError}</p> : null}
                          {xhsActiveJob ? (
                            <article className="xhs-job-status">
                              <p>状态：{xhsActiveJob.status} · {xhsActiveJob.reason || "n/a"}</p>
                              <p>任务ID：{xhsActiveJob.id}</p>
                              <p>RunID：{xhsActiveJob.runId || "待生成"}</p>
                              <p>输出目录：{xhsActiveJob.outputDir || "待生成"}</p>
                              <p>视频文件：{xhsActiveJob.videoFile || "待生成"}</p>
                              <p>上传状态：{xhsActiveJob.uploadStatus || "执行中"}</p>
                              <p>错误信息：{xhsActiveJob.error || "无"}</p>
                              {xhsActiveJob.logs?.length ? (
                                <pre className="xhs-log-tail">
                                  {xhsActiveJob.logs.slice(-12).map((item) => `[${item.channel}] ${item.text}`).join("\n")}
                                </pre>
                              ) : (
                                <p className="work-collapse-empty">等待日志输出...</p>
                              )}
                            </article>
                          ) : (
                            <p className="work-collapse-empty">点击“开始执行闭环”后，这里会显示每一步执行状态。</p>
                          )}
                        </div>
                      </details>
                    )}

                    {!isCodingScene && !XHS_IN_ARIA_ENABLED && (
                      <details className="work-collapse-section">
                        <summary>🎬 小红书视频闭环（已迁移）</summary>
                        <div className="work-collapse-body">
                          <p className="work-collapse-empty">该流程已从 Aria 下线，独立运行，避免串台和响应干扰。</p>
                          <p className="work-collapse-empty">桌面入口：`/Users/bear/Desktop/小红书工作流.command`</p>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => window.open("http://127.0.0.1:5179", "_blank", "noopener,noreferrer")}
                          >
                            打开独立工作台
                          </button>
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>🧭 统一时间线</summary>
                        <div className="work-collapse-body">
                          {(autonomyTimelinePreview.slice(0, 4)).map((event) => (
                            <article key={`work-timeline-${event.id}`} className="work-collapse-item is-on">
                              <strong>{event.title}</strong>
                              <p>{event.detail || event.stage}</p>
                            </article>
                          ))}
                          {autonomyTimelinePreview.length === 0 ? (
                            <p className="work-collapse-empty">先在输入框提交一个任务，时间线会自动出现。</p>
                          ) : null}
                          <button type="button" className="work-collapse-btn" onClick={() => openPanel("autonomy", workSceneKey)}>
                            查看完整时间线
                          </button>
                        </div>
                      </details>
                    )}

                    <details className="work-collapse-section" open={workSceneKey === "coding"}>
                      <summary>🛡️ 补丁安全闸</summary>
                      <div className="work-collapse-body patch-gate-body">
                        <label className="patch-gate-field">
                          <span>修复目标</span>
                          <textarea
                            rows={2}
                            value={codingPatchObjectiveDraft}
                            onChange={(event) => setCodingPatchObjectiveDraft(event.target.value)}
                            placeholder="例如：修复 work 场景输入框无法发送消息"
                            disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          />
                        </label>
                        <label className="patch-gate-field">
                          <span>工作目录</span>
                          <input
                            type="text"
                            value={codingPatchCwdDraft}
                            onChange={(event) => setCodingPatchCwdDraft(event.target.value)}
                            placeholder="apps/desktop"
                            disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          />
                        </label>
                        <label className="patch-gate-field">
                          <span>验证命令（逗号或换行分隔）</span>
                          <textarea
                            rows={2}
                            value={codingPatchVerifyDraft}
                            onChange={(event) => setCodingPatchVerifyDraft(event.target.value)}
                            placeholder="npm run build:web"
                            disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          />
                        </label>
                        <div className="patch-gate-actions">
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void runCodingPatchPreview()}
                            disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          >
                            {codingPatchPreviewing ? "预演中..." : "预演 diff"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void runCodingPatchApply()}
                            disabled={codingPatchApplying || codingPatchPreviewing || !activeCodingPatchDraft?.id}
                          >
                            {codingPatchApplying ? "应用中..." : "一键确认应用"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void runCodingPatchRollback()}
                            disabled={codingPatchRollbacking || codingPatchApplying || codingPatchPreviewing || !activeCodingPatchReceipt?.id}
                          >
                            {codingPatchRollbacking ? "回滚中..." : "一键回滚"}
                          </button>
                          <button
                            type="button"
                            className="work-collapse-btn"
                            onClick={() => void syncCodingPatchGate()}
                            disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                          >
                            刷新闸门
                          </button>
                        </div>
                        {activeCodingPatchDraft ? (
                          <article className={`patch-gate-risk risk-${activeCodingPatchDraft.riskLevel || "medium"}`}>
                            <div className="patch-gate-risk-head">
                              <strong>风险等级：{String(activeCodingPatchDraft.riskLevel || "medium").toUpperCase()}</strong>
                              <small>状态：{activeCodingPatchDraft.status}</small>
                            </div>
                            <p>{activeCodingPatchDraft.summary || "补丁草稿已生成。"}</p>
                            {(activeCodingPatchDraft.riskNotes || []).map((note) => (
                              <p key={`${activeCodingPatchDraft.id}-${note}`} className="patch-gate-note">- {note}</p>
                            ))}
                            {activeCodingPatchDraft.diffs?.length ? (
                              <div className="patch-gate-diff-list">
                                {activeCodingPatchDraft.diffs.slice(0, 3).map((diff) => (
                                  <article key={`${activeCodingPatchDraft.id}-${diff.filePath}-${diff.line}`} className={`patch-gate-diff status-${diff.status}`}>
                                    <div className="patch-gate-diff-head">
                                      <strong>{diff.filePath}:{diff.line}</strong>
                                      <small>{diff.status}</small>
                                    </div>
                                    <p>{diff.why || diff.summary}</p>
                                    {diff.preview ? (
                                      <pre>{diff.preview}</pre>
                                    ) : (
                                      <p className="work-collapse-empty">该片段暂无预演文本。</p>
                                    )}
                                  </article>
                                ))}
                              </div>
                            ) : null}
                          </article>
                        ) : (
                          <p className="work-collapse-empty">先点“预演 diff”，再确认应用，最后可一键回滚。</p>
                        )}
                        {activeCodingPatchReceipt ? (
                          <article className="patch-gate-receipt">
                            <strong>最近回执：{activeCodingPatchReceipt.status}</strong>
                            <p>{activeCodingPatchReceipt.summary || "暂无摘要"}</p>
                            <p>回滚状态：{activeCodingPatchReceipt.rollback?.status || "未回滚"}</p>
                          </article>
                        ) : null}
                      </div>
                    </details>

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>🧱 MCP 插件</summary>
                        <div className="work-collapse-body">
                          {expansionPreviewPacks.length > 0 ? expansionPreviewPacks.map(pack => (
                            <article key={pack.id} className="work-collapse-item is-on">
                              <strong>{pack.name}</strong>
                              <p>{pack.version} · {pack.status}</p>
                            </article>
                          )) : (
                            <p className="work-collapse-empty">暂无已安装插件</p>
                          )}
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section">
                        <summary>∞ 无限技能</summary>
                        <div className="work-collapse-body">
                          <p className="work-collapse-hint">从 GitHub 等通道下载，女友自动安装</p>
                          <input
                            className="work-expansion-input"
                            value={expansionDraftUrl}
                            onChange={(event) => setExpansionDraftUrl(event.target.value)}
                            placeholder="GitHub 仓库 / manifest URL"
                          />
                          <div className="work-expansion-actions">
                            <button type="button" onClick={() => void installExpansionFromUrl()} disabled={expansionLoading || !expansionDraftUrl.trim()}>
                              安装
                            </button>
                            <button type="button" onClick={() => void triggerAutonomyFetchDownload()} disabled={expansionLoading || !expansionDraftUrl.trim()}>
                              自主下载
                            </button>
                          </div>
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section" open={coworkingView}>
                        <summary>🪑 占座位</summary>
                        <div className="work-collapse-body">
                          {!myCoworkingProfile && !showCoworkingRegistration ? (
                            <>
                              <p className="work-collapse-hint">加入虚拟办公室，和远程同事一起打卡工作！</p>
                              <button type="button" className="work-collapse-btn" onClick={() => setShowCoworkingRegistration(true)}>
                                🚀 立即入驻
                              </button>
                            </>
                          ) : null}
                          {showCoworkingRegistration ? (
                            <div className="cw-register-form">
                              <p className="cw-register-title">填写你的身份信息</p>
                              <input
                                className="cw-register-input"
                                value={cwRegName}
                                onChange={(e) => setCwRegName(e.target.value)}
                                placeholder="你的昵称"
                              />
                              <input
                                className="cw-register-input"
                                value={cwRegTitle}
                                onChange={(e) => setCwRegTitle(e.target.value)}
                                placeholder="身份 / 职业方向（如：独立开发者）"
                              />
                              <input
                                className="cw-register-input"
                                value={cwRegDirection}
                                onChange={(e) => setCwRegDirection(e.target.value)}
                                placeholder="具体方向（如：AI 产品）"
                              />
                              <input
                                className="cw-register-input"
                                value={cwRegRole}
                                onChange={(e) => setCwRegRole(e.target.value)}
                                placeholder="具体岗位（如：全栈工程师）"
                              />
                              <div className="cw-avatar-picker">
                                {COWORKING_AVATAR_OPTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className={cwRegAvatar === emoji ? "is-active" : ""}
                                    onClick={() => setCwRegAvatar(emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                              <div className="cw-register-actions">
                                <button type="button" onClick={registerCoworking} disabled={!cwRegName.trim() || !cwRegTitle.trim()}>
                                  ✅ 确认入驻
                                </button>
                                <button type="button" onClick={() => setShowCoworkingRegistration(false)}>
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : null}
                          {myCoworkingProfile ? (
                            <div className="cw-profile-card">
                              <div className="cw-profile-avatar">{myCoworkingProfile.avatar}</div>
                              <div className="cw-profile-info">
                                <strong className="cw-status-indicator" style={{ "--status-rgb": occupantStatusMeta(myCoworkingProfile.status).color } as React.CSSProperties}>
                                  {myCoworkingProfile.name}
                                  <div className="cw-status-dot" title={occupantStatusMeta(myCoworkingProfile.status).label}></div>
                                </strong>
                                <small>{myCoworkingProfile.title} · {myCoworkingProfile.direction}</small>
                                <small>{myCoworkingProfile.role} · 🔥 {myCoworkingProfile.totalCheckins} 天</small>
                              </div>
                              <div className="cw-my-help-input">
                                <input
                                  value={cwHelpDraft}
                                  onChange={(e) => setCwHelpDraft(e.target.value)}
                                  placeholder={myCoworkingProfile.helpRequest || "发布工作困难求助..."}
                                />
                                <button type="button" onClick={publishCwHelp}>发布</button>
                              </div>
                              <div className="cw-status-actions">
                                <button type="button" onClick={() => setShowCwStatusPicker(!showCwStatusPicker)}>
                                  {occupantStatusMeta(myCoworkingProfile.status).emoji} 更改状态
                                </button>
                                {showCwStatusPicker && (
                                  <div className="cw-status-picker">
                                    {(Object.entries(OCCUPANT_STATUS_META) as [OccupantStatus, { label: string; emoji: string; color: string }][]).map(([val, meta]) => (
                                      <button key={val} type="button" onClick={() => updateCwStatus(val)}>
                                        {meta.emoji} {meta.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="cw-profile-actions">
                                {!hasCheckedInToday ? (
                                  <button type="button" className="cw-checkin-btn" onClick={coworkingCheckin}>
                                    🚀 今日打卡
                                  </button>
                                ) : (
                                  <span className="cw-checked-badge">✅ 已打卡</span>
                                )}
                                <button
                                  type="button"
                                  className="work-collapse-btn"
                                  onClick={() => setCoworkingView(!coworkingView)}
                                >
                                  {coworkingView ? "返回工作" : "查看办公室"}
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </details>
                    )}

                    {!isCodingScene && (
                      <details className="work-collapse-section work-advanced-toggle">
                        <summary>📂 高级功能</summary>
                        <div className="work-collapse-body">
                          <button type="button" className="work-collapse-btn" onClick={() => void syncWorkday()} disabled={workdayLoading}>
                            {workdayLoading ? "同步中..." : "🔁 刷新工作日"}
                          </button>
                          <button type="button" className="work-collapse-btn" onClick={() => void syncExpansion()} disabled={expansionLoading}>
                            {expansionLoading ? "同步中..." : "🚀 刷新扩展"}
                          </button>
                          <button type="button" className="work-collapse-btn" onClick={() => void syncWorkbench()} disabled={workbenchLoading}>
                            {workbenchLoading ? "同步中..." : "🧱 刷新工作台"}
                          </button>
                        </div>
                      </details>
                    )}
                  </aside>

                  {/* Center: Chat Conversation or Coworking Office */}
                  <div className={`work-center-chat ${isCodingScene ? "work-center-chat--coding" : ""}`.trim()}>
                    {!isCodingScene && coworkingView && myCoworkingProfile ? (
                      <section className="coworking-office">
                        <div className="cw-office-header">
                          <h3>🏢 远程办公室</h3>
                          <span>{coworkingSeats.filter((s) => s.occupant).length}/{coworkingSeats.length} 个工位已入驻</span>
                        </div>
                        <div className="cw-office-floor">
                          {(() => {
                            const maxRow = Math.max(...coworkingSeats.map(s => s.row), 1);
                            const selectedSeat = coworkingSeats.find(s => s.id === coworkingSelectedSeatId);
                            const selectedRow = selectedSeat ? selectedSeat.row : -1;
                            return Array.from({ length: maxRow }, (_, rowIdx) => (
                              <div
                                key={`row-${rowIdx}`}
                                className="cw-office-row"
                                style={{
                                  "--row-depth": `${(maxRow - rowIdx) * 30}px`,
                                  position: "relative",
                                  zIndex: selectedRow === rowIdx + 1 ? 100 : 1
                                } as React.CSSProperties}
                              >
                                <span className="cw-row-label">{rowIdx === 0 ? "🌟 前排 VIP" : rowIdx < 3 ? "✨ 中排" : "💺 后排"}</span>
                                <div className="cw-row-seats">
                                  {coworkingSeats
                                    .filter((s) => s.row === rowIdx + 1)
                                    .map((seat) => {
                                      const chairMeta = CHAIR_STYLES.find((c) => c.style === seat.style) || CHAIR_STYLES[0];
                                      const isMine = seat.id === myCoworkingProfile.currentSeatId;
                                      return (
                                        <div
                                          key={seat.id}
                                          className={`cw-seat-wrap ${coworkingSpeakingSeatId === seat.id ? "has-message" : ""}`}
                                          style={{ zIndex: coworkingSelectedSeatId === seat.id ? 100 : 1 }}
                                        >
                                          <div
                                            className={`cw-seat ${seat.occupant ? "is-occupied" : "is-empty"} ${isMine ? "is-mine" : ""}`}
                                            style={{
                                              "--chair-rgb": chairMeta.color,
                                              "--status-rgb": seat.occupant ? occupantStatusMeta(seat.occupant.status).color : "148, 163, 184"
                                            } as React.CSSProperties}
                                            onClick={() => {
                                              if (!seat.occupant) {
                                                claimCoworkingSeat(seat.id);
                                              }
                                            }}
                                          >
                                            <span className="cw-seat-chair">{chairMeta.emoji}</span>
                                            {seat.occupant ? (
                                              <>
                                                <button
                                                  type="button"
                                                  className="cw-seat-avatar-btn"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isMine) {
                                                      setCoworkingSelectedSeatId(coworkingSelectedSeatId === seat.id ? null : seat.id);
                                                    }
                                                  }}
                                                >
                                                  <span className="cw-seat-avatar">
                                                    {seat.occupant.avatar}
                                                    <span className="cw-seat-status-dot" title={occupantStatusMeta(seat.occupant.status).label} />
                                                  </span>
                                                </button>
                                                <span className="cw-seat-name">{seat.occupant.name}</span>
                                                <span className="cw-seat-streak">🔥{seat.occupant.checkinCount}</span>
                                                {seat.occupant.helpRequest && <span className="cw-seat-help-badge" title={seat.occupant.helpRequest}>📣</span>}
                                                {myCoworkingProfile.buddyIds.includes(seat.occupant.name) ? <span className="cw-seat-buddy-badge">🔥</span>
                                                  : myCoworkingProfile.friendIds.includes(seat.occupant.name) ? <span className="cw-seat-friend-badge">🤝</span> : null}
                                              </>
                                            ) : (
                                              <span className="cw-seat-empty">空位</span>
                                            )}
                                            {isMine && <span className="cw-seat-mine-badge">我</span>}
                                          </div>

                                          {coworkingSelectedSeatId === seat.id && seat.occupant && (
                                            <div className="cw-seat-popup">
                                              <div className="cw-seat-popup-head">
                                                <strong>{seat.occupant.avatar} {seat.occupant.name}</strong>
                                                <button type="button" className="close-btn" onClick={() => setCoworkingSelectedSeatId(null)}>×</button>
                                              </div>
                                              <small>{seat.occupant.title} · {seat.occupant.direction}</small>
                                              <span className="cw-seat-popup-status">{occupantStatusMeta(seat.occupant.status).emoji} {occupantStatusMeta(seat.occupant.status).label}</span>
                                              {seat.occupant.helpRequest && (
                                                <div className="cw-seat-popup-help">
                                                  <strong>📣 求助 / 困难：</strong>
                                                  <p>{seat.occupant.helpRequest}</p>
                                                </div>
                                              )}
                                              <div className="cw-seat-popup-acts">
                                                <button type="button" onClick={() => { interactWithCoworker(seat.id, "pat"); setCoworkingSelectedSeatId(null); }}>
                                                  👏 拍一拍
                                                </button>
                                                <button type="button" onClick={() => { interactWithCoworker(seat.id, "send-coffee"); setCoworkingSelectedSeatId(null); }}>
                                                  ☕ 送咖啡
                                                </button>
                                                <button type="button" onClick={() => {
                                                  setMomentumToast(`已向 ${seat.occupant?.name} 发送私信`);
                                                  setCoworkingSelectedSeatId(null);
                                                }}>
                                                  💬 发消息
                                                </button>
                                                <button type="button" onClick={() => { interactWithCoworker(seat.id, "add-friend"); setCoworkingSelectedSeatId(null); }} disabled={myCoworkingProfile.friendIds.includes(seat.occupant.name) || myCoworkingProfile.buddyIds.includes(seat.occupant.name)}>
                                                  🤝 加好友
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                        <div className="cw-office-legend">
                          {CHAIR_STYLES.map((c) => (
                            <span key={c.style} className="cw-legend-item" style={{ "--chair-rgb": c.color } as React.CSSProperties}>
                              {c.emoji} {c.label}
                            </span>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <>
                        {isCodingScene ? (
                          <div className="coding-console-head">
                            <div className="coding-console-head-main">
                              <strong>Aria Coding Console</strong>
                              <small>自动执行 + 补丁安全闸 · 极简编程台</small>
                            </div>
                            <div className="coding-console-head-right">
                              <div className="coding-view-toggle" role="tablist" aria-label="编程视图模式">
                                <button
                                  type="button"
                                  className={codingLayoutMode === "focus_chat" ? "is-active" : ""}
                                  onClick={() => switchCodingLayoutMode("focus_chat")}
                                >
                                  聊天主视图
                                </button>
                                <button
                                  type="button"
                                  className={codingLayoutMode === "triple" ? "is-active" : ""}
                                  onClick={() => switchCodingLayoutMode("triple")}
                                >
                                  三栏开发视图
                                </button>
                              </div>
                              <div className="coding-console-pathbar">
                                <code title={codingWorkspaceCurrentPath || "未设置目录"}>
                                  {codingWorkspaceCurrentPath || "未设置目录"}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => void copyCodingWorkspacePath()}
                                  disabled={!codingWorkspaceCurrentPath}
                                >
                                  复制路径
                                </button>
                              </div>
                              <div className="coding-route-lamp-wrap">
                                <div className={`coding-route-lamp tone-${codingRouteLamp.tone}`.trim()} />
                                <div className="coding-route-lamp-copy">
                                  <strong>{codingRouteLamp.title}</strong>
                                  <small title={codingRouteLamp.detail}>{codingRouteLamp.detail}</small>
                                </div>
                                <button
                                  type="button"
                                  className="coding-route-heal-btn"
                                  onClick={() => void retryLatestRouteWithAutoHeal()}
                                  disabled={routeAutoHealBusy || sending || streamStatus === "loading" || streamStatus === "streaming"}
                                >
                                  {routeAutoHealBusy ? "自愈中..." : "自愈重试"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {isCodingScene && codingWorkspaceNotice?.text ? (
                          <p className={`coding-workspace-notice tone-${codingWorkspaceNotice.tone}`.trim()}>
                            {codingWorkspaceNotice.text}
                          </p>
                        ) : null}
                        {isCodingScene ? (
                          <div className={`coding-dev-body ${codingLayoutMode === "focus_chat" ? "coding-dev-body--focus-chat" : ""}`.trim()}>
                            <aside className="coding-project-tree">
                              <div className="coding-project-tree-head">
                                <strong>项目树</strong>
                                <button
                                  type="button"
                                  onClick={() => void syncCodingProjectTree()}
                                  disabled={codingTreeLoading}
                                >
                                  {codingTreeLoading ? "刷新中..." : "刷新"}
                                </button>
                              </div>
                              <button
                                type="button"
                                className={`coding-project-tree-root ${codingActiveDirectoryPath === String(codingProjectTreeState?.rootCwd || "").trim() ? "is-active" : ""}`.trim()}
                                onClick={() => {
                                  const rootPath = String(codingProjectTreeState?.rootCwd || "").trim();
                                  if (rootPath) {
                                    selectCodingDirectoryPath(rootPath);
                                  }
                                }}
                                disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                                title="点击选中项目树根目录"
                              >
                                <span>树根目录</span>
                                <em>{codingProjectTreeState?.rootCwd || codingWorkspace?.cwd || codingPatchCwdDraft || "apps/desktop"}</em>
                              </button>
                              <div className="coding-project-tree-actions">
                                <p>已选目录：{codingActiveDirectoryPath || "未选择"}</p>
                                <label className="coding-project-tree-search">
                                  <span>搜索</span>
                                  <input
                                    type="text"
                                    value={codingTreeSearchDraft}
                                    onChange={(event) => setCodingTreeSearchDraft(event.target.value)}
                                    placeholder="筛选目录或文件..."
                                  />
                                </label>
                                <div className="coding-project-tree-action-row">
                                  <button
                                    type="button"
                                    onClick={() => void applySelectedCodingDirectory()}
                                    disabled={codingWorkspaceSyncing || codingWorkspaceOpening || !codingActiveDirectoryPath}
                                  >
                                    设为当前目录
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void applySelectedCodingDirectory({ openInFinder: true })}
                                    disabled={codingWorkspaceSyncing || codingWorkspaceOpening || !codingActiveDirectoryPath}
                                  >
                                    打开选中目录
                                  </button>
                                </div>
                                <div className="coding-project-tree-action-row">
                                  <button
                                    type="button"
                                    onClick={() => expandAllCodingDirectories()}
                                    disabled={codingTreeNodes.length === 0}
                                  >
                                    全部展开
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => collapseAllCodingDirectories()}
                                    disabled={codingTreeNodes.length === 0}
                                  >
                                    全部折叠
                                  </button>
                                </div>
                              </div>
                              <div className="coding-project-tree-list">
                                {codingVisibleTreeNodes.length === 0 ? (
                                  <p className="coding-project-tree-empty">
                                    {codingTreeSearchKeyword ? "没有匹配项，换个关键词试试。" : "暂无项目树数据，点刷新拉取。"}
                                  </p>
                                ) : (
                                  codingVisibleTreeNodes.map((node) => (
                                    node.kind === "dir" ? (
                                      <div
                                        key={`coding-tree-dir-${node.id}`}
                                        className="coding-tree-dir-row"
                                        style={{ paddingLeft: `${8 + node.depth * 14}px` }}
                                      >
                                        <button
                                          type="button"
                                          className={`coding-tree-collapse-btn ${codingCollapsedDirectorySet.has(node.path) ? "is-collapsed" : ""}`.trim()}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            toggleCodingDirectoryCollapsed(node.path);
                                          }}
                                          disabled={codingTreeSearchKeyword.length > 0 || (codingDirectoryChildrenMap.get(node.path) || 0) <= 0}
                                          title={codingTreeSearchKeyword.length > 0
                                            ? "搜索模式会自动展开目录"
                                            : "折叠/展开目录"}
                                        >
                                          {(codingDirectoryChildrenMap.get(node.path) || 0) > 0
                                            ? (codingCollapsedDirectorySet.has(node.path) ? "▸" : "▾")
                                            : "•"}
                                        </button>
                                        <button
                                          type="button"
                                          className={`coding-tree-node is-dir ${codingActiveDirectoryPath === node.path ? "is-active" : ""}`.trim()}
                                          onClick={() => selectCodingDirectoryPath(node.path)}
                                          disabled={codingWorkspaceSyncing || codingWorkspaceOpening || codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking}
                                          title="选中该目录后可设为当前目录"
                                        >
                                          <span>📂</span>
                                          <em>{node.name}</em>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        key={`coding-tree-file-${node.id}`}
                                        type="button"
                                        className={`coding-tree-node is-file ${codingSelectedFilePath === node.path ? "is-active" : ""}`.trim()}
                                        style={{ paddingLeft: `${8 + node.depth * 14}px` }}
                                        onClick={() => {
                                          const parentDirectory = String(node.parentPath || "").trim();
                                          if (parentDirectory) {
                                            selectCodingDirectoryPath(parentDirectory);
                                          }
                                          void openCodingFilePreview(node.path, {
                                            cwd: codingProjectTreeState?.rootCwd
                                          });
                                        }}
                                        disabled={codingFilePreviewLoading}
                                      >
                                        <span>📄</span>
                                        <em>{node.name}</em>
                                      </button>
                                    )
                                  ))
                                )}
                              </div>
                            </aside>

                            <div className={`coding-chat-column ${codingLayoutMode === "focus_chat" ? "coding-chat-column--focus" : ""}`.trim()}>
                              <div className="coding-runtime-console" ref={activeMessageListRef}>
                                <div className="coding-runtime-status">
                                  <span>记录 {workSceneMessages.length}</span>
                                  <span>
                                    状态：
                                    {streamStatus === "loading" || streamStatus === "streaming"
                                      ? "执行中"
                                      : (sending ? "发送中" : "就绪")}
                                  </span>
                                </div>
                                {loading ? <div className="loading-card">正在加载聊天记录...</div> : null}
                                {!loading && workSceneMessages.length === 0 ? (
                                  <div className="coding-runtime-empty">
                                    编程工作台已就绪：输入目标后我会拆解任务、执行命令并给出可确认补丁。
                                  </div>
                                ) : null}
                                {!loading ? workSceneMessages.map((item) => (
                                  <article
                                    key={item.id}
                                    className={`coding-log-entry role-${item.role} ${String(item.text || "").trim().startsWith("⚠️") ? "is-error" : ""}`.trim()}
                                  >
                                    <div className="coding-log-head">
                                      <span className="coding-message-role">{item.role === "aria" ? "assistant" : "you"}</span>
                                      <time>{item.time}</time>
                                    </div>
                                    <div className="coding-log-body">
                                      {item.text
                                        ? renderMessageContent(item.text)
                                        : (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}
                                    </div>
                                  </article>
                                )) : null}
                                {streamStatus === "loading" ? (
                                  <div className="coding-log-entry role-system is-active">
                                    <div className="coding-log-head">
                                      <span className="coding-message-role">system</span>
                                    </div>
                                    <div className="coding-log-body">正在分析目标并生成执行回路...</div>
                                  </div>
                                ) : null}
                                <div ref={messageEndRef} />
                              </div>
                            </div>

                            <aside className="coding-file-preview">
                              <div className="coding-file-preview-head">
                                <strong>只读预览</strong>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const selected = codingSelectedFilePath.trim();
                                    if (!selected) return;
                                    void openCodingFilePreview(selected, {
                                      cwd: codingProjectTreeState?.rootCwd
                                    });
                                  }}
                                  disabled={codingFilePreviewLoading || !codingSelectedFilePath.trim()}
                                >
                                  {codingFilePreviewLoading ? "载入中..." : "重载"}
                                </button>
                              </div>
                              {codingFilePreviewState ? (
                                <>
                                  <p className="coding-file-preview-meta">
                                    {codingFilePreviewState.path} · {codingFilePreviewState.language} · {codingFilePreviewState.lineCount} 行
                                  </p>
                                  <pre>{codingFilePreviewState.content}</pre>
                                </>
                              ) : (
                                <p className="coding-file-preview-empty">点左侧文件即可预览（只读，不可改）。</p>
                              )}
                            </aside>
                          </div>
                        ) : (
                          <div className="message-list work-chat-messages" ref={activeMessageListRef}>
                            {loading ? <div className="loading-card">正在加载聊天记录...</div> : null}
                            {!loading && workSceneMessages.length === 0 ? (
                              <div className="loading-card">
                                {persona.sceneGreetings?.[workSceneKey] || `${persona.name} 已进入${workSceneLabel}，随时为你效劳 💼`}
                              </div>
                            ) : null}
                            {!loading ? workSceneMessages.map((item) => (
                              <article
                                key={item.id}
                                className={getMessageBubbleClassName(item)}
                              >
                                {item.role === "aria" && (
                                  <span className="bubble-avatar-name">{persona.name}</span>
                                )}
                                <div className="bubble-content">{item.text ? renderMessageContent(item.text) : (item.role === "aria" && streamStatus !== "idle" ? `${persona.name} 正在输入...` : "")}</div>
                                <time>{item.time}</time>
                              </article>
                            )) : null}
                            {streamStatus === "loading" ? (
                              <div className="stream-tip">{persona.name} 正在组织回应...</div>
                            ) : null}
                            <div ref={messageEndRef} />
                          </div>
                        )}
                        <div className={`work-chat-input-bar ${isCodingScene ? "work-chat-input-bar--coding" : ""}`.trim()}>
                          {isCodingScene && (
                            <div className="coding-inline-actions">
                              <button
                                type="button"
                                className="work-plan-btn"
                                onClick={() => void runCodingPatchPreview(workbenchDraft.trim() || codingPatchObjectiveDraft)}
                                disabled={codingPatchPreviewing || codingPatchApplying || codingPatchRollbacking || !(workbenchDraft.trim() || codingPatchObjectiveDraft.trim())}
                                title="按当前输入直接生成补丁预演"
                              >
                                {codingPatchPreviewing ? "预演中..." : "预演补丁"}
                              </button>
                            </div>
                          )}
                          <textarea
                            className={`work-chat-input ${isCodingScene ? "work-chat-input--coding" : ""}`.trim()}
                            rows={1}
                            value={workbenchDraft}
                            onChange={(event) => setWorkbenchDraft(event.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendWorkSceneMessage(); } }}
                            placeholder={workbenchState?.inputBar.placeholder || workScenePlaceholder}
                          />
                          <div className="input-bar-actions">
                            <button
                              type="button"
                              className={`work-withdraw-btn ${isCodingScene ? "work-withdraw-btn--coding" : ""}`.trim()}
                              onClick={() => void withdrawLatestTaskMessage(workSceneKey)}
                              disabled={
                                loading
                                || sending
                                || withdrawingLastMessage
                                || streamStatus === "loading"
                                || streamStatus === "streaming"
                                || !canWithdrawSceneMap[workSceneKey]
                              }
                              title="撤回最近一次已发出的任务"
                            >
                              {withdrawingLastMessage ? "撤回中..." : "撤回"}
                            </button>
                            <button
                              type="button"
                              className={`l3-inline-takeover-btn ${personaIntensityLevelDraft === "L3" ? "is-armed" : ""}`.trim()}
                              onClick={() => void grantL3FullTakeoverPermissions()}
                              disabled={l3TakeoverActionDisabled || loading || sending}
                              title="输入框位的一键 L3 完整接管授权"
                            >
                              {l3TakeoverButtonLabel}
                            </button>
                            <button
                              type="button"
                              className={`work-send-btn ${isCodingScene ? "work-send-btn--coding" : ""}`.trim()}
                              onClick={() => void sendWorkSceneMessage()}
                              disabled={loading || !workbenchDraft.trim()}
                            >
                              {sending
                                ? `${queuedSendCount > 0 ? `+${queuedSendCount}` : "..."}`
                                : (isCodingScene ? "执行" : "发送")}
                            </button>
                            {!isCodingScene && (
                              <button
                                type="button"
                                className="work-plan-btn"
                                onClick={() => void submitWorkbenchDraft()}
                                disabled={workbenchLoading || !workbenchDraft.trim()}
                                title="仅做任务拆解与调度，不直接发聊天"
                              >
                                调度
                              </button>
                            )}
                            {!isCodingScene && (
                              <button
                                type="button"
                                className="work-voice-btn"
                                onClick={() => { setDraft(workVoicePrefill); openPanel("chat", workSceneKey); }}
                                disabled={workbenchLoading || sending}
                                title="语音输入"
                              >
                                🎤
                              </button>
                            )}
                            <div className="work-tools-popup-wrap">
                              <button
                                type="button"
                                className={`work-tools-plus-btn ${workToolsOpen ? "is-open" : ""}`}
                                onClick={() => setWorkToolsOpen(prev => !prev)}
                                title="更多工具"
                              >
                                ＋
                              </button>
                              {workToolsOpen && (
                                <div className="work-tools-popup">
                                  {!isCodingScene && (
                                    <div className="work-tools-quick-row">
                                      <button type="button" onClick={() => { openPanel("device", workSceneKey); setWorkToolsOpen(false); }} title="设备">🖥️</button>
                                      <button type="button" onClick={() => { imageInputRef.current?.click(); setWorkToolsOpen(false); }} title="图片">🖼️</button>
                                      <button type="button" onClick={() => { workFileInputRef.current?.click(); setWorkToolsOpen(false); }} title="附件">📎</button>
                                    </div>
                                  )}
                                  <h4 className="work-tools-title">工具库</h4>
                                  {[
                                    { id: "email", icon: "📧", name: "收发邮件", desc: "智能邮件管理" },
                                    { id: "crm", icon: "👥", name: "客户管理", desc: "CRM 联动" },
                                    { id: "pdf", icon: "📄", name: "PDF转换", desc: "格式互转" },
                                    { id: "img-gen", icon: "🎨", name: "文生图", desc: "AI 图像生成" },
                                    { id: "ecom", icon: "🛍️", name: "电商运营", desc: "内容到转化" },
                                    { id: "video", icon: "🎬", name: "视频剪辑", desc: "智能剪辑" },
                                  ].map(tool => (
                                    <button
                                      key={tool.id}
                                      type="button"
                                      className="work-tool-card"
                                      onClick={(event) => {
                                        const prompt = `请帮我使用「${tool.name}」工具：${tool.desc}。优先调用可用 skill/MCP，先给执行计划，再直接开始并回传结果。`;
                                        setWorkbenchDraft(prompt);
                                        setWorkToolsOpen(false);
                                        if (event.shiftKey) {
                                          setMomentumToast(`${tool.name} 指令已写入输入框。`);
                                          return;
                                        }
                                        void triggerSceneQuickAction({
                                          prompt,
                                          scene: workSceneKey,
                                          panel: "workday",
                                          label: `工作工具「${tool.name}」`,
                                          writeOnly: false
                                        });
                                      }}
                                    >
                                      <span className="work-tool-icon">{tool.icon}</span>
                                      <div className="work-tool-info">
                                        <strong>{tool.name}</strong>
                                        <small>{tool.desc}</small>
                                      </div>
                                    </button>
                                  ))}
                                  {(workbenchState?.rightTools || []).map((tool) => (
                                    <button
                                      key={tool.id}
                                      type="button"
                                      className={`work-tool-card ${tool.status === "done" ? "is-done" : tool.status === "failed" ? "is-failed" : ""}`}
                                      onClick={() => { void executeWorkbenchToolAction(tool.id); setWorkToolsOpen(false); }}
                                      disabled={workbenchLoading}
                                    >
                                      <span className="work-tool-icon">🔧</span>
                                      <div className="work-tool-info">
                                        <strong>{tool.title}</strong>
                                        <small>{tool.summary}</small>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {rightPanel === "device" && (
                <div className="side-panel-content">
                  <h2>🛠️ 设备执行与接管能力</h2>
                  <section className="device-card">
                    <div className="workday-head">
                      <p className="engagement-title">设备接管能力（桌面 + 手机）</p>
                      <button type="button" onClick={() => void syncDeviceOps()} disabled={deviceLoading}>
                        {deviceLoading ? "同步中..." : "刷新"}
                      </button>
                    </div>
                    <p className="workday-meta">
                      Bridge：{deviceOpsState?.bridge?.lastStatus || "unknown"} · {deviceOpsState?.bridge?.baseUrl || "未配置"}
                    </p>
                    <div className="device-capability-list">
                      {(deviceOpsState?.capabilities || []).map((capability: DeviceCapability) => (
                        <article key={capability.id} className="device-capability-item">
                          <div className="quest-title-row">
                            <h3>{capability.name}</h3>
                            <span>{permissionLabel(capability.permission)}</span>
                          </div>
                          <p>{capability.description}</p>
                          <p className="quest-meta">{capability.platform} · 风险等级 {capability.risk}</p>
                          <div className="device-permission-actions">
                            <button
                              type="button"
                              onClick={() => void applyCapabilityPermission(capability.id, "granted")}
                              disabled={deviceLoading}
                            >
                              授权
                            </button>
                            <button
                              type="button"
                              onClick={() => void applyCapabilityPermission(capability.id, "blocked")}
                              disabled={deviceLoading}
                            >
                              阻止
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="device-quick-actions">
                      <button type="button" onClick={() => void quickPlanAndRunDeviceTask("desktop_focus_cleanup")} disabled={deviceLoading || loading}>
                        整理桌面文件
                      </button>
                      <button type="button" onClick={() => void quickPlanAndRunDeviceTask("desktop_hardware_check")} disabled={deviceLoading || loading}>
                        桌面硬件巡检
                      </button>
                      <button type="button" onClick={() => void quickPlanAndRunDeviceTask("mobile_album_cleanup")} disabled={deviceLoading || loading}>
                        整理手机相册
                      </button>
                      <button type="button" onClick={() => void quickPlanAndRunDeviceTask("mobile_sms_digest")} disabled={deviceLoading || loading}>
                        汇总短信待办
                      </button>
                      <button type="button" onClick={() => void quickPlanAndRunDeviceTask("mobile_email_digest")} disabled={deviceLoading || loading}>
                        汇总手机邮件
                      </button>
                      <button type="button" onClick={() => void speakDailyBriefing()} disabled={deviceLoading || loading}>
                        语音播报今日节奏
                      </button>
                      <button type="button" onClick={() => void refreshHardware()} disabled={deviceLoading || loading}>
                        读取硬件状态
                      </button>
                    </div>
                    {voiceStatus ? <p className="workday-meta">语音：{voiceStatus}</p> : null}
                    {hardwareStatus?.snapshot ? (
                      <p className="workday-meta">
                        硬件：CPU {hardwareStatus.snapshot.cpu.cores} 核 · 内存 {hardwareStatus.snapshot.memory.usedGb}/{hardwareStatus.snapshot.memory.totalGb} GB · 电量 {hardwareStatus.snapshot.battery.level}%
                      </p>
                    ) : null}
                    <div className="device-task-list">
                      {(deviceTasks.length > 0 ? deviceTasks.slice(0, 5) : []).map((task) => (
                        <article key={task.id} className={`device-task-item ${task.status}`}>
                          <div className="quest-title-row">
                            <h3>{task.title}</h3>
                            <span>{taskStatusLabel(task.status)}</span>
                          </div>
                          <p>{task.summary}</p>
                          <p className="quest-meta">{task.reason}</p>
                          {task.output ? <p className="quest-meta">{task.output.summary}</p> : null}
                        </article>
                      ))}
                      {deviceTasks.length === 0 ? <p className="memory-empty">暂无设备任务，先授权并点击上方快捷执行。</p> : null}
                    </div>
                  </section>
                </div>
              )}

              {agiViewportVisible ? (
                <aside className="agi-viewport" aria-label="Agi任务动态视窗">
                  <header className="agi-viewport-head">
                    <div>
                      <p className="agi-viewport-eyebrow">Agi任务动态视窗</p>
                      <h3>{sceneMeta[activeScene].label} · 目标 → 任务 → 结果</h3>
                      <small>一眼看懂每一步在做什么、卡在哪、怎么自动修复。</small>
                    </div>
                    <div className="agi-viewport-head-actions">
                      <button
                        type="button"
                        onClick={() => void syncUnifiedTimelineState({ flowId: agiActiveFlowId || undefined, limit: 160 })}
                        disabled={timelineLoading}
                      >
                        {timelineLoading ? "刷新中..." : "刷新"}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setAgiViewportOpen(false)}
                      >
                        隐藏
                      </button>
                    </div>
                  </header>

                  <section className="agi-runtime-lamp-grid" aria-label="执行稳定性状态">
                    <article className="agi-runtime-lamp-card">
                      <div className={`agi-runtime-lamp-dot tone-${agiAutoRepairLamp.tone}`.trim()} />
                      <div className="agi-runtime-lamp-copy">
                        <strong>{agiAutoRepairLamp.title}</strong>
                        <small title={agiAutoRepairLamp.detail}>{agiAutoRepairLamp.detail}</small>
                      </div>
                    </article>
                    <article className="agi-runtime-lamp-card">
                      <div className={`agi-runtime-lamp-dot tone-${agiIdempotencyLamp.tone}`.trim()} />
                      <div className="agi-runtime-lamp-copy">
                        <strong>{agiIdempotencyLamp.title}</strong>
                        <small title={agiIdempotencyLamp.detail}>{agiIdempotencyLamp.detail}</small>
                      </div>
                    </article>
                  </section>

                  <div className="agi-viewport-flow-list">
                    {agiFlowPreview.length === 0 ? (
                      <p className="agi-viewport-empty">先在聊天输入一句任务，系统就会生成可回放任务流。</p>
                    ) : (
                      agiFlowPreview.map((flow) => (
                        <button
                          key={`agi-flow-${flow.flowId}`}
                          type="button"
                          className={`agi-flow-chip ${agiActiveFlowId === flow.flowId ? "is-active" : ""}`}
                          onClick={() => setAgiViewportFlowId(flow.flowId)}
                        >
                          <strong>{flow.title || flow.flowId}</strong>
                          <small>
                            {timelineStatusLabel(flow.status)} · 成功 {flow.success}/{Math.max(flow.total, 1)} ·
                            异常 {flow.errors}
                          </small>
                        </button>
                      ))
                    )}
                  </div>

                  <section className="agi-viewport-progress">
                    <div className="agi-viewport-progress-head">
                      <span>流程进度</span>
                      <span>{agiProgressPercent}%</span>
                    </div>
                    <div className="agi-viewport-progress-track">
                      <div style={{ width: `${Math.max(0, Math.min(100, agiProgressPercent))}%` }} />
                    </div>
                    <p>
                      当前链路：{agiActiveFlowId || "未生成"} ·
                      状态 {timelineStatusLabel(agiActiveFlow?.status || agiDispatchSummary?.status || "")}
                    </p>
                  </section>

                  <ol className="agi-viewport-step-list">
                    {agiStepStates.map((step) => (
                      <li key={`agi-step-${step.id}`} className={`agi-step-item status-${step.status}`}>
                        <span className="agi-step-index">{step.id}</span>
                        <div className="agi-step-main">
                          <div className="agi-step-head">
                            <strong>{step.title}</strong>
                            <em>{agiStepStatusLabel(step.status)}</em>
                          </div>
                          <p>{step.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="agi-viewport-actions">
                    <button
                      type="button"
                      onClick={() => void replayTimelineFlow(agiActiveFlowId)}
                      disabled={!agiActiveFlowId || timelineLoading}
                    >
                      {timelineLoading ? "回放中..." : "一键回放"}
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void repairTimelineFlow(agiActiveFlowId, "auto")}
                      disabled={!agiActiveFlowId || timelineRepairingFlowId === agiActiveFlowId}
                    >
                      {timelineRepairingFlowId === agiActiveFlowId ? "修复中..." : "一键重放修复"}
                    </button>
                  </div>

                  <section className="agi-viewport-events">
                    <div className="agi-viewport-events-head">
                      <strong>实时反馈</strong>
                      <span>{agiRecentEvents.length} 条</span>
                    </div>
                    {agiRecentEvents.length === 0 ? (
                      <p className="agi-viewport-empty">暂无实时事件，执行任务后会在这里滚动回传。</p>
                    ) : (
                      agiRecentEvents.map((event) => (
                        <article key={`agi-event-${event.id}`} className={`agi-event-item status-${event.status || "running"}`}>
                          <div className="agi-event-head">
                            <span>{event.title || event.stage || "任务事件"}</span>
                            <em>{timelineStatusLabel(event.status || "")}</em>
                          </div>
                          <p>{event.detail || event.stage || "执行中..."}</p>
                          <small>{event.at ? new Date(event.at).toLocaleString() : "刚刚"}</small>
                        </article>
                      ))
                    )}
                  </section>
                </aside>
              ) : null}
            </>
          )}
        </div>

        {momentumToast ? (
          <section className="momentum-toast" role="status" aria-live="polite">
            <span>{momentumToast}</span>
          </section>
        ) : null}

        {/* Error display */}
        {combinedErrorText ? (
          <p className={`error-tip ${streamError.trim() ? "stream-error" : ""}`}>
            {combinedErrorText}
            {streamError.trim() && lastFailedDraft ? (
              <button type="button" onClick={() => void sendMessage(lastFailedDraft)} disabled={loading}>重试上一条</button>
            ) : null}
          </p>
        ) : null}

        {/* Input bar — hidden in workday panel (work scene has its own chat input) */}
        {/* Hidden file input for image upload */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleImagePick}
        />
        <input
          ref={workFileInputRef}
          type="file"
          accept=".txt,.md,.json,.csv,.yaml,.yml,.js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.sql,.pdf,.doc,.docx,.ppt,.pptx"
          multiple
          style={{ display: "none" }}
          onChange={(event) => {
            void handleWorkbenchFilePick(event);
          }}
        />

        {rightPanel !== "workday"
          && rightPanel !== "device"
          && rightPanel !== "funzone"
          && !(rightPanel === "chat" && activeScene === "love")
          && !(rightPanel === "memory" && activeScene === "life") && (
            <footer className="input-bar">
              {pendingImages.length > 0 && (
                <div className="image-preview-bar">
                  {pendingImages.map((img, idx) => (
                    <div key={`pending-${idx}`} className="image-preview-item">
                      <img src={img.dataUrl} alt={img.name} className="image-preview-thumb" />
                      <button
                        type="button"
                        className="image-preview-remove"
                        onClick={() => removePendingImage(idx)}
                        title="移除"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="input-row-with-attach">
                <button
                  type="button"
                  className="image-upload-btn"
                  onClick={() => imageInputRef.current?.click()}
                  title="上传图片"
                  disabled={loading || pendingImages.length >= MAX_IMAGE_COUNT}
                >
                  📷
                </button>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                  placeholder={`和 ${persona.name} 说点什么...`}
                  rows={3}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="chat-send-icon-btn"
                  onClick={() => void sendMessage()}
                  disabled={loading}
                >
                  {sending
                    ? `${streamStatus === "streaming" ? "回复中" : "发送中"}${queuedSendCount > 0 ? ` +${queuedSendCount}` : ""}...`
                    : queuedSendCount > 0
                      ? `发送（队列${queuedSendCount}）`
                      : "发送"}
                </button>
                <button
                  type="button"
                  className="chat-withdraw-btn"
                  onClick={() => void withdrawLatestTaskMessage(activeScene)}
                  disabled={
                    loading
                    || sending
                    || withdrawingLastMessage
                    || streamStatus === "loading"
                    || streamStatus === "streaming"
                    || !canWithdrawSceneMap[activeScene]
                  }
                  title="撤回最近一次已发出的任务"
                >
                  {withdrawingLastMessage ? "撤回中..." : "撤回"}
                </button>
                <button
                  type="button"
                  className={`l3-inline-takeover-btn l3-inline-takeover-btn--chat ${personaIntensityLevelDraft === "L3" ? "is-armed" : ""}`.trim()}
                  onClick={() => void grantL3FullTakeoverPermissions()}
                  disabled={l3TakeoverActionDisabled || loading}
                  title="输入框位的一键 L3 完整接管授权"
                >
                  {l3TakeoverButtonLabel}
                </button>
              </div>
            </footer>
          )}
      </section>

      {/* Right blank area: Tribute Quote Orb */}
      <TributeQuoteOrb />

    </main >
  );
}

export default App;
