export type CompanionMode = "陪伴" | "工作" | "亲情";
export type MessageRole = "aria" | "user";
export type SceneConfigScene = "work" | "fun" | "life" | "love" | "coding";

export type DemoMessage = {
  id: string;
  role: MessageRole;
  text: string;
  time: string;
  timestamp?: number;
  scene?: SceneConfigScene;
};

export type DemoPreferences = {
  mode: CompanionMode;
  online: boolean;
};

export type DemoTodayEngagement = {
  date: string;
  messageCount: number;
  checkinDone: boolean;
  questCompleted: boolean;
  rewardClaimed: boolean;
};

export type DemoEngagement = {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDay: string;
  lastEventAt: string;
  lastEventType: string;
  today: DemoTodayEngagement;
};

export type DemoProactiveState = {
  todayDate: string;
  sentCount: number;
  maxDaily: number;
  cooldownMinutes: number;
  quietHours: {
    start: number;
    end: number;
  };
  lastSentAt: string;
  lastType: string;
};

export type DemoAutonomyInboxItem = {
  id: string;
  suggestionId: string;
  type: string;
  title: string;
  message: string;
  ctaLabel: string;
  prefillText: string;
  status: "pending" | "acked" | "dismissed";
  createdAt: string;
  ackedAt?: string;
};

export type DemoAutonomyQueueItem = {
  id: string;
  flowId?: string;
  dispatchId: string;
  dispatchPrompt: string;
  operation: {
    type: string;
    [key: string]: unknown;
  };
  status: "pending" | "running" | "retrying" | "completed" | "dead";
  attempts: number;
  maxAttempts: number;
  strategy?: {
    enabled: boolean;
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    circuitBreakerThreshold: number;
    circuitOpenMinutes: number;
  };
  createdAt: string;
  updatedAt: string;
  nextRetryAt: string;
  lastError: string;
  lastSummary: string;
  failedAt?: string;
};

export type DemoAutonomyQueueStrategy = {
  enabled: boolean;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  circuitBreakerThreshold: number;
  circuitOpenMinutes: number;
};

export type DemoAutonomyQueuePolicy = {
  enabled: boolean;
  autoProcessOnTick: boolean;
  processLimit: number;
  strategies: Record<string, DemoAutonomyQueueStrategy>;
};

export type DemoAutonomyQueueState = {
  items: DemoAutonomyQueueItem[];
  deadLetters: DemoAutonomyQueueItem[];
  policy: DemoAutonomyQueuePolicy;
  circuits?: Record<string, {
    operationType: string;
    consecutiveFailures: number;
    openUntil: string;
    openedAt: string;
    lastFailedAt: string;
    lastReason: string;
    totalOpens: number;
  }>;
  stats: {
    processed: number;
    succeeded: number;
    retried: number;
    deadLettered: number;
    lastProcessAt: string;
  };
};

export type DemoAutonomyTimelineEvent = {
  id: string;
  flowId: string;
  source: string;
  stage: string;
  status: string;
  title: string;
  detail: string;
  at: string;
  refs?: Record<string, unknown>;
};

export type DemoAutonomyFailureLayer = {
  id: string;
  label: string;
  hint: string;
  count: number;
  examples: string[];
};

export type DemoAutonomyState = {
  enabled: boolean;
  kernelVersion?: string;
  tickCount: number;
  lastTickAt: string;
  lastRepairAt: string;
  lastLearnAt: string;
  generatedCount: number;
  dispatch?: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    lastRunAt: string;
    lastPrompt: string;
    history: Array<{
      id: string;
      flowId?: string;
      kernel: string;
      prompt: string;
      source: string;
      status: string;
      execute: boolean;
      createdAt: string;
      finishedAt: string;
      steps: Array<{
        id: string;
        index: number;
        type: string;
        title: string;
        status: string;
        startedAt: string;
        finishedAt: string;
        reason: string;
      }>;
    }>;
  };
  queue?: DemoAutonomyQueueState;
  inbox: DemoAutonomyInboxItem[];
  timeline?: DemoAutonomyTimelineEvent[];
  failureInsights?: {
    totalFailures: number;
    layers: DemoAutonomyFailureLayer[];
  };
  maintenance: Array<{
    id: string;
    type: string;
    message: string;
    at: string;
  }>;
};

export type WorkdayQuest = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  rewardXp: number;
  careBonus: number;
  status: "todo" | "done";
  completedAt: string;
  note: string;
};

export type DemoWorkdayState = {
  date: string;
  clarityScore: number;
  affectionScore: number;
  flowStreakDays: number;
  flowCombo: number;
  focusMinutes: number;
  totalQuestXp: number;
  completedCount: number;
  totalCount: number;
  quests: WorkdayQuest[];
  rewardLog: Array<{
    id: string;
    type: string;
    summary: string;
    at: string;
  }>;
  lastCheckinAt: string;
  lastSummary: string;
};

export type WorkbenchModule = {
  id: string;
  title: string;
  note: string;
  enabled: boolean;
  status: string;
};

export type WorkbenchTool = {
  id: string;
  title: string;
  summary: string;
  status: string;
  lastRunAt: string;
  lastResult: string;
};

export type WorkbenchFeedItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  at: string;
};

export type CodingWorkspaceEntry = {
  name: string;
  kind: "dir" | "file";
};

export type CodingWorkspaceState = {
  cwd: string;
  absolutePath: string;
  exists: boolean;
  openedAt: string;
  lastAction: string;
  entries: CodingWorkspaceEntry[];
};

export type CodingProjectTreeNode = {
  id: string;
  path: string;
  name: string;
  kind: "dir" | "file";
  depth: number;
  parentPath: string;
};

export type CodingProjectTreeState = {
  rootCwd: string;
  rootAbsolutePath: string;
  maxDepth: number;
  maxNodes: number;
  truncated: boolean;
  generatedAt: string;
  nodes: CodingProjectTreeNode[];
};

export type CodingFilePreviewState = {
  path: string;
  absolutePath: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
  truncated: boolean;
  readonly: boolean;
  content: string;
  generatedAt: string;
};

export type DemoWorkbenchState = {
  layoutVersion: string;
  leftModules: WorkbenchModule[];
  rightTools: WorkbenchTool[];
  modelCenter: {
    currentModel: string;
    options: Array<{
      id: string;
      label: string;
      provider: string;
    }>;
  };
  coding: {
    autopilotEnabled: boolean;
    recentIntents: Array<{
      id: string;
      text: string;
      tags: string[];
      at: string;
    }>;
    lastPlan: string[];
    workspace: CodingWorkspaceState;
  };
  centerFeed: WorkbenchFeedItem[];
  inputBar: {
    hashtagEnabled: boolean;
    voiceEnabled: boolean;
    placeholder: string;
  };
  updatedAt: string;
};

export type ExpansionPack = {
  id: string;
  name: string;
  version: string;
  source: string;
  status: string;
  capabilities: string[];
};

export type ExpansionJob = {
  id: string;
  type: string;
  status: string;
  targetUrl: string;
  saveAs: string;
  reason: string;
  createdAt: string;
  finishedAt: string;
  output: {
    summary: string;
    savedPath: string;
  };
};

export type DemoExpansionState = {
  enabled: boolean;
  independenceMode: boolean;
  packs: ExpansionPack[];
  jobs: ExpansionJob[];
  limits: {
    maxJobs: number;
    maxDailyDownloads: number;
  };
  stats: {
    installedCount: number;
    downloadsToday: number;
  };
  updatedAt: string;
};

export type DemoFunGame = {
  id: string;
  mode: "mini_game" | "handmade_game";
  blueprint?: "snake" | "memory_flip" | "whack_mole" | "reaction" | string;
  title: string;
  prompt: string;
  difficulty: "easy" | "normal" | "hard";
  rounds: number;
  scoreEnabled: boolean;
  rewardEnabled: boolean;
  reviveEnabled: boolean;
  templateId: string;
  templateName: string;
  templateRules: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
  playUrl: string;
  status: string;
};

export type DemoFunRuleTemplate = {
  id: string;
  mode: "mini_game" | "handmade_game";
  name: string;
  rules: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  source: string;
};

export type DemoFunSkillBootstrapEntry = {
  packId: string;
  name: string;
  source: string;
  reason: string;
};

export type DemoFunSkillBootstrapCandidate = {
  packId: string;
  name: string;
  source: string;
  installed: boolean;
};

export type DemoFunSkillBootstrap = {
  ok: boolean;
  reason: string;
  moduleId: "mini_game" | "handmade_game";
  query: string;
  summary: string;
  installed: DemoFunSkillBootstrapEntry[];
  alreadyInstalled: DemoFunSkillBootstrapEntry[];
  failed: DemoFunSkillBootstrapEntry[];
  candidates: DemoFunSkillBootstrapCandidate[];
};

export type DeviceCapability = {
  id: string;
  platform: "desktop" | "mobile";
  name: string;
  description: string;
  risk: "low" | "medium" | "high";
  defaultPermission: "granted" | "blocked" | "prompt";
  permission: "granted" | "blocked" | "prompt";
};

export type DeviceTask = {
  id: string;
  type: string;
  capabilityId: string;
  title: string;
  summary: string;
  target: string;
  status: "planned" | "needs_permission" | "running" | "completed" | "failed";
  reason: string;
  requestedAt: string;
  startedAt: string;
  finishedAt: string;
  output: {
    summary: string;
    metrics?: Record<string, number>;
  } | null;
};

export type DeviceAuditItem = {
  id: string;
  type: string;
  message: string;
  metadata: Record<string, unknown>;
  at: string;
};

export type DemoDeviceOpsState = {
  permissions: Record<string, "granted" | "blocked" | "prompt">;
  capabilities: DeviceCapability[];
  tasks: DeviceTask[];
  audit: DeviceAuditItem[];
  automation: {
    enabled: boolean;
    requireApproval: boolean;
  };
  bridge: {
    enabled: boolean;
    baseUrl: string;
    lastCheckedAt: string;
    lastStatus: string;
    lastError: string;
  };
  lastPermissionUpdateAt: string;
};

export type HardwareStatusResult = {
  ok: boolean;
  reason: string;
  snapshot: {
    platform: string;
    release: string;
    arch: string;
    hostname: string;
    cpu: {
      cores: number;
      model: string;
    };
    memory: {
      totalGb: number;
      freeGb: number;
      usedGb: number;
    };
    battery: {
      level: number;
      charging: boolean;
    };
  } | null;
  bridge: DemoDeviceOpsState["bridge"];
  error: string;
};

export type MemorySearchItem = {
  id: string;
  source: string;
  scene?: string;
  memory_tier?: string;
  content: string;
  score: number;
  embedding_score: number;
  rerank_score: number;
  trigger_confidence: number;
  reasons: string[];
};

export type DemoMemoryItem = {
  id: string;
  source: string;
  scene?: string;
  tier?: string;
  content: string;
};

export type MemoryArchitectureTierConfig = {
  enabled: boolean;
  maxItems: number;
};

export type MemoryArchitectureConfig = {
  mode: "three_plus_one" | "classic" | string;
  shortTerm: MemoryArchitectureTierConfig;
  midTerm: MemoryArchitectureTierConfig;
  longTerm: MemoryArchitectureTierConfig;
  temporary: MemoryArchitectureTierConfig;
  realtimeReasoning: {
    topK: number;
    includeCrossScene: boolean;
    hybridSearch: boolean;
  };
  updatedAt?: string;
};

export type MemoryArchitectureSummary = {
  longTerm: number;
  middleTerm: number;
  shortTerm: number;
  temporary: number;
  vectorIndex: number;
};

export type ProactiveSuggestion = {
  id: string;
  type: string;
  title: string;
  message: string;
  ctaLabel: string;
  prefillText: string;
  rewardHint: string;
  triggerConfidence: number;
  scene: string;
  generatedAt: string;
};

export type ProactiveNextResult = {
  delivered: boolean;
  decision: string;
  reason: string;
  trigger_confidence: number;
  nextEligibleAt: string;
  proactive: DemoProactiveState;
  suggestion: ProactiveSuggestion | null;
  updatedAt: string;
};

export type AutonomyStatusResult = {
  autonomy: DemoAutonomyState;
  runtime: {
    running: boolean;
    cycleRunning?: boolean;
    tickMs: number;
    policyVersion: string;
    policyLoadedAt: string;
    tickCount: number;
    lastTickAt: string;
    lastErrorAt: string;
    lastError: string;
    lastQueueProcessAt?: string;
    lastQueueProcessed?: number;
  };
  policy: {
    version: string;
    autonomy: {
      enabled: boolean;
      idleMinutesBeforeNudge: number;
      maxPendingInbox: number;
      selfLearningEnabled: boolean;
      selfRepairEnabled: boolean;
    };
  };
  updatedAt: string;
};

export type RuntimeFailureLayer = {
  id: string;
  label: string;
  hint: string;
  count: number;
  examples: string[];
};

export type AriaKernelIncidentMatch = {
  id: string;
  title: string;
  layer: string;
  hitCount: number;
  lastAt: string;
  rootCause: string;
  guardrail: string;
  autoFix: string[];
  verifyEndpoint: string;
  samples: string[];
};

export type AriaKernelIncidentPlaybookSnapshot = {
  version: string;
  objective: string;
  totalIncidents: number;
  matchedCount: number;
  unresolvedCount: number;
  matched: AriaKernelIncidentMatch[];
  unresolved: Array<{
    id: string;
    title: string;
    layer: string;
    guardrail: string;
  }>;
  recommendations: string[];
  generatedAt: string;
};

export type AriaKernelIncidentPlaybookResult = {
  userId?: string;
  playbook: AriaKernelIncidentPlaybookSnapshot & {
    incidents?: Array<{
      id: string;
      title: string;
      symptomKeywords: string[];
      layer: string;
      rootCause: string;
      guardrail: string;
      autoFix: string[];
      verifyEndpoint: string;
    }>;
  };
  updatedAt: string;
};

export type RuntimeHealthResult = {
  runtime: {
    api: {
      status: string;
      lastCheckedAt: string;
      lastOkAt: string;
      lastErrorAt: string;
      lastError: string;
      requestTotal: number;
      requestFailed: number;
      requestSlow: number;
      requestCritical: number;
    };
    bridge: {
      status: string;
      lastCheckedAt: string;
      lastOkAt: string;
      lastErrorAt: string;
      lastError: string;
      lastLatencyMs: number;
    };
    queue: {
      pending: number;
      deadLetters: number;
    };
    slo: {
      warnMs: number;
      criticalMs: number;
      recentSlowCount: number;
      recentTotal: number;
      requestTotal: number;
      requestFailed: number;
      failureRate: number;
      slowRate: number;
      failureWarnThreshold: number;
      failureCriticalThreshold: number;
      slowWarnThreshold: number;
      slowCriticalThreshold: number;
      status: "ok" | "warning" | "critical";
      summary: string;
    };
    watchdog: {
      enabled: boolean;
      cycleRunning: boolean;
      tickCount: number;
      lastTickAt: string;
      lastErrorAt: string;
      lastError: string;
      cooldownUntil: string;
      cooldownRemainingMs: number;
      selfHealCooldownMs: number;
      lastSelfHealAt: string;
      lastSelfHealSummary: string;
      lastSelfHealReason: string;
      lastProbeStatus: string;
      skippedReason: string;
      lastManualAction: string;
      lastManualActionAt: string;
      lastManualActionStatus: string;
      lastManualActionSummary: string;
      lastConfigChangeAt: string;
      lastConfigChangeSummary: string;
      lastConfigChangeSource: string;
      mode: "eco" | "balanced" | "peak";
      modeLabel: string;
      queueLimit: number;
      modePresets: Array<{
        mode: "eco" | "balanced" | "peak";
        label: string;
        queueLimit: number;
      }>;
    };
    outage: {
      status: "ok" | "warning" | "critical";
      summary: string;
      recommendation: string;
      cause: string;
    };
  };
  failureInsights: {
    totalFailures: number;
    layers: RuntimeFailureLayer[];
  };
  incidentPlaybook?: AriaKernelIncidentPlaybookSnapshot;
  recentIssues: Array<{
    id: string;
    at: string;
    layer: string;
    reason: string;
    message: string;
    source: string;
    statusCode: number;
  }>;
  selfHealReports: Array<{
    id: string;
    at: string;
    action: "full_heal" | "queue_replay" | "schema_repair";
    mode: "eco" | "balanced" | "peak";
    reason: string;
    summary: string;
    actions: string[];
    queue: {
      pendingBefore: number;
      deadLettersBefore: number;
      pendingAfter: number;
      deadLettersAfter: number;
    };
    touchedUsers: number;
    changedUsers: number;
    queueProcessed: number;
    queueSucceeded: number;
    queueDeadLettered: number;
    saved: boolean;
  }>;
  generatedAt: string;
  updatedAt?: string;
};

export type XhsPipelineLogItem = {
  at: string;
  channel: string;
  text: string;
};

export type XhsPipelineJob = {
  id: string;
  userId: string;
  status: "queued" | "running" | "completed" | "failed" | string;
  reason: string;
  summary: string;
  startedAt: string;
  updatedAt: string;
  finishedAt: string;
  exitCode: number | null;
  pid: number;
  input: {
    theme?: string;
    assetsDir?: string;
    outputRoot?: string;
    publish?: boolean;
    headless?: boolean;
    skipUpload?: boolean;
    model?: string;
    maxAssets?: number;
    clipDurationImageSec?: number;
    clipDurationVideoSec?: number;
  };
  outputDir: string;
  videoFile: string;
  uploadStatus: string;
  runId: string;
  error: string;
  logs: XhsPipelineLogItem[];
  result: Record<string, unknown> | null;
};

export type XhsPipelineStatusResult = {
  ok: boolean;
  userId: string;
  job: XhsPipelineJob | null;
  jobs: XhsPipelineJob[];
  runningCount: number;
  defaults: {
    assetsDir: string;
    outputRoot: string;
    publish: boolean;
    skipUpload: boolean;
    headless: boolean;
  };
  workflow: string[];
  nextStepHint: string;
};

export type XhsPipelineStartInput = {
  theme: string;
  assetsDir: string;
  outputRoot?: string;
  publish?: boolean;
  headless?: boolean;
  skipUpload?: boolean;
  model?: string;
  maxAssets?: number;
  clipDurationImageSec?: number;
  clipDurationVideoSec?: number;
};

export type RuntimeGuardianHealResult = {
  ok: boolean;
  executed: boolean;
  result: {
    ok: boolean;
    source: string;
    force: boolean;
    mode: string;
    queueLimit: number;
    executeRepair: boolean;
    executeQueue: boolean;
    executed: boolean;
    skippedReason: string;
    reason: string;
    summary: string;
    outageStatus: string;
    queue: {
      pendingBefore: number;
      deadLettersBefore: number;
      pendingAfter: number;
      deadLettersAfter: number;
    };
    touchedUsers: number;
    changedUsers: number;
    queueProcessed: number;
    queueSucceeded: number;
    queueDeadLettered: number;
    reportId: string;
  };
  runtimeHealth: RuntimeHealthResult;
  updatedAt: string;
};

export type RuntimeGuardianConfigResult = {
  ok: boolean;
  config: {
    enabled: boolean;
    mode: "eco" | "balanced" | "peak";
    modeLabel: string;
    queueLimit: number;
    changed?: boolean;
    lastConfigChangeAt?: string;
    lastConfigChangeSummary?: string;
  };
  runtimeHealth: RuntimeHealthResult;
  updatedAt: string;
};

export type AutonomyQueueProcessResult = {
  changed: boolean;
  processed: number;
  succeeded: number;
  retried: number;
  deadLettered: number;
};

export type CapabilityAssessmentCore = {
  id: "codex" | "antigravity" | "ariaKernel";
  owner: string;
  name: string;
  summary: string;
  score: number;
  state: "ready" | "growing" | "blocked";
  abilities: Array<{
    id: string;
    title: string;
    status: "ready" | "growing" | "blocked";
  }>;
};

export type CapabilityFusionRuntime = {
  profileVersion: string;
  enabled: boolean;
  readinessScore: number;
  summary: {
    enabledCapabilityCount: number;
    readyCapabilityCount: number;
    duplicateRiskCount: number;
    bridgeReady: boolean;
    dispatchRuns: number;
    timelineEvents: number;
    workbenchFeeds: number;
    expansionPackCount: number;
  };
  capabilities: Array<{
    id: string;
    name: string;
    status: "ready" | "growing" | "blocked";
    enabled: boolean;
    noDuplicateBuild: boolean;
    reusedModules: string[];
    reusedEndpoints: string[];
    missingModules: string[];
    missingEndpoints: string[];
  }>;
};

export type CapabilitySuperAutonomyRuntime = {
  profileVersion: string;
  enabled: boolean;
  mode: string;
  objective: string;
  readinessScore: number;
  summary: {
    skillReadiness: number;
    requiredSkillsReady: number;
    requiredSkillsTotal: number;
    missingRequiredSkillCount: number;
    bridgeReady: boolean;
    gatewayStatus?: string;
    sessionCount?: number;
    dispatchRuns: number;
    timelineEvents: number;
    expansionPackCount: number;
    workbenchFeeds: number;
    taskLedgerPending?: number;
    taskLedgerDeadLetters?: number;
  };
  skills: Array<{
    id: string;
    name: string;
    source: string;
    innovationLevel: string;
    required: boolean;
    ready: boolean;
    reusedEndpoints: string[];
    missingEndpoints: string[];
  }>;
  missingRequiredSkills: Array<{
    id: string;
    name: string;
    missingEndpoints: string[];
  }>;
};

export type CapabilityAssessmentResult = {
  version: string;
  generatedAt: string;
  independent: boolean;
  independenceScore: number;
  fusion?: CapabilityFusionRuntime;
  superAutonomy?: CapabilitySuperAutonomyRuntime;
  cores: CapabilityAssessmentCore[];
  checks: Array<{
    id: string;
    title: string;
    status: "ready" | "growing" | "blocked";
  }>;
};

export type DemoSceneConfigStatus =
  | "configured"
  | "running"
  | "completed"
  | "partial"
  | "pending_permission"
  | "failed";

export type DemoSceneConfigModule = {
  moduleKey: string;
  scene: SceneConfigScene;
  moduleId: string;
  title: string;
  goal: string;
  configText: string;
  prompt: string;
  status: DemoSceneConfigStatus;
  executionCount: number;
  appliedAt: string;
  lastExecutedAt: string;
  lastResult: {
    status: DemoSceneConfigStatus;
    summary: string;
    taskIds: string[];
    dispatchId: string;
    reason: string;
    skillBootstrap?: DemoFunSkillBootstrap;
  };
  soulProfile?: {
    directive: string;
    updatedAt: string;
    uploadedFiles: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      uploadedAt: string;
      excerpt: string;
    }>;
  };
};

export type MemoryBackendSelfCheckResult = {
  checkedAt: string;
  mode: "local" | "qdrant";
  overallStatus: "healthy" | "warning" | "error" | string;
  checks: Array<{
    id: string;
    label: string;
    status: "ok" | "warning" | "error" | string;
    detail: string;
  }>;
  suggestions: Array<{
    id: string;
    title: string;
    level: "required" | "recommended" | "safe" | string;
    detail: string;
  }>;
  environment: {
    platform: string;
    node: string;
    dockerAvailable: boolean;
    brewAvailable: boolean;
  };
  runtime?: SystemConfigResult["memoryPlaneRuntime"];
};

export type DemoSceneConfigState = {
  modules: Record<string, DemoSceneConfigModule>;
  recent: Array<{
    id: string;
    moduleKey: string;
    scene: SceneConfigScene;
    moduleId: string;
    title: string;
    status: DemoSceneConfigStatus;
    summary: string;
    at: string;
  }>;
  updatedAt: string;
};

export type ModelRoutingProvider = {
  id: string;
  vendor: string;
  model: string;
  roles: string[];
  baseUrl?: string;
  apiKeyEnv?: string;
  ariaKernelProvider?: string;
  disabled?: boolean;
};

export type ModelRoutingPolicy = {
  version: string;
  routingMode: string;
  providers: ModelRoutingProvider[];
  taskRoutes: Record<string, string[]>;
  degradeStrategy: {
    timeoutMs: number;
    maxRetries: number;
    retryBackoffMs: number;
  };
  safety?: {
    enablePromptGuard?: boolean;
    enableOutputPolicyGuard?: boolean;
    blockUnknownToolCalls?: boolean;
  };
};

export type SystemProfile = {
  version: string;
  product: string;
  layers: {
    foundation: Record<string, unknown>;
    technology: Record<string, unknown>;
    model: {
      routerPolicy: string;
      defaultRoute: string;
      fallbackRoute: string;
      [key: string]: unknown;
    };
    application: {
      scenePolicy: string;
      enabledScenes: string[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type SceneOrchestrationPolicy = {
  version: string;
  scenes: Record<string, {
    defaultPanel: string;
    mode: string;
    priority: string[];
    capabilities?: string[];
    requiredSkills?: string[];
    responseStyle?: string[];
    memoryStrategy?: {
      longTermWeight?: number;
      shortTermWeight?: number;
      recallTopK?: number;
      allowCrossSceneRecall?: boolean;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  panelSceneMap: Record<string, string>;
  eventTriggers?: Record<string, string[]>;
};

export type SystemConfigOpsSnapshot = {
  id: string;
  createdAt: string;
  action: string;
  actorId: string;
  actorName: string;
  source: string;
  changedSections: string[];
  riskLevel: string;
  summary: string;
  note: string;
};

export type SystemConfigOpsTimelineItem = {
  id: string;
  at: string;
  action: string;
  actorId: string;
  actorName: string;
  source: string;
  changedSections: string[];
  riskLevel: string;
  summary: string;
  note: string;
  snapshotId: string;
  fromSnapshotId: string;
  targetSnapshotId: string;
};

export type SystemConfigOpsPreview = {
  latestSnapshotId: string;
  canRollbackPrevious: boolean;
  snapshots: SystemConfigOpsSnapshot[];
  timeline: SystemConfigOpsTimelineItem[];
};

export type ModelRouterRuntime = {
  realCallEnabled: boolean;
  defaultBaseUrl: string;
  timeoutMs: number;
  maxTokens: number;
  ariaKernel?: {
    path: string;
    ok: boolean;
    reason: string;
    loadedAt: string;
    providerCount: number;
  };
  providerRuntimes: Array<{
    id: string;
    model: string;
    baseUrl: string;
    vendor: string;
    apiKeyConfigured: boolean;
    enabled: boolean;
    authSource?: string;
    ariaKernelProvider?: string;
  }>;
};

export type AriaKernelFlywheelLeaderboardRow = {
  providerId: string;
  model: string;
  runs: number;
  emotionalAvg: number;
  executionAvg: number;
  combinedAvg: number;
  fallbackRate: number;
  lastAt: string;
};

export type AriaKernelFlywheelSignal = {
  id: string;
  at: string;
  flowId: string;
  scene: string;
  taskType: string;
  providerId: string;
  model: string;
  fallback: boolean;
  emotionalScore: number;
  executionScore: number;
  combinedScore: number;
  dispatchStatus: string;
  executionEligible: boolean;
  executed: boolean;
  reason: string;
};

export type AriaKernelFlywheelState = {
  version: string;
  totalSignals: number;
  emotionalQualityAvg: number;
  executionSuccessAvg: number;
  combinedScoreAvg: number;
  executionEligibleCount: number;
  executionCompletedCount: number;
  executionPartialCount: number;
  executionFailedCount: number;
  executionCompletionRate: number;
  fallbackRate: number;
  learningRuns: number;
  lastSignalAt: string;
  lastLearnedAt: string;
  recentSignals: AriaKernelFlywheelSignal[];
  taskLeaderboards: Record<string, AriaKernelFlywheelLeaderboardRow[]>;
  recommendedRoutes: Record<string, string[]>;
  runtime: {
    minRunsToLearn: number;
    minScoreGap: number;
    signalLimit: number;
  };
  modelRouterRuntime: ModelRouterRuntime;
};

export type SystemConfigResult = {
  runtime: {
    loadedAt: string;
    files: Record<string, string>;
    versions: {
      systemProfile: string;
      modelRouting: string;
      scenePolicy: string;
      ariaKernelFusion?: string;
      superAutonomy?: string;
      expansionSecurity?: string;
    };
  };
  systemProfile: SystemProfile;
  modelRoutingPolicy: ModelRoutingPolicy;
  ariaKernelFusionProfile?: Record<string, unknown>;
  superAutonomyProfile?: Record<string, unknown>;
  expansionSecurityPolicy?: Record<string, unknown>;
  ariaKernelIncidentPlaybook?: Record<string, unknown>;
  sceneOrchestrationPolicy: SceneOrchestrationPolicy;
  configOps?: SystemConfigOpsPreview;
  modelRouterRuntime?: ModelRouterRuntime;
  memoryPlaneRuntime?: {
    backend?: string;
    architecture?: Partial<MemoryArchitectureConfig>;
    vector?: {
      mode?: string;
      qdrant?: {
        configured?: boolean;
        url?: string;
        collection?: string;
        ready?: boolean;
        lastCheckAt?: string;
        lastWriteAt?: string;
        lastSearchAt?: string;
        lastStatus?: string;
        lastError?: string;
        lastUpsertId?: string;
        lastSearchHits?: number;
      };
    };
    memorySummary?: Partial<MemoryArchitectureSummary> & {
      sceneCounts?: Record<string, number>;
    };
    jobs?: Record<string, string>;
    stats?: {
      totalWrites?: number;
      dedupeRemovals?: number;
      promotions?: number;
      bootstrappedFromHighlights?: boolean;
    };
  };
};

export type CodingPatchDiffPreview = {
  filePath: string;
  line: number;
  why: string;
  status: string;
  summary: string;
  preview: string;
  beforeSnippet: string;
  afterSnippet: string;
};

export type CodingPatchDraft = {
  id: string;
  status: string;
  objective: string;
  cwd: string;
  summary: string;
  riskLevel: "low" | "medium" | "high" | string;
  riskNotes: string[];
  createdAt: string;
  updatedAt: string;
  lastError: string;
  applyReceiptId: string;
  changedFiles: string[];
  verify: {
    ok: boolean;
    bridgeOk: boolean;
    reason: string;
    summary: string;
    commands: string[];
  } | null;
  proposal: {
    summary: string;
    verifyCommands: string[];
    edits: Array<{
      filePath: string;
      why: string;
    }>;
  };
  diffs: CodingPatchDiffPreview[];
};

export type CodingPatchReceipt = {
  id: string;
  draftId: string;
  status: string;
  summary: string;
  objective: string;
  cwd: string;
  createdAt: string;
  appliedAt: string;
  changedFiles: string[];
  verify: {
    ok: boolean;
    bridgeOk: boolean;
    reason: string;
    summary: string;
    commands: string[];
  } | null;
  rollback: {
    available: boolean;
    status: string;
    rolledBackAt: string;
    summary: string;
  };
};

export type CodingPatchGateState = {
  latestDraftId: string;
  latestReceiptId: string;
  updatedAt: string;
  totalDrafts: number;
  totalReceipts: number;
  drafts: CodingPatchDraft[];
  receipts: CodingPatchReceipt[];
};

export type UnifiedTimelineEvent = DemoAutonomyTimelineEvent;

export type UnifiedTimelineFlow = {
  flowId: string;
  title: string;
  startedAt: string;
  lastAt: string;
  status: string;
  sources: string[];
  stages: string[];
  total: number;
  success: number;
  warnings: number;
  errors: number;
};

export type TimelineGraphNode = {
  id: string;
  index: number;
  type: string;
  title: string;
  status: string;
  reason: string;
  source: string;
};

export type TimelineGraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
};

export type TimelineRootCauseLayer = {
  layerId: string;
  layerLabel: string;
  hint: string;
  count: number;
  reasons: Array<{
    reason: string;
    count: number;
  }>;
  samples: string[];
};

export type TimelineFlowDiagnosis = {
  flowId: string;
  summary: UnifiedTimelineFlow;
  graph: {
    source: string;
    nodes: TimelineGraphNode[];
    edges: TimelineGraphEdge[];
    stats: {
      totalNodes: number;
      totalEdges: number;
      completedNodes: number;
      failedNodes: number;
      blockedNodes: number;
    };
  };
  rootCauses: TimelineRootCauseLayer[];
  suggestedRepair: {
    mode: string;
    label: string;
    reason: string;
  };
  generatedAt: string;
};

export type UnifiedTimelineResult = {
  flowId: string;
  total: number;
  events: UnifiedTimelineEvent[];
  flows: UnifiedTimelineFlow[];
};

export type UnifiedTimelineReplayResult = {
  flowId: string;
  summary: UnifiedTimelineFlow;
  events: UnifiedTimelineEvent[];
  diagnosis?: TimelineFlowDiagnosis;
  generatedAt: string;
};

export type AgiGoalContractSchema = {
  version: string;
  required: string[];
  objective: {
    required: string[];
    enum: {
      scene: string[];
      intentFamily: string[];
      priority: string[];
    };
  };
  constraints: {
    required: string[];
    enum: {
      riskLevel: string[];
    };
  };
  plan: {
    required: string[];
  };
  delivery: {
    required: string[];
  };
};

export type AgiGoalContract = {
  id: string;
  contractVersion: string;
  createdAt: string;
  objective: {
    text: string;
    scene: string;
    mode: string;
    intentFamily: string;
    priority: string;
  };
  constraints: {
    riskLevel: string;
    mutationAllowed: boolean;
    maxSteps: number;
    expectedTimeBudgetMinutes: number;
  };
  plan: {
    operations: Array<Record<string, unknown>>;
    stepCount: number;
  };
  delivery: {
    requiredEvidence: string[];
    expectedDeliverables: Array<{
      type: string;
      label: string;
      required: boolean;
    }>;
  };
  successCriteria: string[];
};

export type AgiTaskGraph = {
  source: string;
  nodes: Array<{
    id: string;
    index: number;
    type: string;
    title: string;
    status: string;
    reason?: string;
    dependsOn?: string[];
    operation?: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    relation: string;
  }>;
  stats: {
    totalNodes: number;
    totalEdges: number;
  };
};

export type AgiExecutionReceipt = {
  receiptId: string;
  contractId?: string;
  status: string;
  summary: string;
  dispatchId: string;
  flowId: string;
  evidenceCount: number;
  artifactCount: number;
  topFailureLayer?: string;
  evidence: Array<{
    id: string;
    stepId: string;
    stepIndex: number;
    stepType: string;
    status: string;
    kind: string;
    label: string;
    value: string;
  }>;
  artifacts: Array<{
    kind: string;
    label: string;
    value: string;
  }>;
  generatedAt: string;
};

export type AgiAutoRepair = {
  enabled: boolean;
  applied?: boolean;
  skipped?: boolean;
  reason?: string;
  requestedMode?: string;
  recommended?: {
    mode: string;
    layerId: string;
    label: string;
    reason: string;
    actions: string[];
  };
  result?: {
    mode: string;
    flowId: string;
    targetFlowId: string;
    retriedDeadLetterCount: number;
    grantedCapabilities: string[];
    queueProcessResult: {
      changed: boolean;
      processed: number;
      succeeded: number;
      retried: number;
      deadLettered: number;
    };
    rerunDispatch: {
      id: string;
      flowId: string;
      status: string;
      prompt: string;
    } | null;
  };
  beforeDiagnosis?: TimelineFlowDiagnosis;
  diagnosis?: TimelineFlowDiagnosis;
};

export type AgiFrameworkResult = {
  userId: string;
  agi: Record<string, unknown>;
  goalContractSchema: AgiGoalContractSchema;
  preview: {
    input: string;
    steps: Array<Record<string, unknown>>;
    stepCount: number;
    goalContract: AgiGoalContract;
    taskGraph: AgiTaskGraph;
    executionReceipt: AgiExecutionReceipt;
  } | null;
  updatedAt: string;
};

export type AgiGoalContractCompileResult = {
  userId: string;
  ok: boolean;
  goalContractSchema: AgiGoalContractSchema;
  goalContract: AgiGoalContract;
  taskGraph: AgiTaskGraph;
  executionReceipt: AgiExecutionReceipt;
  agi: Record<string, unknown>;
  updatedAt: string;
};

export type AgiGoalContractSchemaResult = {
  userId: string;
  goalContractSchema: AgiGoalContractSchema;
  preview: {
    input: string;
    goalContract: AgiGoalContract;
    taskGraph: AgiTaskGraph;
    executionReceipt: AgiExecutionReceipt;
  } | null;
  agi: Record<string, unknown>;
  updatedAt: string;
};

export type AgiDispatchSummary = {
  id: string;
  flowId?: string;
  kernel: string;
  prompt: string;
  source: string;
  status: string;
  createdAt: string;
  finishedAt: string;
  execute: boolean;
  steps: Array<{
    id: string;
    index: number;
    type: string;
    title: string;
    status: string;
    reason: string;
    startedAt: string;
    finishedAt: string;
    output?: Record<string, unknown> | null;
  }>;
};

export type AgiExecuteResult = {
  userId: string;
  ok: boolean;
  execute: boolean;
  input: string;
  plan: Array<Record<string, unknown>>;
  goalContractSchema: AgiGoalContractSchema;
  goalContract: AgiGoalContract;
  taskGraph: AgiTaskGraph;
  executionReceipt: AgiExecutionReceipt;
  diagnosis: TimelineFlowDiagnosis | null;
  autoRepair: AgiAutoRepair;
  dispatch: AgiDispatchSummary | null;
  initialDispatch?: AgiDispatchSummary | null;
  autonomy: DemoAutonomyState;
  deviceOps: DemoDeviceOpsState;
  expansion: DemoExpansionState;
  agi: Record<string, unknown>;
  updatedAt: string;
};

export type DemoState = {
  userId: string;
  preferences: DemoPreferences;
  messages: DemoMessage[];
  sceneMessages?: Record<SceneConfigScene, DemoMessage[]>;
  memoryHighlights: string[];
  engagement: DemoEngagement;
  proactive?: DemoProactiveState;
  autonomy?: DemoAutonomyState;
  workday?: DemoWorkdayState;
  deviceOps?: DemoDeviceOpsState;
  workbench?: DemoWorkbenchState;
  expansion?: DemoExpansionState;
  sceneConfig?: DemoSceneConfigState;
  funGames?: DemoFunGame[];
  funRuleTemplates?: DemoFunRuleTemplate[];
  updatedAt: string;
};

export type EngagementEventType =
  | "app_open"
  | "message_sent"
  | "daily_checkin"
  | "quest_complete"
  | "reward_claim"
  | "session_resume";

export type StreamMetaPayload = {
  streamId: string;
  userMessage: DemoMessage;
  modelRoute?: ModelRouteInfo;
};

export type StreamChunkPayload = {
  streamId: string;
  index: number;
  chunk: string;
  fullText: string;
};

export type StreamDonePayload = {
  streamId: string;
  state: DemoState;
  delta: {
    userMessage: DemoMessage;
    assistantMessage: DemoMessage;
  };
  modelRoute?: ModelRouteInfo;
  autoExecution?: AutoExecutionInfo;
  flywheel?: {
    signalId: string;
    emotionalScore: number;
    executionScore: number;
    combinedScore: number;
  };
  engagement: {
    xpGain: number;
  };
};

export type ModelRouteAttempt = {
  providerId: string;
  model: string;
  attempt: number;
  ok: boolean;
  reason: string;
  status: number;
  error: string;
};

export type ModelRouteInfo = {
  taskType: string;
  source: string;
  providerId: string;
  model: string;
  fallback: boolean;
  attempts?: ModelRouteAttempt[];
};

export type AutoExecutionInfo = {
  executed: boolean;
  reason: string;
  summary: string;
  dispatchId: string;
  dispatchStatus: string;
  idempotencyHit?: boolean;
  autoRepairApplied?: boolean;
  autoRepairMode?: string;
  autoRepairSummary?: string;
};

export type WithdrawLastMessageResult = {
  ok: boolean;
  reason: string;
  withdrawn: {
    scene: SceneConfigScene | "";
    removedCount: number;
    assistantRemovedCount: number;
    removedMessageIds: string[];
    userMessage?: DemoMessage | null;
  };
  state: DemoState;
  updatedAt: string;
};

export type StreamHandlers = {
  onMeta?: (payload: StreamMetaPayload) => void;
  onChunk?: (payload: StreamChunkPayload) => void;
  onDone?: (payload: StreamDonePayload) => void;
};

type StreamSendOptions = {
  preferredProviderId?: string;
  taskType?: "emotional_companion" | "work_planning" | "memory_digest" | "autonomy_dispatch" | "coding_execution";
  scene?: SceneConfigScene;
};

function isLoopbackHost(hostInput: string) {
  const host = String(hostInput || "").trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host === "[::1]";
}

function buildApiBaseCandidates() {
  const envBaseRaw = String(import.meta.env.VITE_ARIA_API_BASE || "").trim();
  const candidates: string[] = [];
  const push = (valueInput: string) => {
    const value = String(valueInput || "").trim().replace(/\/+$/, "");
    if (!value) return;
    if (!/^https?:\/\//i.test(value)) return;
    if (!candidates.includes(value)) {
      candidates.push(value);
    }
  };

  if (typeof window !== "undefined" && window.location) {
    const origin = String(window.location.origin || "").trim();
    if (/^https?:\/\//i.test(origin)) {
      push(origin);
    }

    push(envBaseRaw);

    const browserHost = String(window.location.hostname || "").trim();
    if (browserHost) {
      if (isLoopbackHost(browserHost)) {
        push("http://127.0.0.1:8787");
        push("http://localhost:8787");
      } else {
        const browserProtocol = window.location.protocol === "https:" ? "https:" : "http:";
        push(`${browserProtocol}//${browserHost}:8787`);
      }
    }
  } else {
    push(envBaseRaw);
  }

  push("http://127.0.0.1:8787");
  return candidates;
}

const API_BASE_CANDIDATES = buildApiBaseCandidates();
const API_BASE = API_BASE_CANDIDATES[0] || "http://127.0.0.1:8787";
const RUNTIME_START_HINT =
  "无法连接本地服务。可先执行 bash scripts/restart-desktop-web.sh（一键重启前后端），或在 apps/desktop 执行 npm run dev:web（自动拉起运行时）。";
const CLIENT_SCOPE_RAW = String(import.meta.env.VITE_ARIA_CLIENT_SCOPE || "aria-desktop").trim();
const CLIENT_SCOPE = CLIENT_SCOPE_RAW || "aria-desktop";
const STORAGE_SCOPE = CLIENT_SCOPE
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .slice(0, 40) || "aria_desktop";
const DEVICE_ID_KEY = `aria_demo_device_id_${STORAGE_SCOPE}`;
const TOKEN_KEY = `aria_demo_token_${STORAGE_SCOPE}`;
const USER_ID_KEY = `aria_demo_user_id_${STORAGE_SCOPE}`;
const LEGACY_COMPAT_BRIDGE_KEY = "aria_legacy_compat_bridge_enabled";
const LEGACY_COMPAT_BRIDGE_DEFAULT_ENABLED = import.meta.env.VITE_ARIA_LEGACY_COMPAT_ENABLED !== "false";
const TRANSIENT_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const STREAM_RETRY_MAX_ATTEMPTS = 3;
const STREAM_RETRY_BASE_MS = 850;
const STREAM_CONNECT_TIMEOUT_MS = (() => {
  const parsed = Number(import.meta.env.VITE_ARIA_STREAM_CONNECT_TIMEOUT_MS || 25000);
  if (!Number.isFinite(parsed)) return 25000;
  return Math.max(3000, Math.min(90000, Math.round(parsed)));
})();
const STREAM_IDLE_TIMEOUT_MS = (() => {
  const parsed = Number(import.meta.env.VITE_ARIA_STREAM_IDLE_TIMEOUT_MS || 12000);
  if (!Number.isFinite(parsed)) return 12000;
  return Math.max(3000, Math.min(90000, Math.round(parsed)));
})();
const STREAM_TOTAL_TIMEOUT_MS = (() => {
  const parsed = Number(import.meta.env.VITE_ARIA_STREAM_TOTAL_TIMEOUT_MS || 90000);
  if (!Number.isFinite(parsed)) return 90000;
  return Math.max(10000, Math.min(300000, Math.round(parsed)));
})();
let legacyCompatBridgeEnabledCache: boolean | null = null;

function parseBooleanFlag(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "on", "yes", "enabled"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "off", "no", "disabled"].includes(normalized)) {
    return false;
  }
  return null;
}

function readLegacyCompatBridgeFromStorage() {
  const raw = localStorage.getItem(LEGACY_COMPAT_BRIDGE_KEY);
  if (!raw) {
    return LEGACY_COMPAT_BRIDGE_DEFAULT_ENABLED;
  }
  const parsed = parseBooleanFlag(raw);
  if (parsed === null) {
    return LEGACY_COMPAT_BRIDGE_DEFAULT_ENABLED;
  }
  return parsed;
}

export function isLegacyCompatBridgeEnabled() {
  if (legacyCompatBridgeEnabledCache === null) {
    legacyCompatBridgeEnabledCache = readLegacyCompatBridgeFromStorage();
  }
  return legacyCompatBridgeEnabledCache;
}

export function setLegacyCompatBridgeEnabled(enabled: boolean) {
  const normalized = Boolean(enabled);
  legacyCompatBridgeEnabledCache = normalized;
  localStorage.setItem(LEGACY_COMPAT_BRIDGE_KEY, normalized ? "true" : "false");
  return normalized;
}

export function resetLegacyCompatBridgeEnabled() {
  legacyCompatBridgeEnabledCache = LEGACY_COMPAT_BRIDGE_DEFAULT_ENABLED;
  localStorage.removeItem(LEGACY_COMPAT_BRIDGE_KEY);
  return legacyCompatBridgeEnabledCache;
}

export function getLegacyCompatBridgeConfig() {
  const enabled = isLegacyCompatBridgeEnabled();
  return {
    enabled,
    source: localStorage.getItem(LEGACY_COMPAT_BRIDGE_KEY) ? "localStorage" : "env_default"
  } as const;
}

function getDeviceId() {
  const cached = localStorage.getItem(DEVICE_ID_KEY);
  if (cached) {
    return cached;
  }
  const generated = `desktop-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

const demoDeviceId = getDeviceId();
export const demoApiBase = API_BASE;
const EMBEDDED_RUNTIME_ENABLED = import.meta.env.VITE_ARIA_EMBEDDED_RUNTIME !== "false";
const EMBEDDED_RUNTIME_HEADER = "x-aria-embedded-runtime";

type EmbeddedRuntimeStore = {
  guestToken: string;
  state: DemoState;
  systemConfig: SystemConfigResult;
  systemConfigHistory: SystemConfigOpsPreview;
  codingPatchGate: CodingPatchGateState;
  runtimeHealth: RuntimeHealthResult;
  capabilityAssessment: CapabilityAssessmentResult;
  flywheel: AriaKernelFlywheelState;
  timeline: UnifiedTimelineResult;
  voiceProfile: VoiceProfileState;
  voiceChannel: VoiceChannelSnapshot | null;
  xhsJobs: XhsPipelineJob[];
};

let embeddedRuntimeStore: EmbeddedRuntimeStore | null = null;
let embeddedMessageSequence = 0;
let embeddedTaskSequence = 0;
let embeddedPackSequence = 0;

function deepCloneValue<T>(input: T): T {
  try {
    return structuredClone(input);
  } catch {
    return JSON.parse(JSON.stringify(input)) as T;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function nowClock() {
  return new Date().toLocaleTimeString("zh-CN", {
    hour12: false
  });
}

function nextEmbeddedId(prefix: string) {
  embeddedMessageSequence += 1;
  return `${prefix}-${Date.now()}-${embeddedMessageSequence}`;
}

function nextEmbeddedTaskId() {
  embeddedTaskSequence += 1;
  return `task-${Date.now()}-${embeddedTaskSequence}`;
}

function nextEmbeddedPackId() {
  embeddedPackSequence += 1;
  return `pack-${Date.now()}-${embeddedPackSequence}`;
}

function asEmbeddedRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as Record<string, unknown>;
}

function clampEmbeddedInt(input: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(input ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function normalizeEmbeddedMemoryArchitecture(
  input: unknown,
  fallback?: Partial<MemoryArchitectureConfig>
): MemoryArchitectureConfig {
  const source = asEmbeddedRecord(input);
  const fallbackSource = asEmbeddedRecord(fallback);
  const sourceShort = asEmbeddedRecord(source.shortTerm);
  const sourceMid = asEmbeddedRecord(source.midTerm);
  const sourceLong = asEmbeddedRecord(source.longTerm);
  const sourceTemporary = asEmbeddedRecord(source.temporary);
  const sourceReasoning = asEmbeddedRecord(source.realtimeReasoning);
  const fallbackShort = asEmbeddedRecord(fallbackSource.shortTerm);
  const fallbackMid = asEmbeddedRecord(fallbackSource.midTerm);
  const fallbackLong = asEmbeddedRecord(fallbackSource.longTerm);
  const fallbackTemporary = asEmbeddedRecord(fallbackSource.temporary);
  const fallbackReasoning = asEmbeddedRecord(fallbackSource.realtimeReasoning);
  const rawMode = String(source.mode ?? fallbackSource.mode ?? "three_plus_one").trim().toLowerCase();
  const mode = rawMode === "classic" || rawMode === "legacy" ? "classic" : "three_plus_one";
  return {
    mode,
    shortTerm: {
      enabled: sourceShort.enabled === undefined ? fallbackShort.enabled !== false : sourceShort.enabled !== false,
      maxItems: clampEmbeddedInt(sourceShort.maxItems, clampEmbeddedInt(fallbackShort.maxItems, 260, 20, 6000), 20, 6000)
    },
    midTerm: {
      enabled: mode === "three_plus_one" && (sourceMid.enabled === undefined ? fallbackMid.enabled !== false : sourceMid.enabled !== false),
      maxItems: clampEmbeddedInt(sourceMid.maxItems, clampEmbeddedInt(fallbackMid.maxItems, 420, 20, 6000), 20, 6000)
    },
    longTerm: {
      enabled: sourceLong.enabled === undefined ? fallbackLong.enabled !== false : sourceLong.enabled !== false,
      maxItems: clampEmbeddedInt(sourceLong.maxItems, clampEmbeddedInt(fallbackLong.maxItems, 360, 20, 6000), 20, 6000)
    },
    temporary: {
      enabled: sourceTemporary.enabled === undefined ? fallbackTemporary.enabled !== false : sourceTemporary.enabled !== false,
      maxItems: clampEmbeddedInt(sourceTemporary.maxItems, clampEmbeddedInt(fallbackTemporary.maxItems, 180, 20, 6000), 20, 6000)
    },
    realtimeReasoning: {
      topK: clampEmbeddedInt(sourceReasoning.topK, clampEmbeddedInt(fallbackReasoning.topK, 8, 1, 24), 1, 24),
      includeCrossScene: sourceReasoning.includeCrossScene === undefined ? fallbackReasoning.includeCrossScene !== false : sourceReasoning.includeCrossScene !== false,
      hybridSearch: sourceReasoning.hybridSearch === undefined ? fallbackReasoning.hybridSearch !== false : sourceReasoning.hybridSearch !== false
    },
    updatedAt: String(source.updatedAt || fallbackSource.updatedAt || nowIso())
  };
}

function parseEmbeddedRequestBody(body: RequestInit["body"]) {
  if (typeof body !== "string" || !body.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // ignore invalid json body
  }
  return {};
}

function makeEmbeddedJsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      [EMBEDDED_RUNTIME_HEADER]: "1"
    }
  });
}

function isKnownScene(sceneInput: string): sceneInput is SceneConfigScene {
  return sceneInput === "work" || sceneInput === "fun" || sceneInput === "life" || sceneInput === "love" || sceneInput === "coding";
}

function normalizeScene(sceneInput: unknown, fallback: SceneConfigScene = "love"): SceneConfigScene {
  const value = String(sceneInput || "").trim();
  if (isKnownScene(value)) {
    return value;
  }
  return fallback;
}

function ensureEngagementToday(engagement: DemoEngagement) {
  const today = nowIso().slice(0, 10);
  if (engagement.today.date === today) {
    return;
  }
  engagement.today = {
    date: today,
    messageCount: 0,
    checkinDone: false,
    questCompleted: false,
    rewardClaimed: false
  };
  engagement.lastActiveDay = today;
}

function buildEmbeddedSystemConfig(loadedAt: string): SystemConfigResult {
  const providers: ModelRoutingProvider[] = [
    {
      id: "aria-empathy",
      vendor: "openai",
      model: "gpt-4.1-mini",
      roles: ["emotional_companion", "memory_digest"],
      ariaKernelProvider: "openai"
    },
    {
      id: "aria-executor",
      vendor: "openai",
      model: "gpt-4.1",
      roles: ["work_planning", "autonomy_dispatch", "coding_execution"],
      ariaKernelProvider: "openai"
    },
    {
      id: "aria-fast",
      vendor: "openai",
      model: "gpt-4o-mini",
      roles: ["emotional_companion", "work_planning"],
      ariaKernelProvider: "openai"
    },
    {
      id: "cn-aliyun-qwen-plus",
      vendor: "openai-compatible",
      model: "qwen-plus",
      roles: ["emotional_companion", "work_planning", "coding_execution", "memory_digest"],
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKeyEnv: "ARIA_MODEL_PROVIDER_CN_ALIYUN_QWEN_PLUS_API_KEY",
      ariaKernelProvider: "dashscope"
    },
    {
      id: "cn-deepseek-chat",
      vendor: "openai-compatible",
      model: "deepseek-chat",
      roles: ["work_planning", "autonomy_dispatch", "coding_execution", "memory_digest"],
      baseUrl: "https://api.deepseek.com/v1",
      apiKeyEnv: "ARIA_MODEL_PROVIDER_CN_DEEPSEEK_CHAT_API_KEY",
      ariaKernelProvider: "deepseek"
    },
    {
      id: "cn-zhipu-glm-4-plus",
      vendor: "openai-compatible",
      model: "glm-4-plus",
      roles: ["emotional_companion", "work_planning", "coding_execution"],
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      apiKeyEnv: "ARIA_MODEL_PROVIDER_CN_ZHIPU_GLM_4_PLUS_API_KEY",
      ariaKernelProvider: "zhipu"
    },
    {
      id: "cn-siliconflow-deepseek-v3",
      vendor: "openai-compatible",
      model: "deepseek-ai/DeepSeek-V3",
      roles: ["work_planning", "autonomy_dispatch", "coding_execution", "memory_digest"],
      baseUrl: "https://api.siliconflow.cn/v1",
      apiKeyEnv: "ARIA_MODEL_PROVIDER_CN_SILICONFLOW_DEEPSEEK_V3_API_KEY",
      ariaKernelProvider: "siliconflow"
    },
    {
      id: "cn-siliconflow-qwen",
      vendor: "openai-compatible",
      model: "Qwen/Qwen2.5-72B-Instruct",
      roles: ["emotional_companion", "work_planning", "coding_execution", "memory_digest"],
      baseUrl: "https://api.siliconflow.cn/v1",
      apiKeyEnv: "ARIA_MODEL_PROVIDER_CN_SILICONFLOW_QWEN_API_KEY",
      ariaKernelProvider: "siliconflow"
    },
    {
      id: "aria-safe-fallback",
      vendor: "builtin",
      model: "aria-companion-template",
      roles: ["emotional_companion", "work_planning", "memory_digest", "autonomy_dispatch", "coding_execution"],
      ariaKernelProvider: "embedded"
    }
  ];

  const taskRoutes: Record<string, string[]> = {
    emotional_companion: [
      "aria-empathy",
      "cn-aliyun-qwen-plus",
      "cn-zhipu-glm-4-plus",
      "aria-fast",
      "aria-safe-fallback"
    ],
    work_planning: [
      "aria-executor",
      "cn-aliyun-qwen-plus",
      "cn-deepseek-chat",
      "aria-fast",
      "aria-safe-fallback"
    ],
    memory_digest: [
      "aria-empathy",
      "cn-aliyun-qwen-plus",
      "cn-siliconflow-qwen",
      "aria-safe-fallback"
    ],
    autonomy_dispatch: [
      "aria-executor",
      "cn-deepseek-chat",
      "cn-siliconflow-deepseek-v3",
      "aria-safe-fallback"
    ],
    coding_execution: [
      "aria-executor",
      "cn-deepseek-chat",
      "cn-siliconflow-deepseek-v3",
      "aria-safe-fallback"
    ]
  };

  return {
    runtime: {
      loadedAt,
      files: {
        systemProfile: "embedded://system-profile",
        modelRouting: "embedded://model-routing",
        scenePolicy: "embedded://scene-policy",
        ariaKernelFusion: "embedded://aria-kernel-fusion"
      },
      versions: {
        systemProfile: "embedded.v1",
        modelRouting: "embedded.v1",
        scenePolicy: "embedded.v1",
        ariaKernelFusion: "embedded.v1",
        superAutonomy: "embedded.v1",
        expansionSecurity: "embedded.v1"
      }
    },
    systemProfile: {
      version: "embedded.v1",
      product: "Aria Desktop",
      layers: {
        foundation: {
          mission: "陪伴 + 执行双核",
          mode: "desktop_embedded_runtime"
        },
        technology: {
          runtime: "embedded-web-runtime",
          api: "builtin-fallback"
        },
        model: {
          routerPolicy: "embedded.v1",
          defaultRoute: "aria-empathy",
          fallbackRoute: "aria-safe-fallback"
        },
        application: {
          scenePolicy: "embedded.v1",
          enabledScenes: ["work", "fun", "life", "love", "coding"]
        }
      }
    },
    modelRoutingPolicy: {
      version: "embedded.v1",
      routingMode: "multi_provider_with_fallback",
      providers,
      taskRoutes,
      degradeStrategy: {
        timeoutMs: 20000,
        maxRetries: 2,
        retryBackoffMs: 1200
      },
      safety: {
        enablePromptGuard: true,
        enableOutputPolicyGuard: true,
        blockUnknownToolCalls: true
      }
    },
    ariaKernelFusionProfile: {
      version: "embedded.v1",
      enabled: true,
      mode: "companion_plus_executor"
    },
    superAutonomyProfile: {
      version: "embedded.v1",
      enabled: true,
      mode: "assisted"
    },
    expansionSecurityPolicy: {
      version: "embedded.v1",
      networkDownloadRequireConsent: true,
      executeUntrustedPayload: false
    },
    ariaKernelIncidentPlaybook: {
      version: "embedded.v1",
      guidance: "内置运行时已启用，优先保证聊天连续与操作可回退。"
    },
    sceneOrchestrationPolicy: {
      version: "embedded.v1",
      scenes: {
        love: {
          defaultPanel: "chat",
          mode: "emotional_companion",
          priority: ["warmth", "listening", "micro_actions"],
          requiredSkills: ["companion_dialogue"],
          responseStyle: ["warm", "human", "non_template"]
        },
        life: {
          defaultPanel: "memory",
          mode: "memory_digest",
          priority: ["continuity", "personalization", "gentle_guidance"]
        },
        work: {
          defaultPanel: "workday",
          mode: "work_planning",
          priority: ["clarity", "execution", "result"]
        },
        coding: {
          defaultPanel: "workday",
          mode: "coding_execution",
          priority: ["patch_safety", "verification", "delivery"]
        },
        fun: {
          defaultPanel: "funzone",
          mode: "emotional_companion",
          priority: ["playfulness", "interaction", "lightweight"]
        }
      },
      panelSceneMap: {
        chat: "love",
        memory: "life",
        workday: "work",
        funzone: "fun",
        brain: "coding"
      },
      eventTriggers: {
        app_open: ["warm_greeting"],
        message_sent: ["memory_digest", "emotion_update"]
      }
    },
    modelRouterRuntime: {
      realCallEnabled: false,
      defaultBaseUrl: "embedded://runtime",
      timeoutMs: 20000,
      maxTokens: 1600,
      ariaKernel: {
        path: "embedded://aria-kernel/providers",
        ok: true,
        reason: "embedded_runtime_ready",
        loadedAt,
        providerCount: providers.length
      },
      providerRuntimes: providers.map((provider) => ({
        id: provider.id,
        model: provider.model,
        baseUrl: provider.baseUrl || "embedded://runtime",
        vendor: provider.vendor,
        apiKeyConfigured: true,
        enabled: !provider.disabled,
        authSource: "embedded",
        ariaKernelProvider: provider.ariaKernelProvider
      }))
    },
    memoryPlaneRuntime: {
      backend: "embedded-memory",
      architecture: normalizeEmbeddedMemoryArchitecture({
        mode: "three_plus_one",
        shortTerm: { enabled: true, maxItems: 260 },
        midTerm: { enabled: true, maxItems: 420 },
        longTerm: { enabled: true, maxItems: 360 },
        temporary: { enabled: true, maxItems: 180 },
        realtimeReasoning: {
          topK: 8,
          includeCrossScene: true,
          hybridSearch: true
        },
        updatedAt: loadedAt
      }),
      vector: {
        mode: "local",
        qdrant: {
          configured: false,
          ready: true,
          lastStatus: "embedded_ready",
          lastCheckAt: loadedAt
        }
      },
      memorySummary: {
        longTerm: 12,
        middleTerm: 9,
        shortTerm: 24,
        temporary: 8,
        vectorIndex: 44,
        sceneCounts: {
          love: 14,
          life: 10,
          work: 12,
          coding: 5,
          fun: 3
        }
      },
      jobs: {
        digest: "ready",
        recall: "ready"
      },
      stats: {
        totalWrites: 44,
        dedupeRemovals: 2,
        promotions: 6,
        bootstrappedFromHighlights: true
      }
    }
  };
}

function buildEmbeddedAutonomyQueue(now: string): DemoAutonomyQueueState {
  return {
    items: [
      {
        id: "queue-seed-1",
        flowId: "flow-seed-1",
        dispatchId: "dispatch-seed-1",
        dispatchPrompt: "整理今天最重要的三件事并输出执行顺序",
        operation: {
          type: "work_planning",
          scene: "work"
        },
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        strategy: {
          enabled: true,
          maxAttempts: 3,
          baseDelayMs: 1500,
          maxDelayMs: 30000,
          circuitBreakerThreshold: 4,
          circuitOpenMinutes: 5
        },
        createdAt: now,
        updatedAt: now,
        nextRetryAt: now,
        lastError: "",
        lastSummary: "等待用户确认"
      }
    ],
    deadLetters: [],
    policy: {
      enabled: true,
      autoProcessOnTick: true,
      processLimit: 6,
      strategies: {
        work_planning: {
          enabled: true,
          maxAttempts: 3,
          baseDelayMs: 1500,
          maxDelayMs: 60000,
          circuitBreakerThreshold: 4,
          circuitOpenMinutes: 5
        },
        coding_execution: {
          enabled: true,
          maxAttempts: 4,
          baseDelayMs: 2000,
          maxDelayMs: 90000,
          circuitBreakerThreshold: 3,
          circuitOpenMinutes: 10
        },
        autonomy_dispatch: {
          enabled: true,
          maxAttempts: 3,
          baseDelayMs: 1600,
          maxDelayMs: 60000,
          circuitBreakerThreshold: 4,
          circuitOpenMinutes: 8
        }
      }
    },
    circuits: {},
    stats: {
      processed: 0,
      succeeded: 0,
      retried: 0,
      deadLettered: 0,
      lastProcessAt: now
    }
  };
}

function buildEmbeddedWorkday(now: string): DemoWorkdayState {
  const today = now.slice(0, 10);
  return {
    date: today,
    clarityScore: 78,
    affectionScore: 85,
    flowStreakDays: 3,
    flowCombo: 2,
    focusMinutes: 40,
    totalQuestXp: 120,
    completedCount: 1,
    totalCount: 3,
    quests: [
      {
        id: "quest-1",
        code: "q-focus-25",
        title: "先推进 25 分钟关键任务",
        description: "关掉干扰，先把最关键的一步做完",
        category: "focus",
        minutes: 25,
        rewardXp: 16,
        careBonus: 4,
        status: "done",
        completedAt: now,
        note: "已经完成第一轮"
      },
      {
        id: "quest-2",
        code: "q-plan-3",
        title: "列出今天 3 个关键结果",
        description: "把目标写成可验证结果",
        category: "planning",
        minutes: 10,
        rewardXp: 12,
        careBonus: 2,
        status: "todo",
        completedAt: "",
        note: ""
      },
      {
        id: "quest-3",
        code: "q-recap",
        title: "睡前 5 分钟复盘",
        description: "记录完成情况与明日第一步",
        category: "review",
        minutes: 5,
        rewardXp: 10,
        careBonus: 2,
        status: "todo",
        completedAt: "",
        note: ""
      }
    ],
    rewardLog: [
      {
        id: "reward-1",
        type: "xp",
        summary: "已完成专注任务，获得 20 XP",
        at: now
      }
    ],
    lastCheckinAt: now,
    lastSummary: "今天先把第一优先级推进到可交付状态，我会盯着节奏陪你完成。"
  };
}

function buildEmbeddedDeviceOps(now: string): DemoDeviceOpsState {
  const capabilities: DeviceCapability[] = [
    {
      id: "desktop_files",
      platform: "desktop",
      name: "桌面文件整理",
      description: "整理下载目录、归档重复文件",
      risk: "medium",
      defaultPermission: "prompt",
      permission: "prompt"
    },
    {
      id: "desktop_calendar",
      platform: "desktop",
      name: "日程提醒",
      description: "基于任务节奏创建提醒",
      risk: "low",
      defaultPermission: "granted",
      permission: "granted"
    },
    {
      id: "desktop_voice",
      platform: "desktop",
      name: "语音播报",
      description: "将执行计划转成语音播报",
      risk: "low",
      defaultPermission: "granted",
      permission: "granted"
    }
  ];
  return {
    permissions: {
      desktop_files: "prompt",
      desktop_calendar: "granted",
      desktop_voice: "granted"
    },
    capabilities,
    tasks: [],
    audit: [
      {
        id: "audit-seed-1",
        type: "runtime",
        message: "内置运行时已启用，外部 API 不可用时自动接管。",
        metadata: {
          mode: "embedded"
        },
        at: now
      }
    ],
    automation: {
      enabled: true,
      requireApproval: true
    },
    bridge: {
      enabled: true,
      baseUrl: "embedded://device-bridge",
      lastCheckedAt: now,
      lastStatus: "ok",
      lastError: ""
    },
    lastPermissionUpdateAt: now
  };
}

function buildEmbeddedWorkbench(now: string): DemoWorkbenchState {
  const workspace: CodingWorkspaceState = {
    cwd: "~/Desktop",
    absolutePath: "/Users/Shared",
    exists: true,
    openedAt: now,
    lastAction: "bootstrap",
    entries: [
      { name: "Projects", kind: "dir" },
      { name: "Notes", kind: "dir" },
      { name: "README.md", kind: "file" }
    ]
  };
  return {
    layoutVersion: "embedded.v1",
    leftModules: [
      {
        id: "goal",
        title: "目标拆解",
        note: "把需求拆到可执行步骤",
        enabled: true,
        status: "ready"
      },
      {
        id: "followup",
        title: "进度跟进",
        note: "自动提醒阻塞点",
        enabled: true,
        status: "ready"
      }
    ],
    rightTools: [
      {
        id: "quick_plan",
        title: "一键计划",
        summary: "生成今日执行计划",
        status: "ready",
        lastRunAt: now,
        lastResult: "等待触发"
      },
      {
        id: "risk_scan",
        title: "风险扫描",
        summary: "识别可能阻塞点",
        status: "ready",
        lastRunAt: now,
        lastResult: "等待触发"
      }
    ],
    modelCenter: {
      currentModel: "aria-empathy",
      options: [
        { id: "aria-empathy", label: "陪伴主模型", provider: "openai" },
        { id: "aria-executor", label: "执行主模型", provider: "openai" },
        { id: "aria-fast", label: "快速响应", provider: "openai" }
      ]
    },
    coding: {
      autopilotEnabled: true,
      recentIntents: [],
      lastPlan: [
        "澄清目标和验收标准",
        "拆分为 3-5 步可执行动作",
        "执行并回写结果"
      ],
      workspace
    },
    centerFeed: [
      {
        id: "feed-seed-1",
        title: "Aria 已就绪",
        summary: "可以直接输入目标，我会自动拆解并推进执行。",
        source: "embedded-runtime",
        at: now
      }
    ],
    inputBar: {
      hashtagEnabled: true,
      voiceEnabled: true,
      placeholder: "告诉我你现在最想推进的事，我来接管执行节奏"
    },
    updatedAt: now
  };
}

function buildEmbeddedExpansion(now: string): DemoExpansionState {
  return {
    enabled: true,
    independenceMode: true,
    packs: [
      {
        id: "pack-productivity",
        name: "Productivity Core",
        version: "1.0.0",
        source: "embedded",
        status: "installed",
        capabilities: ["task_planning", "timeline_sync", "memory_digest"]
      }
    ],
    jobs: [],
    limits: {
      maxJobs: 3,
      maxDailyDownloads: 10
    },
    stats: {
      installedCount: 1,
      downloadsToday: 0
    },
    updatedAt: now
  };
}

function buildEmbeddedState(now: string): DemoState {
  const today = now.slice(0, 10);
  const queue = buildEmbeddedAutonomyQueue(now);
  const autonomy: DemoAutonomyState = {
    enabled: true,
    kernelVersion: "embedded-kernel.v1",
    tickCount: 36,
    lastTickAt: now,
    lastRepairAt: now,
    lastLearnAt: now,
    generatedCount: 58,
    queue,
    inbox: [
      {
        id: "inbox-seed-1",
        suggestionId: "suggestion-seed-1",
        type: "nudge",
        title: "先做最小可交付",
        message: "你可以先拿下 20 分钟可交付，再继续扩展。",
        ctaLabel: "开始 20 分钟冲刺",
        prefillText: "帮我安排一个20分钟可交付冲刺计划",
        status: "pending",
        createdAt: now
      }
    ],
    timeline: [
      {
        id: "timeline-seed-1",
        flowId: "flow-seed-1",
        source: "embedded-runtime",
        stage: "bootstrap",
        status: "completed",
        title: "内置运行时已接管",
        detail: "前后端开箱即用模式已就绪",
        at: now
      }
    ],
    failureInsights: {
      totalFailures: 0,
      layers: []
    },
    maintenance: [
      {
        id: "maintain-seed-1",
        type: "bootstrap",
        message: "系统已启用内置兜底，聊天与执行可继续。",
        at: now
      }
    ]
  };

  const workday = buildEmbeddedWorkday(now);
  const deviceOps = buildEmbeddedDeviceOps(now);
  const workbench = buildEmbeddedWorkbench(now);
  const expansion = buildEmbeddedExpansion(now);

  return {
    userId: "guest-aria-embedded",
    preferences: {
      mode: "陪伴",
      online: false
    },
    messages: [
      {
        id: "welcome-aria-1",
        role: "aria",
        text: "我在，今天想先陪你把哪件事真正推进到结果？",
        time: nowClock(),
        timestamp: Date.now(),
        scene: "love"
      }
    ],
    memoryHighlights: [
      "你希望 Aria 回答更像真人对话，减少模板味。",
      "你更重视流畅体验：不卡顿、可直接执行。",
      "你希望打开就能用，不做复杂配置。"
    ],
    engagement: {
      xp: 240,
      level: 5,
      streakDays: 7,
      lastActiveDay: today,
      lastEventAt: now,
      lastEventType: "app_open",
      today: {
        date: today,
        messageCount: 1,
        checkinDone: false,
        questCompleted: false,
        rewardClaimed: false
      }
    },
    proactive: {
      todayDate: today,
      sentCount: 0,
      maxDaily: 3,
      cooldownMinutes: 45,
      quietHours: {
        start: 0,
        end: 7
      },
      lastSentAt: "",
      lastType: ""
    },
    autonomy,
    workday,
    deviceOps,
    workbench,
    expansion,
    sceneConfig: {
      modules: {},
      recent: [],
      updatedAt: now
    },
    funGames: [
      {
        id: "fun-seed-reaction",
        mode: "mini_game",
        blueprint: "reaction",
        title: "反应力冲刺",
        prompt: "点击开始后，在最短时间内响应提示。",
        difficulty: "easy",
        rounds: 5,
        scoreEnabled: true,
        rewardEnabled: true,
        reviveEnabled: false,
        templateId: "tpl-reaction",
        templateName: "Reaction Basic",
        templateRules: ["5 轮计分", "支持复活一次"],
        source: "embedded",
        createdAt: now,
        updatedAt: now,
        playUrl: "https://html5games.com/Game/Reaction/7ec3df31-7f48-47fd-a84f-f2e32ea91c57",
        status: "ready"
      }
    ],
    funRuleTemplates: [
      {
        id: "tpl-reaction",
        mode: "mini_game",
        name: "Reaction Basic",
        rules: ["5 轮计分", "时长 2 分钟", "每轮即时反馈"],
        usageCount: 1,
        createdAt: now,
        updatedAt: now,
        source: "embedded"
      }
    ],
    updatedAt: now
  };
}

function buildEmbeddedRuntimeHealth(now: string): RuntimeHealthResult {
  return {
    runtime: {
      api: {
        status: "ok",
        lastCheckedAt: now,
        lastOkAt: now,
        lastErrorAt: "",
        lastError: "",
        requestTotal: 1,
        requestFailed: 0,
        requestSlow: 0,
        requestCritical: 0
      },
      bridge: {
        status: "ok",
        lastCheckedAt: now,
        lastOkAt: now,
        lastErrorAt: "",
        lastError: "",
        lastLatencyMs: 38
      },
      queue: {
        pending: 1,
        deadLetters: 0
      },
      slo: {
        warnMs: 1600,
        criticalMs: 3000,
        recentSlowCount: 0,
        recentTotal: 1,
        requestTotal: 1,
        requestFailed: 0,
        failureRate: 0,
        slowRate: 0,
        failureWarnThreshold: 0.04,
        failureCriticalThreshold: 0.1,
        slowWarnThreshold: 0.2,
        slowCriticalThreshold: 0.35,
        status: "ok",
        summary: "运行稳定"
      },
      watchdog: {
        enabled: true,
        cycleRunning: false,
        tickCount: 36,
        lastTickAt: now,
        lastErrorAt: "",
        lastError: "",
        cooldownUntil: "",
        cooldownRemainingMs: 0,
        selfHealCooldownMs: 120000,
        lastSelfHealAt: now,
        lastSelfHealSummary: "内置运行时已就绪",
        lastSelfHealReason: "bootstrap",
        lastProbeStatus: "ok",
        skippedReason: "",
        lastManualAction: "",
        lastManualActionAt: "",
        lastManualActionStatus: "",
        lastManualActionSummary: "",
        lastConfigChangeAt: now,
        lastConfigChangeSummary: "默认启用平衡模式",
        lastConfigChangeSource: "embedded-default",
        mode: "balanced",
        modeLabel: "平衡",
        queueLimit: 6,
        modePresets: [
          { mode: "eco", label: "节能", queueLimit: 3 },
          { mode: "balanced", label: "平衡", queueLimit: 6 },
          { mode: "peak", label: "高峰", queueLimit: 10 }
        ]
      },
      outage: {
        status: "ok",
        summary: "无故障",
        recommendation: "继续运行",
        cause: ""
      }
    },
    failureInsights: {
      totalFailures: 0,
      layers: []
    },
    incidentPlaybook: {
      version: "embedded.v1",
      objective: "优先保持聊天连续与任务可执行",
      totalIncidents: 0,
      matchedCount: 0,
      unresolvedCount: 0,
      matched: [],
      unresolved: [],
      recommendations: [
        "优先使用内置运行时保证会话连续",
        "接口恢复后自动切回在线链路"
      ],
      generatedAt: now
    },
    recentIssues: [],
    selfHealReports: [],
    generatedAt: now,
    updatedAt: now
  };
}

function buildEmbeddedCapabilityAssessment(now: string): CapabilityAssessmentResult {
  return {
    version: "embedded.v1",
    generatedAt: now,
    independent: true,
    independenceScore: 0.84,
    fusion: {
      profileVersion: "embedded.v1",
      enabled: true,
      readinessScore: 0.86,
      summary: {
        enabledCapabilityCount: 6,
        readyCapabilityCount: 6,
        duplicateRiskCount: 0,
        bridgeReady: true,
        dispatchRuns: 8,
        timelineEvents: 18,
        workbenchFeeds: 10,
        expansionPackCount: 1
      },
      capabilities: [
        {
          id: "companion_dialogue",
          name: "Companion Dialogue",
          status: "ready",
          enabled: true,
          noDuplicateBuild: true,
          reusedModules: ["chat_panel"],
          reusedEndpoints: ["/v1/message/stream"],
          missingModules: [],
          missingEndpoints: []
        }
      ]
    },
    superAutonomy: {
      profileVersion: "embedded.v1",
      enabled: true,
      mode: "assisted",
      objective: "保持陪伴流畅并持续推进任务",
      readinessScore: 0.8,
      summary: {
        skillReadiness: 0.8,
        requiredSkillsReady: 4,
        requiredSkillsTotal: 4,
        missingRequiredSkillCount: 0,
        bridgeReady: true,
        gatewayStatus: "ok",
        sessionCount: 1,
        dispatchRuns: 6,
        timelineEvents: 18,
        expansionPackCount: 1,
        workbenchFeeds: 8,
        taskLedgerPending: 1,
        taskLedgerDeadLetters: 0
      },
      skills: [
        {
          id: "task_planning",
          name: "Task Planning",
          source: "embedded",
          innovationLevel: "stable",
          required: true,
          ready: true,
          reusedEndpoints: ["/v1/workbench/intent"],
          missingEndpoints: []
        },
        {
          id: "companion_memory",
          name: "Companion Memory",
          source: "embedded",
          innovationLevel: "stable",
          required: true,
          ready: true,
          reusedEndpoints: ["/v1/memory/search"],
          missingEndpoints: []
        }
      ],
      missingRequiredSkills: []
    },
    cores: [
      {
        id: "codex",
        owner: "Aria",
        name: "Codex Core",
        summary: "负责执行链路与任务推进",
        score: 88,
        state: "ready",
        abilities: [
          { id: "workflow", title: "工作流执行", status: "ready" },
          { id: "planning", title: "计划拆解", status: "ready" }
        ]
      },
      {
        id: "antigravity",
        owner: "Aria",
        name: "Companion Core",
        summary: "负责情感表达与关系连续性",
        score: 91,
        state: "ready",
        abilities: [
          { id: "empathy", title: "情感共情", status: "ready" },
          { id: "memory", title: "长期记忆唤回", status: "ready" }
        ]
      },
      {
        id: "ariaKernel",
        owner: "Aria",
        name: "Aria Kernel",
        summary: "负责模型路由与自愈策略",
        score: 87,
        state: "ready",
        abilities: [
          { id: "routing", title: "模型路由", status: "ready" },
          { id: "fallback", title: "降级兜底", status: "ready" }
        ]
      }
    ],
    checks: [
      { id: "route", title: "模型路由", status: "ready" },
      { id: "runtime", title: "运行时健康", status: "ready" },
      { id: "companion", title: "陪伴连续性", status: "ready" }
    ]
  };
}

function buildEmbeddedFlywheel(config: SystemConfigResult, now: string): AriaKernelFlywheelState {
  return {
    version: "embedded.v1",
    totalSignals: 0,
    emotionalQualityAvg: 0.86,
    executionSuccessAvg: 0.88,
    combinedScoreAvg: 0.87,
    executionEligibleCount: 0,
    executionCompletedCount: 0,
    executionPartialCount: 0,
    executionFailedCount: 0,
    executionCompletionRate: 0,
    fallbackRate: 0,
    learningRuns: 0,
    lastSignalAt: "",
    lastLearnedAt: now,
    recentSignals: [],
    taskLeaderboards: {},
    recommendedRoutes: deepCloneValue(config.modelRoutingPolicy.taskRoutes),
    runtime: {
      minRunsToLearn: 5,
      minScoreGap: 0.04,
      signalLimit: 120
    },
    modelRouterRuntime: deepCloneValue(config.modelRouterRuntime || {
      realCallEnabled: false,
      defaultBaseUrl: "embedded://runtime",
      timeoutMs: 20000,
      maxTokens: 1600,
      providerRuntimes: []
    })
  };
}

function buildEmbeddedTimeline(now: string): UnifiedTimelineResult {
  return {
    flowId: "embedded-main",
    total: 1,
    events: [
      {
        id: "timeline-boot-1",
        flowId: "embedded-main",
        source: "embedded-runtime",
        stage: "bootstrap",
        status: "completed",
        title: "系统启动",
        detail: "内置 API 兜底已启用",
        at: now
      }
    ],
    flows: [
      {
        flowId: "embedded-main",
        title: "Aria Embedded Runtime",
        startedAt: now,
        lastAt: now,
        status: "completed",
        sources: ["embedded-runtime"],
        stages: ["bootstrap"],
        total: 1,
        success: 1,
        warnings: 0,
        errors: 0
      }
    ]
  };
}

function buildEmbeddedCodingPatchGate(now: string): CodingPatchGateState {
  return {
    latestDraftId: "",
    latestReceiptId: "",
    updatedAt: now,
    totalDrafts: 0,
    totalReceipts: 0,
    drafts: [],
    receipts: []
  };
}

function buildEmbeddedVoiceProfile(): VoiceProfileState {
  return {
    defaultVoice: "alloy",
    defaultRate: 1,
    allowMicCapture: true,
    activePresetId: "gentle_female",
    presets: [
      {
        id: "gentle_female",
        label: "温柔女声",
        voice: "alloy",
        rate: 1,
        description: "适合日常陪伴与提醒"
      },
      {
        id: "focus",
        label: "专注播报",
        voice: "verse",
        rate: 1.05,
        description: "适合任务执行播报"
      }
    ]
  };
}

function createEmbeddedRuntimeStore(): EmbeddedRuntimeStore {
  const now = nowIso();
  const systemConfig = buildEmbeddedSystemConfig(now);
  const state = buildEmbeddedState(now);
  const systemConfigHistory: SystemConfigOpsPreview = {
    latestSnapshotId: "embedded-snapshot-1",
    canRollbackPrevious: false,
    snapshots: [
      {
        id: "embedded-snapshot-1",
        createdAt: now,
        action: "bootstrap",
        actorId: state.userId,
        actorName: "Aria Embedded Runtime",
        source: "embedded",
        changedSections: ["systemProfile", "modelRoutingPolicy", "sceneOrchestrationPolicy"],
        riskLevel: "low",
        summary: "初始化内置配置",
        note: "开箱即用"
      }
    ],
    timeline: [
      {
        id: "embedded-op-1",
        at: now,
        action: "bootstrap",
        actorId: state.userId,
        actorName: "Aria Embedded Runtime",
        source: "embedded",
        changedSections: ["systemProfile", "modelRoutingPolicy", "sceneOrchestrationPolicy"],
        riskLevel: "low",
        summary: "初始化内置配置",
        note: "开箱即用",
        snapshotId: "embedded-snapshot-1",
        fromSnapshotId: "",
        targetSnapshotId: "embedded-snapshot-1"
      }
    ]
  };

  return {
    guestToken: `embedded-token-${demoDeviceId}`,
    state,
    systemConfig,
    systemConfigHistory,
    codingPatchGate: buildEmbeddedCodingPatchGate(now),
    runtimeHealth: buildEmbeddedRuntimeHealth(now),
    capabilityAssessment: buildEmbeddedCapabilityAssessment(now),
    flywheel: buildEmbeddedFlywheel(systemConfig, now),
    timeline: buildEmbeddedTimeline(now),
    voiceProfile: buildEmbeddedVoiceProfile(),
    voiceChannel: null,
    xhsJobs: []
  };
}

function getEmbeddedRuntimeStore() {
  if (!embeddedRuntimeStore) {
    embeddedRuntimeStore = createEmbeddedRuntimeStore();
  }
  return embeddedRuntimeStore;
}

function touchEmbeddedState(store: EmbeddedRuntimeStore) {
  const updatedAt = nowIso();
  store.state.updatedAt = updatedAt;
  if (store.state.autonomy) {
    store.state.autonomy.lastTickAt = updatedAt;
  }
  if (store.state.workbench) {
    store.state.workbench.updatedAt = updatedAt;
  }
  if (store.state.expansion) {
    store.state.expansion.updatedAt = updatedAt;
  }
  if (store.state.sceneConfig) {
    store.state.sceneConfig.updatedAt = updatedAt;
  }
  store.codingPatchGate.updatedAt = updatedAt;
  store.runtimeHealth.runtime.api.lastCheckedAt = updatedAt;
  store.runtimeHealth.runtime.api.lastOkAt = updatedAt;
  store.runtimeHealth.generatedAt = updatedAt;
  store.runtimeHealth.updatedAt = updatedAt;
  return updatedAt;
}

function appendTimelineEvent(
  store: EmbeddedRuntimeStore,
  input: {
    flowId?: string;
    stage: string;
    status?: string;
    title: string;
    detail: string;
    source?: string;
  }
) {
  const now = nowIso();
  const flowId = input.flowId || "embedded-main";
  const event: UnifiedTimelineEvent = {
    id: nextEmbeddedId("timeline"),
    flowId,
    source: input.source || "embedded-runtime",
    stage: input.stage,
    status: input.status || "completed",
    title: input.title,
    detail: input.detail,
    at: now
  };
  store.timeline.events.unshift(event);
  store.timeline.events = store.timeline.events.slice(0, 160);
  const flow = store.timeline.flows.find((item) => item.flowId === flowId);
  if (flow) {
    flow.lastAt = now;
    flow.total += 1;
    if (event.status === "completed") {
      flow.success += 1;
    } else if (event.status === "warning") {
      flow.warnings += 1;
    } else if (event.status === "failed" || event.status === "error") {
      flow.errors += 1;
      flow.status = "warning";
    }
    if (!flow.stages.includes(event.stage)) {
      flow.stages.push(event.stage);
    }
  } else {
    store.timeline.flows.unshift({
      flowId,
      title: flowId === "embedded-main" ? "Aria Embedded Runtime" : `Flow ${flowId}`,
      startedAt: now,
      lastAt: now,
      status: event.status === "completed" ? "completed" : "warning",
      sources: [event.source],
      stages: [event.stage],
      total: 1,
      success: event.status === "completed" ? 1 : 0,
      warnings: event.status === "warning" ? 1 : 0,
      errors: event.status === "failed" || event.status === "error" ? 1 : 0
    });
  }
  store.timeline.total = store.timeline.events.length;
}

function pickModelRoute(
  store: EmbeddedRuntimeStore,
  input: {
    preferredProviderId?: string;
    taskType?: string;
  }
) {
  const providers = store.systemConfig.modelRoutingPolicy.providers || [];
  const providerMap = new Map(providers.map((item) => [item.id, item]));
  const requestedTaskType = String(input.taskType || "").trim()
    || "emotional_companion";
  const routeTaskType = requestedTaskType;
  const preferredProviderId = String(input.preferredProviderId || "").trim();
  const routeCandidates = [
    ...(preferredProviderId ? [preferredProviderId] : []),
    ...((store.systemConfig.modelRoutingPolicy.taskRoutes[routeTaskType] || []) as string[]),
    ...providers.map((item) => item.id)
  ];
  const dedupedCandidates = routeCandidates.filter((item, index) => item && routeCandidates.indexOf(item) === index);
  const attempts: ModelRouteAttempt[] = [];
  let selectedProvider: ModelRoutingProvider | null = null;
  let fallback = false;

  for (let index = 0; index < dedupedCandidates.length; index += 1) {
    const providerId = dedupedCandidates[index];
    const provider = providerMap.get(providerId);
    if (!provider || provider.disabled) {
      attempts.push({
        providerId,
        model: provider?.model || "unknown",
        attempt: index + 1,
        ok: false,
        reason: provider ? "provider_disabled" : "provider_not_found",
        status: 503,
        error: provider ? "disabled" : "not_found"
      });
      fallback = true;
      continue;
    }
    selectedProvider = provider;
    attempts.push({
      providerId: provider.id,
      model: provider.model,
      attempt: index + 1,
      ok: true,
      reason: "ok",
      status: 200,
      error: ""
    });
    if (index > 0) {
      fallback = true;
    }
    break;
  }

  if (!selectedProvider) {
    selectedProvider = providers[0] || {
      id: "aria-safe-fallback",
      vendor: "builtin",
      model: "aria-companion-template",
      roles: [],
      ariaKernelProvider: "embedded"
    };
    fallback = true;
  }

  return {
    route: {
      taskType: routeTaskType,
      source: "embedded-runtime",
      providerId: selectedProvider.id,
      model: selectedProvider.model,
      fallback,
      attempts
    } as ModelRouteInfo,
    provider: selectedProvider
  };
}

function pickEmbeddedOneLiner(items: string[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  const index = Math.floor(Math.random() * items.length);
  return String(items[index] || "").trim();
}

function buildEmbeddedDirectOneLiner(textInput: string) {
  const text = String(textInput || "").trim();
  if (!text) {
    return "";
  }
  const asksOneLine = /一句|一条|一句话|短句|简短|只回一句|只说一句|来一句|单句|不超过/.test(text);
  const generationIntent = /生成|写|给我|帮我|想要|来|出一条|文案|造句/.test(text);
  if (!asksOneLine && !generationIntent) {
    return "";
  }
  if (/夸|夸赞|赞美|夸夸|表扬/.test(text)) {
    if (/不油|真诚|自然|别油/.test(text)) {
      return pickEmbeddedOneLiner([
        "你做事很踏实，和你一起会很安心。",
        "你说话有分寸又有温度，和你相处很舒服。",
        "你不是那种喧闹的人，但总能把事做得很漂亮。",
        "你给人的安全感，不靠嘴上说，靠每次都靠谱。"
      ]);
    }
    return pickEmbeddedOneLiner([
      "你认真起来真的很有魅力。",
      "你身上那种稳定又温暖的劲儿很打动人。",
      "你总能把复杂的事处理得很从容，真的很厉害。",
      "你一出现，气氛都会变得踏实很多。"
    ]);
  }
  if (/安慰|鼓励|哄我|抱抱|低落|难过|焦虑/.test(text)) {
    return pickEmbeddedOneLiner([
      "你已经很努力了，慢一点也没关系，我在这儿陪你。",
      "先别急着否定自己，你已经比昨天更靠前一步了。",
      "今天辛苦了，先把呼吸放慢，我们一件一件来。",
      "你不用一个人扛，我会陪你把这段难走的路走过去。"
    ]);
  }
  if (/道歉|认错|挽回|和好/.test(text)) {
    return pickEmbeddedOneLiner([
      "对不起，刚才是我没顾及你的感受，我会改。",
      "这次是我做得不对，我愿意把问题补上，不让你再难受。",
      "抱歉让你失望了，我不找借口，接下来我用行动修正。",
      "对不起，我听到了你的委屈，我们好好把这件事处理完。"
    ]);
  }
  if (/邀约|约她|约他|约会|邀请/.test(text)) {
    return pickEmbeddedOneLiner([
      "这周末有空吗，我想请你喝杯咖啡，顺便好好聊聊。",
      "你这周哪天方便？我想约你出来走走。",
      "最近一直想见你一面，找个你舒服的时间一起吃个饭吧。",
      "如果你愿意，这周我们见一面，我来安排轻松一点的行程。"
    ]);
  }
  return "";
}

function buildCompanionReply(textInput: string, scene: SceneConfigScene) {
  const rawText = String(textInput || "")
    .replace(/\[img:[^\]]+\]/g, "")
    .trim();
  const directOneLiner = buildEmbeddedDirectOneLiner(rawText);
  if (directOneLiner) {
    return directOneLiner;
  }
  const topic = rawText || "你现在的状态";

  if (scene === "work" || scene === "coding") {
    return `收到，我来接管这件事的推进节奏。你提到的是「${topic.slice(0, 80)}」。\n\n我先给你一个可执行三步：\n1. 先定义今天可交付结果（1句话）\n2. 拆成 20-30 分钟可完成的小步\n3. 我按步骤陪你推进并随时纠偏`;
  }
  if (scene === "fun") {
    return `哈哈，这个方向挺有意思。你说的是「${topic.slice(0, 80)}」。\n\n要不要来一个轻量玩法：\n1. 先选 5 分钟小游戏热身\n2. 再做一个你最想推进的小目标\n3. 完成后我给你即时奖励反馈`;
  }
  if (scene === "life") {
    return `我记住了，你现在在意的是「${topic.slice(0, 80)}」。\n\n我们可以用一个更轻松的节奏：\n1. 先确认你当下最难的一点\n2. 我给你一个低压力、可马上执行的小动作\n3. 晚点我们一起复盘，减少反复内耗`;
  }
  return `我在，已经接住你这句话：「${topic.slice(0, 80)}」。\n\n你不用一个人扛，我们就从最小一步开始：\n1. 先把现在最想解决的点说清楚\n2. 我给你一个当下就能做的动作\n3. 你做完我再接着带下一步`;
}

function rebuildFlywheelLeaderboards(flywheel: AriaKernelFlywheelState) {
  const grouped = new Map<string, {
    taskType: string;
    providerId: string;
    model: string;
    runs: number;
    emotionalTotal: number;
    executionTotal: number;
    combinedTotal: number;
    fallbackRuns: number;
    lastAt: string;
  }>();
  for (const signal of flywheel.recentSignals) {
    const key = `${signal.taskType}::${signal.providerId}::${signal.model}`;
    const current = grouped.get(key) || {
      taskType: signal.taskType,
      providerId: signal.providerId,
      model: signal.model,
      runs: 0,
      emotionalTotal: 0,
      executionTotal: 0,
      combinedTotal: 0,
      fallbackRuns: 0,
      lastAt: signal.at
    };
    current.runs += 1;
    current.emotionalTotal += signal.emotionalScore;
    current.executionTotal += signal.executionScore;
    current.combinedTotal += signal.combinedScore;
    if (signal.fallback) {
      current.fallbackRuns += 1;
    }
    current.lastAt = signal.at;
    grouped.set(key, current);
  }

  const result: Record<string, AriaKernelFlywheelLeaderboardRow[]> = {};
  for (const value of grouped.values()) {
    const row: AriaKernelFlywheelLeaderboardRow = {
      providerId: value.providerId,
      model: value.model,
      runs: value.runs,
      emotionalAvg: Number((value.emotionalTotal / Math.max(1, value.runs)).toFixed(3)),
      executionAvg: Number((value.executionTotal / Math.max(1, value.runs)).toFixed(3)),
      combinedAvg: Number((value.combinedTotal / Math.max(1, value.runs)).toFixed(3)),
      fallbackRate: Number((value.fallbackRuns / Math.max(1, value.runs)).toFixed(3)),
      lastAt: value.lastAt
    };
    if (!result[value.taskType]) {
      result[value.taskType] = [];
    }
    result[value.taskType].push(row);
  }
  for (const taskType of Object.keys(result)) {
    result[taskType].sort((left, right) => right.combinedAvg - left.combinedAvg || right.runs - left.runs);
  }
  flywheel.taskLeaderboards = result;
}

function recordFlywheelSignal(
  store: EmbeddedRuntimeStore,
  route: ModelRouteInfo,
  scene: SceneConfigScene
) {
  const now = nowIso();
  const emotionalScore = scene === "love" ? 0.94 : scene === "life" ? 0.9 : 0.86;
  const executionScore = scene === "work" || scene === "coding" ? 0.91 : 0.84;
  const combinedScore = Number(((emotionalScore + executionScore) / 2).toFixed(3));
  const signal: AriaKernelFlywheelSignal = {
    id: nextEmbeddedId("signal"),
    at: now,
    flowId: "embedded-main",
    scene,
    taskType: route.taskType || "emotional_companion",
    providerId: route.providerId,
    model: route.model,
    fallback: route.fallback,
    emotionalScore,
    executionScore,
    combinedScore,
    dispatchStatus: "skipped",
    executionEligible: false,
    executed: false,
    reason: "embedded_runtime"
  };

  const flywheel = store.flywheel;
  flywheel.totalSignals += 1;
  flywheel.lastSignalAt = now;
  flywheel.learningRuns += 1;
  flywheel.recentSignals.unshift(signal);
  flywheel.recentSignals = flywheel.recentSignals.slice(0, 120);

  const emotionalSum = flywheel.recentSignals.reduce((sum, item) => sum + item.emotionalScore, 0);
  const executionSum = flywheel.recentSignals.reduce((sum, item) => sum + item.executionScore, 0);
  const combinedSum = flywheel.recentSignals.reduce((sum, item) => sum + item.combinedScore, 0);
  const fallbackCount = flywheel.recentSignals.filter((item) => item.fallback).length;
  const size = Math.max(1, flywheel.recentSignals.length);
  flywheel.emotionalQualityAvg = Number((emotionalSum / size).toFixed(3));
  flywheel.executionSuccessAvg = Number((executionSum / size).toFixed(3));
  flywheel.combinedScoreAvg = Number((combinedSum / size).toFixed(3));
  flywheel.fallbackRate = Number((fallbackCount / size).toFixed(3));
  flywheel.executionCompletionRate = flywheel.executionEligibleCount > 0
    ? Number((flywheel.executionCompletedCount / flywheel.executionEligibleCount).toFixed(3))
    : 0;
  flywheel.lastLearnedAt = now;
  rebuildFlywheelLeaderboards(flywheel);
}

function createSseResponse(events: Array<{ event: string; data: unknown }>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;
      const push = () => {
        if (index >= events.length) {
          controller.close();
          return;
        }
        const item = events[index];
        index += 1;
        const payload = `event: ${item.event}\ndata: ${JSON.stringify(item.data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
        globalThis.setTimeout(push, index >= events.length ? 15 : 45);
      };
      push();
    }
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      [EMBEDDED_RUNTIME_HEADER]: "1"
    }
  });
}

function buildEmbeddedMessageExchange(
  store: EmbeddedRuntimeStore,
  payload: {
    text?: string;
    preferredProviderId?: string;
    taskType?: string;
    scene?: string;
  }
) {
  const scene = normalizeScene(payload.scene, "love");
  const routeResult = pickModelRoute(store, {
    preferredProviderId: payload.preferredProviderId,
    taskType: payload.taskType
  });
  const route = routeResult.route;
  const streamId = nextEmbeddedId("stream");
  const now = Date.now();
  const userText = String(payload.text || "").trim();
  const assistantText = buildCompanionReply(userText, scene);
  const userMessage: DemoMessage = {
    id: nextEmbeddedId("user"),
    role: "user",
    text: userText,
    time: nowClock(),
    timestamp: now,
    scene
  };
  const assistantMessage: DemoMessage = {
    id: nextEmbeddedId("aria"),
    role: "aria",
    text: assistantText,
    time: nowClock(),
    timestamp: now + 1,
    scene
  };

  store.state.messages.push(userMessage, assistantMessage);
  if (store.state.messages.length > 200) {
    store.state.messages = store.state.messages.slice(-200);
  }
  if (userText) {
    store.state.memoryHighlights = [
      `${scene.toUpperCase()}：${userText.slice(0, 48)}`,
      ...store.state.memoryHighlights
    ].slice(0, 20);
  }

  const xpGain = scene === "work" || scene === "coding" ? 8 : 6;
  ensureEngagementToday(store.state.engagement);
  store.state.engagement.xp += xpGain;
  store.state.engagement.today.messageCount += 1;
  store.state.engagement.lastEventAt = nowIso();
  store.state.engagement.lastEventType = "message_sent";
  store.state.engagement.level = Math.max(1, Math.floor(store.state.engagement.xp / 80));

  recordFlywheelSignal(store, route, scene);
  appendTimelineEvent(store, {
    stage: "chat_message",
    title: "完成对话回复",
    detail: `scene=${scene} provider=${route.providerId}`,
    source: "embedded-runtime"
  });
  const updatedAt = touchEmbeddedState(store);

  const donePayload: StreamDonePayload = {
    streamId,
    state: deepCloneValue(store.state),
    delta: {
      userMessage,
      assistantMessage
    },
    modelRoute: route,
    autoExecution: {
      executed: false,
      reason: "embedded_runtime",
      summary: "当前使用内置陪伴执行模式，未触发外部自动执行。",
      dispatchId: "",
      dispatchStatus: "skipped"
    },
    flywheel: {
      signalId: store.flywheel.recentSignals[0]?.id || "",
      emotionalScore: store.flywheel.recentSignals[0]?.emotionalScore || 0,
      executionScore: store.flywheel.recentSignals[0]?.executionScore || 0,
      combinedScore: store.flywheel.recentSignals[0]?.combinedScore || 0
    },
    engagement: {
      xpGain
    }
  };

  const chunks: StreamChunkPayload[] = [];
  const chunkSize = 24;
  let fullText = "";
  for (let index = 0; index < assistantText.length; index += chunkSize) {
    const chunk = assistantText.slice(index, index + chunkSize);
    fullText += chunk;
    chunks.push({
      streamId,
      index: chunks.length,
      chunk,
      fullText
    });
  }
  if (chunks.length === 0) {
    chunks.push({
      streamId,
      index: 0,
      chunk: "",
      fullText: ""
    });
  }

  return {
    streamId,
    userMessage,
    route,
    donePayload,
    chunks,
    updatedAt
  };
}

function buildMemorySearchItems(store: EmbeddedRuntimeStore, query: string, limit: number) {
  const normalizedQuery = query.trim();
  const sourceItems = [
    ...store.state.memoryHighlights.map((item, index) => ({
      id: `highlight-${index}`,
      text: item,
      scene: "life"
    })),
    ...store.state.messages
      .filter((item) => item.role === "user" || item.role === "aria")
      .slice(-16)
      .map((item) => ({
        id: item.id,
        text: item.text,
        scene: item.scene || "love"
      }))
  ];
  const filtered = sourceItems.filter((item) => {
    if (!normalizedQuery) return true;
    return item.text.toLowerCase().includes(normalizedQuery.toLowerCase());
  });
  const limited = filtered.slice(0, Math.max(1, Math.min(24, limit)));
  return limited.map((item, index) => ({
    id: item.id,
    source: "embedded-memory",
    scene: item.scene,
    memory_tier: index < 6 ? "long_term" : "short_term",
    content: item.text,
    score: Number((0.9 - index * 0.03).toFixed(3)),
    embedding_score: Number((0.88 - index * 0.02).toFixed(3)),
    rerank_score: Number((0.87 - index * 0.02).toFixed(3)),
    trigger_confidence: Number((0.82 - index * 0.03).toFixed(3)),
    reasons: ["semantic_match", "recent_context"]
  })) as MemorySearchItem[];
}

function buildEmbeddedFallbackResponse(path: string, init?: RequestInit): Response | null {
  if (!EMBEDDED_RUNTIME_ENABLED) {
    return null;
  }
  if (!path.startsWith("/v1/")) {
    return null;
  }
  const store = getEmbeddedRuntimeStore();
  const requestUrl = new URL(path, "https://aria-embedded.local");
  const pathname = requestUrl.pathname;
  const method = String(init?.method || "GET").toUpperCase();
  const body = parseEmbeddedRequestBody(init?.body);
  const updatedAt = touchEmbeddedState(store);

  if (pathname === "/v1/auth/guest" && method === "POST") {
    const token = `embedded-token-${demoDeviceId}-${Date.now()}`;
    store.guestToken = token;
    return makeEmbeddedJsonResponse({
      token,
      user: {
        id: store.state.userId,
        name: "Guest",
        isGuest: true
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    });
  }

  if (pathname === "/v1/state" && method === "GET") {
    return makeEmbeddedJsonResponse({
      state: deepCloneValue(store.state)
    });
  }

  if (pathname === "/v1/reset" && method === "POST") {
    const token = store.guestToken;
    embeddedRuntimeStore = createEmbeddedRuntimeStore();
    embeddedRuntimeStore.guestToken = token;
    return makeEmbeddedJsonResponse({
      state: deepCloneValue(embeddedRuntimeStore.state)
    });
  }

  if (pathname === "/v1/preferences" && method === "POST") {
    const nextMode = String(body.mode || "").trim();
    if (nextMode === "陪伴" || nextMode === "工作" || nextMode === "亲情") {
      store.state.preferences.mode = nextMode;
    }
    if (typeof body.online === "boolean") {
      store.state.preferences.online = body.online;
    }
    const nextUpdatedAt = touchEmbeddedState(store);
    return makeEmbeddedJsonResponse({
      preferences: deepCloneValue(store.state.preferences),
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/engagement/state" && method === "GET") {
    return makeEmbeddedJsonResponse({
      engagement: deepCloneValue(store.state.engagement),
      proactive: deepCloneValue(store.state.proactive),
      autonomy: deepCloneValue(store.state.autonomy),
      workday: deepCloneValue(store.state.workday),
      deviceOps: deepCloneValue(store.state.deviceOps)
    });
  }

  if (pathname === "/v1/engagement/event" && method === "POST") {
    const eventType = String(body.type || "").trim() || "app_open";
    ensureEngagementToday(store.state.engagement);
    if (eventType === "app_open" || eventType === "session_resume") {
      store.state.engagement.xp += 1;
    } else if (eventType === "daily_checkin") {
      store.state.engagement.xp += 6;
      store.state.engagement.today.checkinDone = true;
    } else if (eventType === "quest_complete") {
      store.state.engagement.xp += 10;
      store.state.engagement.today.questCompleted = true;
    } else if (eventType === "reward_claim") {
      store.state.engagement.today.rewardClaimed = true;
    } else if (eventType === "message_sent") {
      store.state.engagement.xp += 2;
      store.state.engagement.today.messageCount += 1;
    }
    store.state.engagement.level = Math.max(1, Math.floor(store.state.engagement.xp / 80));
    store.state.engagement.lastEventType = eventType;
    store.state.engagement.lastEventAt = nowIso();
    return makeEmbeddedJsonResponse({
      engagement: deepCloneValue(store.state.engagement)
    });
  }

  if (pathname === "/v1/system/config" && method === "GET") {
    return makeEmbeddedJsonResponse(deepCloneValue(store.systemConfig));
  }

  if (pathname === "/v1/system/config" && method === "POST") {
    const patch = body;
    if (patch.modelRoutingPolicy && typeof patch.modelRoutingPolicy === "object") {
      store.systemConfig.modelRoutingPolicy = {
        ...store.systemConfig.modelRoutingPolicy,
        ...(patch.modelRoutingPolicy as ModelRoutingPolicy)
      };
    }
    if (patch.systemProfile && typeof patch.systemProfile === "object") {
      store.systemConfig.systemProfile = {
        ...store.systemConfig.systemProfile,
        ...(patch.systemProfile as SystemProfile)
      };
    }
    if (patch.sceneOrchestrationPolicy && typeof patch.sceneOrchestrationPolicy === "object") {
      store.systemConfig.sceneOrchestrationPolicy = {
        ...store.systemConfig.sceneOrchestrationPolicy,
        ...(patch.sceneOrchestrationPolicy as SceneOrchestrationPolicy)
      };
    }
    const nextUpdatedAt = touchEmbeddedState(store);
    return makeEmbeddedJsonResponse({
      ...deepCloneValue(store.systemConfig),
      ok: true,
      changed: true,
      changedSections: ["systemConfig"],
      persisted: false,
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/system/config/reload" && method === "POST") {
    return makeEmbeddedJsonResponse({
      ...deepCloneValue(store.systemConfig),
      ok: true,
      message: "embedded_config_reloaded"
    });
  }

  if (pathname === "/v1/system/config/sync-aria-kernel" && method === "POST") {
    const nextUpdatedAt = touchEmbeddedState(store);
    const providers = store.systemConfig.modelRoutingPolicy.providers || [];
    return makeEmbeddedJsonResponse({
      ...deepCloneValue(store.systemConfig),
      ok: true,
      reason: "embedded_synced",
      message: "已同步到内置 Aria Kernel Provider",
      changed: false,
      changedSections: [],
      persisted: false,
      mode: "merge",
      includeLocal: true,
      syncedProviders: providers.map((provider) => ({
        id: provider.id,
        model: provider.model,
        ariaKernelProvider: provider.ariaKernelProvider || "embedded",
        baseUrl: provider.baseUrl || "embedded://runtime",
        local: provider.vendor === "builtin"
      })),
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/system/config/history" && method === "GET") {
    return makeEmbeddedJsonResponse({
      history: deepCloneValue(store.systemConfigHistory),
      runtime: deepCloneValue(store.systemConfig.runtime),
      updatedAt
    });
  }

  if (pathname === "/v1/system/config/rollback" && method === "POST") {
    const nextUpdatedAt = touchEmbeddedState(store);
    return makeEmbeddedJsonResponse({
      ...deepCloneValue(store.systemConfig),
      ok: true,
      changed: false,
      changedSections: [],
      persisted: false,
      targetSnapshotId: store.systemConfigHistory.latestSnapshotId,
      reason: "embedded_noop",
      message: "内置配置已为稳定版本",
      configOps: deepCloneValue(store.systemConfigHistory),
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/runtime/health" && method === "GET") {
    store.runtimeHealth.runtime.queue.pending = store.state.autonomy?.queue?.items.length || 0;
    store.runtimeHealth.runtime.queue.deadLetters = store.state.autonomy?.queue?.deadLetters.length || 0;
    return makeEmbeddedJsonResponse(deepCloneValue(store.runtimeHealth));
  }

  if (pathname === "/v1/runtime/guardian/heal" && method === "POST") {
    const now = nowIso();
    const pendingBefore = store.state.autonomy?.queue?.items.length || 0;
    const deadBefore = store.state.autonomy?.queue?.deadLetters.length || 0;
    if (store.state.autonomy?.queue) {
      const queue = store.state.autonomy.queue;
      const processCount = Math.min(queue.items.length, 2);
      const processedItems = queue.items.splice(0, processCount);
      queue.stats.processed += processedItems.length;
      queue.stats.succeeded += processedItems.length;
      queue.stats.lastProcessAt = now;
    }
    const pendingAfter = store.state.autonomy?.queue?.items.length || 0;
    const deadAfter = store.state.autonomy?.queue?.deadLetters.length || 0;
    store.runtimeHealth.runtime.watchdog.lastSelfHealAt = now;
    store.runtimeHealth.runtime.watchdog.lastSelfHealSummary = "已执行内置自愈与队列回放";
    store.runtimeHealth.updatedAt = now;
    return makeEmbeddedJsonResponse({
      ok: true,
      executed: true,
      result: {
        ok: true,
        source: "embedded_runtime",
        force: true,
        mode: store.runtimeHealth.runtime.watchdog.mode,
        queueLimit: store.runtimeHealth.runtime.watchdog.queueLimit,
        executeRepair: true,
        executeQueue: true,
        executed: true,
        skippedReason: "",
        reason: "embedded_guardian_ok",
        summary: "内置运行时已完成自愈与队列处理",
        outageStatus: "ok",
        queue: {
          pendingBefore,
          deadLettersBefore: deadBefore,
          pendingAfter,
          deadLettersAfter: deadAfter
        },
        touchedUsers: 1,
        changedUsers: pendingBefore > pendingAfter ? 1 : 0,
        queueProcessed: pendingBefore - pendingAfter,
        queueSucceeded: pendingBefore - pendingAfter,
        queueDeadLettered: 0,
        reportId: nextEmbeddedId("heal-report")
      },
      runtimeHealth: deepCloneValue(store.runtimeHealth),
      updatedAt: now
    });
  }

  if (pathname === "/v1/runtime/guardian/config" && method === "POST") {
    if (typeof body.enabled === "boolean") {
      store.runtimeHealth.runtime.watchdog.enabled = body.enabled;
    }
    const mode = String(body.mode || "").trim();
    if (mode === "eco" || mode === "balanced" || mode === "peak") {
      store.runtimeHealth.runtime.watchdog.mode = mode;
      store.runtimeHealth.runtime.watchdog.modeLabel = mode === "eco" ? "节能" : mode === "peak" ? "高峰" : "平衡";
    }
    if (typeof body.queueLimit === "number" && Number.isFinite(body.queueLimit)) {
      store.runtimeHealth.runtime.watchdog.queueLimit = Math.max(1, Math.min(30, Math.floor(body.queueLimit)));
    }
    const now = nowIso();
    store.runtimeHealth.runtime.watchdog.lastConfigChangeAt = now;
    store.runtimeHealth.runtime.watchdog.lastConfigChangeSummary = "已更新守护配置";
    store.runtimeHealth.updatedAt = now;
    return makeEmbeddedJsonResponse({
      ok: true,
      config: {
        enabled: store.runtimeHealth.runtime.watchdog.enabled,
        mode: store.runtimeHealth.runtime.watchdog.mode,
        modeLabel: store.runtimeHealth.runtime.watchdog.modeLabel,
        queueLimit: store.runtimeHealth.runtime.watchdog.queueLimit,
        changed: true,
        lastConfigChangeAt: now,
        lastConfigChangeSummary: "已更新守护配置"
      },
      runtimeHealth: deepCloneValue(store.runtimeHealth),
      updatedAt: now
    });
  }

  if (pathname === "/v1/capability/assessment" && method === "GET") {
    store.capabilityAssessment.generatedAt = updatedAt;
    return makeEmbeddedJsonResponse({
      assessment: deepCloneValue(store.capabilityAssessment),
      updatedAt
    });
  }

  if (pathname === "/v1/capability/super-autonomy" && method === "GET") {
    return makeEmbeddedJsonResponse({
      profile: deepCloneValue(store.systemConfig.superAutonomyProfile || {}),
      runtime: deepCloneValue(store.capabilityAssessment.superAutonomy || {
        profileVersion: "embedded.v1",
        enabled: true,
        mode: "assisted",
        objective: "保持陪伴与执行连续",
        readinessScore: 0.8,
        summary: {
          skillReadiness: 0.8,
          requiredSkillsReady: 0,
          requiredSkillsTotal: 0,
          missingRequiredSkillCount: 0,
          bridgeReady: true,
          dispatchRuns: 0,
          timelineEvents: 0,
          expansionPackCount: 0,
          workbenchFeeds: 0
        },
        skills: [],
        missingRequiredSkills: []
      }),
      updatedAt
    });
  }

  if (pathname === "/v1/aria-kernel/gateway/status" && method === "GET") {
    return makeEmbeddedJsonResponse({
      gateway: {
        enabled: true,
        mode: "embedded",
        status: "ok"
      },
      updatedAt
    });
  }

  if (pathname === "/v1/aria-kernel/incidents/playbook" && method === "GET") {
    return makeEmbeddedJsonResponse({
      userId: store.state.userId,
      playbook: deepCloneValue(store.runtimeHealth.incidentPlaybook || {
        version: "embedded.v1",
        objective: "stability",
        totalIncidents: 0,
        matchedCount: 0,
        unresolvedCount: 0,
        matched: [],
        unresolved: [],
        recommendations: [],
        generatedAt: updatedAt
      }),
      updatedAt
    });
  }

  if (pathname === "/v1/aria-kernel/incidents/remember" && method === "POST") {
    const note = String(body.issueMessage || "").trim()
      || "已记录：优先保证聊天流畅与执行可回滚";
    store.state.memoryHighlights = [note, ...store.state.memoryHighlights].slice(0, 20);
    return makeEmbeddedJsonResponse({
      ok: true,
      remembered: 1,
      incidentIds: [String(body.incidentId || "embedded-incident")],
      memoryHighlights: deepCloneValue(store.state.memoryHighlights),
      autonomy: deepCloneValue(store.state.autonomy),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/autonomy/status" && method === "GET") {
    const autonomy = deepCloneValue(store.state.autonomy || {
      enabled: true,
      tickCount: 0,
      lastTickAt: updatedAt,
      lastRepairAt: updatedAt,
      lastLearnAt: updatedAt,
      generatedCount: 0,
      inbox: [],
      maintenance: []
    });
    return makeEmbeddedJsonResponse({
      autonomy,
      runtime: {
        running: true,
        cycleRunning: false,
        tickMs: 1200,
        policyVersion: "embedded.v1",
        policyLoadedAt: updatedAt,
        tickCount: autonomy.tickCount || 0,
        lastTickAt: autonomy.lastTickAt || updatedAt,
        lastErrorAt: "",
        lastError: "",
        lastQueueProcessAt: autonomy.queue?.stats?.lastProcessAt || updatedAt,
        lastQueueProcessed: autonomy.queue?.stats?.processed || 0
      },
      policy: {
        version: "embedded.v1",
        autonomy: {
          enabled: autonomy.enabled !== false,
          idleMinutesBeforeNudge: 25,
          maxPendingInbox: 8,
          selfLearningEnabled: true,
          selfRepairEnabled: true
        }
      },
      updatedAt
    });
  }

  if (pathname === "/v1/autonomy/inbox" && method === "GET") {
    const items = (store.state.autonomy?.inbox || []).filter((item) => item.status !== "dismissed");
    return makeEmbeddedJsonResponse({
      items: deepCloneValue(items),
      total: items.length
    });
  }

  if (pathname === "/v1/autonomy/inbox/ack" && method === "POST") {
    const id = String(body.id || "").trim();
    const target = store.state.autonomy?.inbox?.find((item) => item.id === id)
      || store.state.autonomy?.inbox?.[0];
    if (target) {
      target.status = "acked";
      target.ackedAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      acked: deepCloneValue(target || {
        id: "",
        suggestionId: "",
        type: "nudge",
        title: "",
        message: "",
        ctaLabel: "",
        prefillText: "",
        status: "acked",
        createdAt: nowIso(),
        ackedAt: nowIso()
      })
    });
  }

  if (pathname === "/v1/autonomy/queue" && method === "GET") {
    const queue = deepCloneValue(store.state.autonomy?.queue || buildEmbeddedAutonomyQueue(updatedAt));
    return makeEmbeddedJsonResponse({
      queue,
      pending: queue.items.length,
      deadLetters: queue.deadLetters.length,
      updatedAt
    });
  }

  if (pathname === "/v1/autonomy/queue/process" && method === "POST") {
    const queue = store.state.autonomy?.queue;
    const result: AutonomyQueueProcessResult = {
      changed: false,
      processed: 0,
      succeeded: 0,
      retried: 0,
      deadLettered: 0
    };
    if (queue) {
      const processLimit = Math.max(1, Math.min(10, Number(body.limit || queue.policy.processLimit || 3)));
      const processing = queue.items.splice(0, processLimit);
      if (processing.length > 0) {
        result.changed = true;
        result.processed = processing.length;
        result.succeeded = processing.length;
        queue.stats.processed += processing.length;
        queue.stats.succeeded += processing.length;
        queue.stats.lastProcessAt = nowIso();
      }
    }
    return makeEmbeddedJsonResponse({
      result,
      queue: deepCloneValue(store.state.autonomy?.queue || buildEmbeddedAutonomyQueue(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/autonomy/queue/policy" && method === "POST") {
    const queue = store.state.autonomy?.queue;
    if (queue) {
      if (typeof body.enabled === "boolean") {
        queue.policy.enabled = body.enabled;
      }
      if (typeof body.autoProcessOnTick === "boolean") {
        queue.policy.autoProcessOnTick = body.autoProcessOnTick;
      }
      if (typeof body.processLimit === "number" && Number.isFinite(body.processLimit)) {
        queue.policy.processLimit = Math.max(1, Math.min(20, Math.floor(body.processLimit)));
      }
      const strategies = body.strategies && typeof body.strategies === "object"
        ? body.strategies as Record<string, Partial<DemoAutonomyQueueStrategy>>
        : null;
      if (strategies) {
        for (const [operationType, patch] of Object.entries(strategies)) {
          const current = queue.policy.strategies[operationType];
          if (!current) {
            continue;
          }
          queue.policy.strategies[operationType] = {
            ...current,
            ...patch
          };
        }
      }
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      policy: deepCloneValue(store.state.autonomy?.queue?.policy || buildEmbeddedAutonomyQueue(updatedAt).policy),
      queue: deepCloneValue(store.state.autonomy?.queue || buildEmbeddedAutonomyQueue(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/autonomy/queue/dead-letter/retry" && method === "POST") {
    const id = String(body.id || "").trim();
    const queue = store.state.autonomy?.queue;
    let item: DemoAutonomyQueueItem | null = null;
    if (queue) {
      const index = queue.deadLetters.findIndex((entry) => entry.id === id);
      if (index >= 0) {
        item = queue.deadLetters.splice(index, 1)[0];
        item.status = "retrying";
        item.nextRetryAt = nowIso();
        queue.items.unshift(item);
      }
    }
    const processResult: AutonomyQueueProcessResult = {
      changed: Boolean(item),
      processed: 0,
      succeeded: 0,
      retried: item ? 1 : 0,
      deadLettered: 0
    };
    return makeEmbeddedJsonResponse({
      ok: Boolean(item),
      reason: item ? "retried" : "not_found",
      item: deepCloneValue(item || {
        id: "",
        dispatchId: "",
        dispatchPrompt: "",
        operation: { type: "unknown" },
        status: "pending",
        attempts: 0,
        maxAttempts: 0,
        createdAt: updatedAt,
        updatedAt,
        nextRetryAt: updatedAt,
        lastError: "",
        lastSummary: ""
      }),
      processResult,
      queue: deepCloneValue(store.state.autonomy?.queue || buildEmbeddedAutonomyQueue(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/autonomy/repair" && method === "POST") {
    if (store.state.autonomy) {
      store.state.autonomy.lastRepairAt = nowIso();
      store.state.autonomy.maintenance.unshift({
        id: nextEmbeddedId("maintenance"),
        type: "manual_repair",
        message: "已执行内置修复流程",
        at: nowIso()
      });
      store.state.autonomy.maintenance = store.state.autonomy.maintenance.slice(0, 40);
    }
    return makeEmbeddedJsonResponse({
      repaired: true,
      autonomy: deepCloneValue(store.state.autonomy || buildEmbeddedState(updatedAt).autonomy!)
    });
  }

  if (pathname === "/v1/autonomy/tick" && method === "POST") {
    if (store.state.autonomy) {
      store.state.autonomy.tickCount += 1;
      store.state.autonomy.lastTickAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      changed: true,
      queueResult: {
        changed: false,
        processed: 0,
        succeeded: 0,
        retried: 0,
        deadLettered: 0
      },
      autonomy: deepCloneValue(store.state.autonomy || buildEmbeddedState(updatedAt).autonomy!)
    });
  }

  if (pathname === "/v1/autonomy/dispatch" && method === "POST") {
    const dispatchId = nextEmbeddedId("dispatch");
    const flowId = nextEmbeddedId("flow");
    appendTimelineEvent(store, {
      flowId,
      stage: "dispatch",
      title: "接收自动化调度",
      detail: String(body.text || "").slice(0, 120),
      source: "embedded-dispatch"
    });
    return makeEmbeddedJsonResponse({
      ok: true,
      dispatch: {
        id: dispatchId,
        flowId,
        kernel: "embedded-kernel",
        status: "completed",
        steps: [
          {
            id: nextEmbeddedId("step"),
            index: 1,
            type: "analyze",
            title: "解析任务",
            status: "completed",
            reason: "ok"
          }
        ]
      },
      autonomy: deepCloneValue(store.state.autonomy),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/aria-kernel/flywheel/status" && method === "GET") {
    const taskType = String(requestUrl.searchParams.get("taskType") || "").trim();
    const limit = Math.max(1, Math.min(120, Number(requestUrl.searchParams.get("limit") || 40)));
    const flywheel = deepCloneValue(store.flywheel);
    if (taskType) {
      flywheel.recentSignals = flywheel.recentSignals.filter((item) => item.taskType === taskType).slice(0, limit);
      flywheel.taskLeaderboards = {
        [taskType]: deepCloneValue(store.flywheel.taskLeaderboards[taskType] || [])
      };
    } else {
      flywheel.recentSignals = flywheel.recentSignals.slice(0, limit);
    }
    return makeEmbeddedJsonResponse({
      userId: store.state.userId,
      flywheel,
      updatedAt
    });
  }

  if (pathname === "/v1/aria-kernel/flywheel/replay" && method === "POST") {
    const taskType = String(body.taskType || "").trim();
    const replayed = taskType
      ? store.flywheel.recentSignals.filter((item) => item.taskType === taskType).length
      : store.flywheel.recentSignals.length;
    return makeEmbeddedJsonResponse({
      userId: store.state.userId,
      ok: true,
      reason: "embedded_replay",
      replayed,
      taskType,
      flywheel: deepCloneValue(store.flywheel),
      updatedAt
    });
  }

  if (pathname === "/v1/code/patch/gate" && method === "GET") {
    return makeEmbeddedJsonResponse({
      gate: deepCloneValue(store.codingPatchGate),
      updatedAt
    });
  }

  if (pathname === "/v1/timeline/unified" && method === "GET") {
    const flowId = String(requestUrl.searchParams.get("flowId") || "").trim();
    const limit = Math.max(1, Math.min(300, Number(requestUrl.searchParams.get("limit") || 120)));
    const timeline = deepCloneValue(store.timeline);
    if (flowId) {
      timeline.events = timeline.events.filter((item) => item.flowId === flowId).slice(0, limit);
      timeline.flows = timeline.flows.filter((item) => item.flowId === flowId);
      timeline.flowId = flowId;
      timeline.total = timeline.events.length;
    } else {
      timeline.events = timeline.events.slice(0, limit);
      timeline.total = timeline.events.length;
    }
    return makeEmbeddedJsonResponse({
      timeline,
      updatedAt
    });
  }

  if (pathname === "/v1/workday/state" && method === "GET") {
    const workday = deepCloneValue(store.state.workday || buildEmbeddedWorkday(updatedAt));
    const nextQuest = workday.quests.find((item) => item.status !== "done") || null;
    return makeEmbeddedJsonResponse({
      workday,
      nextQuest,
      summary: workday.lastSummary
    });
  }

  if (pathname === "/v1/workday/checkin" && method === "POST") {
    if (store.state.workday) {
      store.state.workday.lastCheckinAt = nowIso();
      store.state.workday.lastSummary = "签到成功，按“先难后易”的顺序推进今天任务。";
    }
    ensureEngagementToday(store.state.engagement);
    store.state.engagement.today.checkinDone = true;
    store.state.engagement.xp += 6;
    return makeEmbeddedJsonResponse({
      workday: deepCloneValue(store.state.workday || buildEmbeddedWorkday(updatedAt)),
      guidance: "先完成一个 25 分钟可交付，再切换下一个模块。",
      energy: Number(body.energy || 3),
      pressure: Number(body.pressure || 3)
    });
  }

  if (pathname === "/v1/workday/quest/complete" && method === "POST") {
    const questId = String(body.questId || "").trim();
    let xpGain = 0;
    if (store.state.workday) {
      const quest = store.state.workday.quests.find((item) => item.id === questId);
      if (quest && quest.status !== "done") {
        quest.status = "done";
        quest.completedAt = nowIso();
        quest.note = String(body.note || "").trim();
        xpGain = quest.rewardXp + quest.careBonus;
      }
      store.state.workday.completedCount = store.state.workday.quests.filter((item) => item.status === "done").length;
      store.state.workday.totalQuestXp += xpGain;
      store.state.workday.lastSummary = "任务已结算，继续保持这个推进节奏。";
    }
    ensureEngagementToday(store.state.engagement);
    if (xpGain > 0) {
      store.state.engagement.xp += xpGain;
      store.state.engagement.today.questCompleted = true;
      store.state.engagement.lastEventType = "quest_complete";
      store.state.engagement.lastEventAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "completed",
      xpGain,
      workday: deepCloneValue(store.state.workday || buildEmbeddedWorkday(updatedAt)),
      engagement: deepCloneValue(store.state.engagement)
    });
  }

  if (pathname === "/v1/workbench/state" && method === "GET") {
    return makeEmbeddedJsonResponse({
      workbench: deepCloneValue(store.state.workbench || buildEmbeddedWorkbench(updatedAt)),
      updatedAt
    });
  }

  if (pathname === "/v1/workbench/intent" && method === "POST") {
    const text = String(body.text || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags.map((item) => String(item)).filter(Boolean) : [];
    const workbench = store.state.workbench || buildEmbeddedWorkbench(updatedAt);
    const feedItem: WorkbenchFeedItem = {
      id: nextEmbeddedId("feed"),
      title: "新目标已接管",
      summary: text ? `已拆解：${text.slice(0, 60)}` : "已生成默认执行计划",
      source: "embedded-workbench",
      at: nowIso()
    };
    workbench.centerFeed.unshift(feedItem);
    workbench.centerFeed = workbench.centerFeed.slice(0, 40);
    workbench.coding.recentIntents.unshift({
      id: nextEmbeddedId("intent"),
      text: text || "未命名目标",
      tags,
      at: nowIso()
    });
    workbench.coding.recentIntents = workbench.coding.recentIntents.slice(0, 20);
    workbench.coding.lastPlan = [
      "明确输出标准",
      "拆分执行步骤",
      "执行并复盘"
    ];
    workbench.updatedAt = nowIso();
    store.state.workbench = workbench;
    if (store.state.workday) {
      store.state.workday.lastSummary = "已接收新目标，建议先完成第一步并快速回传结果。";
    }
    appendTimelineEvent(store, {
      stage: "workbench_intent",
      title: "接收工作目标",
      detail: text.slice(0, 120)
    });
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "accepted",
      tags,
      plan: deepCloneValue(workbench.coding.lastPlan),
      feedItem,
      dispatch: {
        id: nextEmbeddedId("dispatch"),
        status: "completed",
        steps: [
          { id: nextEmbeddedId("step"), status: "completed" },
          { id: nextEmbeddedId("step"), status: "completed" },
          { id: nextEmbeddedId("step"), status: "completed" }
        ]
      },
      autonomy: deepCloneValue(store.state.autonomy),
      deviceOps: deepCloneValue(store.state.deviceOps),
      expansion: deepCloneValue(store.state.expansion),
      workbench: deepCloneValue(workbench),
      workday: deepCloneValue(store.state.workday || buildEmbeddedWorkday(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/workbench/tool/run" && method === "POST") {
    const toolId = String(body.toolId || "").trim();
    const tool = store.state.workbench?.rightTools.find((item) => item.id === toolId);
    const at = nowIso();
    if (tool) {
      tool.lastRunAt = at;
      tool.lastResult = "执行完成";
    }
    const feedItem: WorkbenchFeedItem = {
      id: nextEmbeddedId("feed"),
      title: tool?.title || "工具执行",
      summary: tool ? `${tool.title} 已完成执行` : "工具执行完成",
      source: "embedded-workbench",
      at
    };
    if (store.state.workbench) {
      store.state.workbench.centerFeed.unshift(feedItem);
      store.state.workbench.centerFeed = store.state.workbench.centerFeed.slice(0, 40);
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "completed",
      task: null,
      feedItem,
      workbench: deepCloneValue(store.state.workbench || buildEmbeddedWorkbench(updatedAt)),
      deviceOps: deepCloneValue(store.state.deviceOps || buildEmbeddedDeviceOps(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/workbench/model/select" && method === "POST") {
    const modelId = String(body.modelId || "").trim();
    const modelOption = store.state.workbench?.modelCenter.options.find((item) => item.id === modelId)
      || store.state.workbench?.modelCenter.options[0];
    if (modelOption && store.state.workbench) {
      store.state.workbench.modelCenter.currentModel = modelOption.id;
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "selected",
      selectedModel: deepCloneValue(modelOption || {
        id: "aria-empathy",
        label: "陪伴主模型",
        provider: "openai"
      }),
      workbench: deepCloneValue(store.state.workbench || buildEmbeddedWorkbench(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/workbench/coding/workspace" && method === "POST") {
    const cwd = String(body.cwd || "").trim() || "~/Desktop";
    const absolutePath = cwd.startsWith("/")
      ? cwd
      : `/Users/Shared/${cwd.replace(/^~\//, "")}`;
    if (store.state.workbench) {
      store.state.workbench.coding.workspace = {
        cwd,
        absolutePath,
        exists: true,
        openedAt: nowIso(),
        lastAction: "updated",
        entries: [
          { name: "src", kind: "dir" },
          { name: "README.md", kind: "file" }
        ]
      };
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "workspace_updated",
      workspace: deepCloneValue(store.state.workbench?.coding.workspace || buildEmbeddedWorkbench(updatedAt).coding.workspace),
      openResult: null,
      workbench: deepCloneValue(store.state.workbench || buildEmbeddedWorkbench(updatedAt)),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/workbench/coding/workspace/pick" && method === "POST") {
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "picked",
      path: "~/Desktop",
      absolutePath: "/Users/Shared",
      message: "内置运行时返回默认目录"
    });
  }

  if (pathname === "/v1/workbench/coding/tree" && method === "GET") {
    const cwd = String(requestUrl.searchParams.get("cwd") || store.state.workbench?.coding.workspace.cwd || "~/Desktop");
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "ok",
      tree: {
        rootCwd: cwd,
        rootAbsolutePath: cwd.startsWith("/") ? cwd : `/Users/Shared/${cwd.replace(/^~\//, "")}`,
        maxDepth: Number(requestUrl.searchParams.get("maxDepth") || 4),
        maxNodes: Number(requestUrl.searchParams.get("maxNodes") || 200),
        truncated: false,
        generatedAt: nowIso(),
        nodes: [
          { id: "node-1", path: ".", name: ".", kind: "dir", depth: 0, parentPath: "" },
          { id: "node-2", path: "src", name: "src", kind: "dir", depth: 1, parentPath: "." },
          { id: "node-3", path: "README.md", name: "README.md", kind: "file", depth: 1, parentPath: "." }
        ]
      },
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/workbench/coding/file" && method === "GET") {
    const filePath = String(requestUrl.searchParams.get("path") || "README.md");
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "ok",
      file: {
        path: filePath,
        absolutePath: `/Users/Shared/${filePath.replace(/^\/+/, "")}`,
        language: filePath.endsWith(".ts") ? "typescript" : "markdown",
        sizeBytes: 128,
        lineCount: 6,
        truncated: false,
        readonly: false,
        content: "# Embedded Workspace\n\nThis file is generated by embedded runtime fallback.\n",
        generatedAt: nowIso()
      },
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/expansion/state" && method === "GET") {
    return makeEmbeddedJsonResponse({
      expansion: deepCloneValue(store.state.expansion || buildEmbeddedExpansion(updatedAt)),
      updatedAt
    });
  }

  if (pathname === "/v1/expansion/packs/install" && method === "POST") {
    const pack: ExpansionPack = {
      id: String(body.packId || nextEmbeddedPackId()),
      name: String(body.name || "Custom Pack"),
      version: String(body.version || "1.0.0"),
      source: String(body.source || "embedded"),
      status: "installed",
      capabilities: Array.isArray(body.capabilities)
        ? body.capabilities.map((item) => String(item))
        : ["custom_capability"]
    };
    if (!store.state.expansion) {
      store.state.expansion = buildEmbeddedExpansion(updatedAt);
    }
    store.state.expansion.packs.unshift(pack);
    store.state.expansion.packs = store.state.expansion.packs.slice(0, 20);
    store.state.expansion.stats.installedCount = store.state.expansion.packs.length;
    const nextUpdatedAt = touchEmbeddedState(store);
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "installed",
      pack: deepCloneValue(pack),
      expansion: deepCloneValue(store.state.expansion),
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/expansion/fetch-download" && method === "POST") {
    if (!store.state.expansion) {
      store.state.expansion = buildEmbeddedExpansion(updatedAt);
    }
    const now = nowIso();
    const job: ExpansionJob = {
      id: nextEmbeddedId("job"),
      type: "fetch_download",
      status: "completed",
      targetUrl: String(body.targetUrl || ""),
      saveAs: String(body.saveAs || "download.bin"),
      reason: String(body.reason || "user_request"),
      createdAt: now,
      finishedAt: now,
      output: {
        summary: "内置模式已模拟下载完成",
        savedPath: `/Users/Shared/Downloads/${String(body.saveAs || "download.bin")}`
      }
    };
    store.state.expansion.jobs.unshift(job);
    store.state.expansion.jobs = store.state.expansion.jobs.slice(0, 40);
    store.state.expansion.stats.downloadsToday += 1;
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "completed",
      job: deepCloneValue(job),
      download: {
        ok: true,
        reason: "embedded_done",
        summary: "内置运行时模拟下载完成",
        savedPath: job.output.savedPath,
        relativePath: `Downloads/${job.saveAs}`,
        bytes: 1024,
        sha256: "embedded",
        contentType: "application/octet-stream",
        error: ""
      },
      expansion: deepCloneValue(store.state.expansion),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/device/capabilities" && method === "GET") {
    return makeEmbeddedJsonResponse({
      deviceOps: deepCloneValue(store.state.deviceOps || buildEmbeddedDeviceOps(updatedAt))
    });
  }

  if (pathname === "/v1/device/permissions" && method === "POST") {
    const capabilityId = String(body.capabilityId || "").trim();
    const status = String(body.status || "").trim();
    if (store.state.deviceOps) {
      if (status === "granted" || status === "blocked" || status === "prompt") {
        store.state.deviceOps.permissions[capabilityId] = status;
        const capability = store.state.deviceOps.capabilities.find((item) => item.id === capabilityId);
        if (capability) {
          capability.permission = status;
        }
      }
      store.state.deviceOps.lastPermissionUpdateAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "updated",
      deviceOps: deepCloneValue(store.state.deviceOps || buildEmbeddedDeviceOps(updatedAt))
    });
  }

  if (pathname === "/v1/device/tasks" && method === "GET") {
    const status = String(requestUrl.searchParams.get("status") || "").trim();
    const limit = Math.max(1, Math.min(60, Number(requestUrl.searchParams.get("limit") || 20)));
    const allTasks = store.state.deviceOps?.tasks || [];
    const filtered = status ? allTasks.filter((item) => item.status === status) : allTasks;
    return makeEmbeddedJsonResponse({
      tasks: deepCloneValue(filtered.slice(0, limit)),
      total: filtered.length
    });
  }

  if (pathname === "/v1/device/tasks/plan" && method === "POST") {
    const taskType = String(body.taskType || "desktop_focus_cleanup");
    const capabilityId = taskType.startsWith("mobile") ? "desktop_files" : "desktop_files";
    const permission = store.state.deviceOps?.permissions[capabilityId] || "prompt";
    const now = nowIso();
    const task: DeviceTask = {
      id: nextEmbeddedTaskId(),
      type: taskType,
      capabilityId,
      title: "设备任务",
      summary: `已规划任务：${taskType}`,
      target: String((body.payload as Record<string, unknown> | undefined)?.target || "local_device"),
      status: permission === "granted" ? "planned" : "needs_permission",
      reason: permission === "granted" ? "ready" : "permission_required",
      requestedAt: now,
      startedAt: "",
      finishedAt: "",
      output: null
    };
    if (store.state.deviceOps) {
      store.state.deviceOps.tasks.unshift(task);
      store.state.deviceOps.tasks = store.state.deviceOps.tasks.slice(0, 80);
      store.state.deviceOps.audit.unshift({
        id: nextEmbeddedId("audit"),
        type: "task_plan",
        message: `已规划任务 ${taskType}`,
        metadata: {
          taskId: task.id
        },
        at: now
      });
      store.state.deviceOps.audit = store.state.deviceOps.audit.slice(0, 100);
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "planned",
      task: deepCloneValue(task),
      deviceOps: deepCloneValue(store.state.deviceOps || buildEmbeddedDeviceOps(updatedAt))
    });
  }

  if (pathname === "/v1/device/tasks/execute" && method === "POST") {
    const taskId = String(body.taskId || "").trim();
    let task: DeviceTask | null = null;
    if (store.state.deviceOps) {
      task = store.state.deviceOps.tasks.find((item) => item.id === taskId) || null;
      if (task) {
        task.status = "completed";
        task.startedAt = nowIso();
        task.finishedAt = nowIso();
        task.reason = "ok";
        task.output = {
          summary: "内置模式执行完成",
          metrics: {
            filesProcessed: 12
          }
        };
      }
    }
    return makeEmbeddedJsonResponse({
      ok: Boolean(task),
      reason: task ? "completed" : "task_not_found",
      task: deepCloneValue(task),
      deviceOps: deepCloneValue(store.state.deviceOps || buildEmbeddedDeviceOps(updatedAt))
    });
  }

  if (pathname === "/v1/device/audit" && method === "GET") {
    const limit = Math.max(1, Math.min(200, Number(requestUrl.searchParams.get("limit") || 40)));
    const audit = store.state.deviceOps?.audit || [];
    return makeEmbeddedJsonResponse({
      audit: deepCloneValue(audit.slice(0, limit)),
      total: audit.length
    });
  }

  if (pathname === "/v1/hardware/status" && method === "GET") {
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "ok",
      snapshot: {
        platform: "embedded",
        release: "1.0",
        arch: "universal",
        hostname: "aria-embedded",
        cpu: {
          cores: 8,
          model: "embedded-cpu"
        },
        memory: {
          totalGb: 16,
          freeGb: 8,
          usedGb: 8
        },
        battery: {
          level: 1,
          charging: true
        }
      },
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/memory/search" && method === "GET") {
    const query = String(requestUrl.searchParams.get("q") || "");
    const limit = Math.max(1, Math.min(24, Number(requestUrl.searchParams.get("limit") || 8)));
    return makeEmbeddedJsonResponse({
      items: buildMemorySearchItems(store, query, limit),
      query
    });
  }

  if (pathname === "/v1/memory/architecture" && method === "GET") {
    const runtime = store.systemConfig.memoryPlaneRuntime || {};
    const architecture = normalizeEmbeddedMemoryArchitecture(runtime.architecture);
    const summary = {
      longTerm: Number(runtime.memorySummary?.longTerm || 0),
      middleTerm: Number(runtime.memorySummary?.middleTerm || 0),
      shortTerm: Number(runtime.memorySummary?.shortTerm || 0),
      temporary: Number(runtime.memorySummary?.temporary || 0),
      vectorIndex: Number(runtime.memorySummary?.vectorIndex || 0)
    };
    return makeEmbeddedJsonResponse({
      architecture,
      summary,
      updatedAt
    });
  }

  if (pathname === "/v1/memory/architecture" && method === "POST") {
    const runtime = store.systemConfig.memoryPlaneRuntime || {};
    const current = normalizeEmbeddedMemoryArchitecture(runtime.architecture);
    const rawPatch = asEmbeddedRecord(
      body.architecture && typeof body.architecture === "object"
        ? body.architecture
        : body
    );
    const merged = {
      ...current,
      ...rawPatch,
      shortTerm: {
        ...current.shortTerm,
        ...asEmbeddedRecord(rawPatch.shortTerm)
      },
      midTerm: {
        ...current.midTerm,
        ...asEmbeddedRecord(rawPatch.midTerm)
      },
      longTerm: {
        ...current.longTerm,
        ...asEmbeddedRecord(rawPatch.longTerm)
      },
      temporary: {
        ...current.temporary,
        ...asEmbeddedRecord(rawPatch.temporary)
      },
      realtimeReasoning: {
        ...current.realtimeReasoning,
        ...asEmbeddedRecord(rawPatch.realtimeReasoning)
      },
      updatedAt
    };
    const architecture = normalizeEmbeddedMemoryArchitecture(merged, current);
    store.systemConfig.memoryPlaneRuntime = {
      ...runtime,
      architecture,
      memorySummary: {
        ...runtime.memorySummary,
        middleTerm: Number(runtime.memorySummary?.middleTerm || 0)
      }
    };
    return makeEmbeddedJsonResponse({
      architecture: deepCloneValue(architecture),
      runtime: deepCloneValue(store.systemConfig.memoryPlaneRuntime),
      updatedAt
    });
  }

  if (pathname === "/v1/memory/backend/check" && method === "GET") {
    return makeEmbeddedJsonResponse({
      check: {
        checkedAt: nowIso(),
        mode: "local",
        overallStatus: "healthy",
        checks: [
          { id: "storage", label: "存储层", status: "ok", detail: "内置存储正常" },
          { id: "index", label: "索引层", status: "ok", detail: "索引可用" }
        ],
        suggestions: [
          {
            id: "upgrade-online-api",
            title: "可选：接入在线 API",
            level: "safe",
            detail: "当前已可离线运行，如需更强模型可后续接入在线 API。"
          }
        ],
        environment: {
          platform: "embedded",
          node: "n/a",
          dockerAvailable: false,
          brewAvailable: false
        },
        runtime: deepCloneValue(store.systemConfig.memoryPlaneRuntime)
      }
    });
  }

  if (pathname === "/v1/memory" && method === "POST") {
    const content = String(body.content || "").trim();
    if (content) {
      store.state.memoryHighlights = [content, ...store.state.memoryHighlights].slice(0, 20);
    }
    return makeEmbeddedJsonResponse({
      item: {
        id: nextEmbeddedId("memory"),
        source: "manual",
        scene: String(body.scene || "life"),
        tier: String(body.tier || "short_term"),
        content
      },
      memoryHighlights: deepCloneValue(store.state.memoryHighlights)
    });
  }

  if (pathname.startsWith("/v1/memory/") && method === "DELETE") {
    const id = decodeURIComponent(pathname.slice("/v1/memory/".length));
    const target = store.state.memoryHighlights.find((item) => item.includes(id)) || store.state.memoryHighlights[0] || "";
    store.state.memoryHighlights = store.state.memoryHighlights.filter((item) => item !== target);
    return makeEmbeddedJsonResponse({
      removed: {
        id,
        content: target
      },
      memoryHighlights: deepCloneValue(store.state.memoryHighlights)
    });
  }

  if (pathname === "/v1/proactive/next" && method === "POST") {
    const suggestion: ProactiveSuggestion = {
      id: nextEmbeddedId("suggestion"),
      type: "nudge",
      title: "先完成一个最小目标",
      message: "你可以先拿下 20 分钟可交付任务，我会继续带你推进。",
      ctaLabel: "开始 20 分钟冲刺",
      prefillText: "帮我制定一个20分钟冲刺计划",
      rewardHint: "+8 XP",
      triggerConfidence: 0.82,
      scene: String(body.scene || "desktop-chat"),
      generatedAt: nowIso()
    };
    if (store.state.proactive) {
      store.state.proactive.sentCount += 1;
      store.state.proactive.lastSentAt = nowIso();
      store.state.proactive.lastType = suggestion.type;
    }
    return makeEmbeddedJsonResponse({
      delivered: true,
      decision: "send",
      reason: "embedded_ready",
      trigger_confidence: suggestion.triggerConfidence,
      nextEligibleAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      proactive: deepCloneValue(store.state.proactive),
      suggestion,
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/proactive/feedback" && method === "POST") {
    if (store.state.proactive) {
      store.state.proactive.lastType = String(body.feedback || "");
      store.state.proactive.lastSentAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      applied: true,
      reason: "feedback_recorded",
      autonomy: deepCloneValue(store.state.autonomy),
      proactive: deepCloneValue(store.state.proactive),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/scene/config" && method === "GET") {
    return makeEmbeddedJsonResponse({
      sceneConfig: deepCloneValue(store.state.sceneConfig || {
        modules: {},
        recent: [],
        updatedAt
      }),
      updatedAt
    });
  }

  if (pathname === "/v1/scene/config/apply" && method === "POST") {
    const scene = normalizeScene(body.scene, "love");
    const moduleId = String(body.moduleId || "default_module");
    const moduleKey = `${scene}:${moduleId}`;
    const now = nowIso();
    const module: DemoSceneConfigModule = {
      moduleKey,
      scene,
      moduleId,
      title: String(body.title || `${scene} 场景模块`),
      goal: String(body.goal || "提升陪伴与执行流畅度"),
      configText: String(body.configText || ""),
      prompt: String(body.prompt || ""),
      status: "configured",
      executionCount: 1,
      appliedAt: now,
      lastExecutedAt: now,
      lastResult: {
        status: "completed",
        summary: "内置配置已生效",
        taskIds: [],
        dispatchId: "",
        reason: "embedded_runtime"
      }
    };
    if (!store.state.sceneConfig) {
      store.state.sceneConfig = {
        modules: {},
        recent: [],
        updatedAt: now
      };
    }
    store.state.sceneConfig.modules[moduleKey] = module;
    store.state.sceneConfig.recent.unshift({
      id: nextEmbeddedId("scene-config"),
      moduleKey,
      scene,
      moduleId,
      title: module.title,
      status: module.status,
      summary: module.lastResult.summary,
      at: now
    });
    store.state.sceneConfig.recent = store.state.sceneConfig.recent.slice(0, 40);
    store.state.sceneConfig.updatedAt = now;
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "configured",
      module: deepCloneValue(module),
      execution: deepCloneValue(module.lastResult),
      generatedPrompt: module.prompt,
      sceneConfig: deepCloneValue(store.state.sceneConfig),
      autonomy: deepCloneValue(store.state.autonomy),
      proactive: deepCloneValue(store.state.proactive),
      workday: deepCloneValue(store.state.workday),
      workbench: deepCloneValue(store.state.workbench),
      deviceOps: deepCloneValue(store.state.deviceOps),
      expansion: deepCloneValue(store.state.expansion),
      funGames: deepCloneValue(store.state.funGames),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/fun/games" && method === "GET") {
    const limit = Math.max(1, Math.min(80, Number(requestUrl.searchParams.get("limit") || 40)));
    const games = store.state.funGames || [];
    return makeEmbeddedJsonResponse({
      games: deepCloneValue(games.slice(0, limit)),
      total: games.length,
      updatedAt
    });
  }

  if (pathname === "/v1/fun/games/create" && method === "POST") {
    if (!store.state.funGames) {
      store.state.funGames = [];
    }
    const now = nowIso();
    const game: DemoFunGame = {
      id: nextEmbeddedId("game"),
      mode: body.mode === "handmade_game" ? "handmade_game" : "mini_game",
      blueprint: "reaction",
      title: String(body.title || "新小游戏"),
      prompt: String(body.prompt || "点击开始即可游玩"),
      difficulty: body.funGameConfig && typeof body.funGameConfig === "object"
        ? (["easy", "normal", "hard"].includes(String((body.funGameConfig as Record<string, unknown>).difficulty))
          ? String((body.funGameConfig as Record<string, unknown>).difficulty)
          : "normal") as "easy" | "normal" | "hard"
        : "normal",
      rounds: Number((body.funGameConfig as Record<string, unknown> | undefined)?.rounds || 5),
      scoreEnabled: (body.funGameConfig as Record<string, unknown> | undefined)?.scoreEnabled !== false,
      rewardEnabled: (body.funGameConfig as Record<string, unknown> | undefined)?.rewardEnabled !== false,
      reviveEnabled: Boolean((body.funGameConfig as Record<string, unknown> | undefined)?.reviveEnabled),
      templateId: String(body.templateId || "tpl-reaction"),
      templateName: String(body.templateName || "Reaction Basic"),
      templateRules: ["5 轮计分", "支持复活"],
      source: "embedded",
      createdAt: now,
      updatedAt: now,
      playUrl: "https://html5games.com/Game/Reaction/7ec3df31-7f48-47fd-a84f-f2e32ea91c57",
      status: "ready"
    };
    store.state.funGames.unshift(game);
    store.state.funGames = store.state.funGames.slice(0, 60);
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "created",
      game: deepCloneValue(game),
      skillBootstrap: {
        ok: true,
        reason: "embedded",
        moduleId: game.mode === "handmade_game" ? "handmade_game" : "mini_game",
        query: game.title,
        summary: "内置小游戏已创建",
        installed: [],
        alreadyInstalled: [],
        failed: [],
        candidates: []
      },
      games: deepCloneValue(store.state.funGames),
      templates: deepCloneValue(store.state.funRuleTemplates || []),
      updatedAt: touchEmbeddedState(store)
    });
  }

  if (pathname === "/v1/voice/profile" && method === "GET") {
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "ok",
      profile: deepCloneValue(store.voiceProfile),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/profile" && method === "POST") {
    const presetId = String(body.presetId || "").trim();
    const preset = store.voiceProfile.presets.find((item) => item.id === presetId);
    if (preset) {
      store.voiceProfile.activePresetId = preset.id;
      store.voiceProfile.defaultVoice = preset.voice;
      store.voiceProfile.defaultRate = preset.rate;
    }
    if (typeof body.voice === "string" && body.voice.trim()) {
      store.voiceProfile.defaultVoice = body.voice.trim();
    }
    if (typeof body.rate === "number" && Number.isFinite(body.rate)) {
      store.voiceProfile.defaultRate = Math.max(0.6, Math.min(2, body.rate));
    }
    if (typeof body.allowMicCapture === "boolean") {
      store.voiceProfile.allowMicCapture = body.allowMicCapture;
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "updated",
      profile: deepCloneValue(store.voiceProfile),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/tts" && method === "POST") {
    const text = String(body.text || "").trim();
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "spoken",
      result: {
        summary: text
          ? `已播报：${text.slice(0, 28)}${text.length > 28 ? "..." : ""}`
          : "已播报",
        metrics: {
          chars: text.length
        }
      },
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/channel/status" && method === "GET") {
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "ok",
      channel: deepCloneValue(store.voiceChannel),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/channel/acquire" && method === "POST") {
    const now = nowIso();
    const leaseMs = Math.max(5000, Math.min(300000, Number(body.leaseMs || 60000)));
    store.voiceChannel = {
      active: true,
      owner: String(body.owner || "desktop-user"),
      token: nextEmbeddedId("voice-token"),
      tokenPreview: "embedded***",
      acquiredAt: now,
      leaseMs,
      expiresAt: new Date(Date.now() + leaseMs).toISOString(),
      expiresInMs: leaseMs,
      lastReason: "acquired",
      lastUpdatedAt: now
    };
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "acquired",
      channel: deepCloneValue(store.voiceChannel),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/channel/renew" && method === "POST") {
    if (store.voiceChannel) {
      const leaseMs = Math.max(5000, Math.min(300000, Number(body.leaseMs || store.voiceChannel.leaseMs || 60000)));
      store.voiceChannel.leaseMs = leaseMs;
      store.voiceChannel.expiresAt = new Date(Date.now() + leaseMs).toISOString();
      store.voiceChannel.expiresInMs = leaseMs;
      store.voiceChannel.lastReason = "renewed";
      store.voiceChannel.lastUpdatedAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "renewed",
      channel: deepCloneValue(store.voiceChannel),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/voice/channel/release" && method === "POST") {
    if (store.voiceChannel) {
      store.voiceChannel.active = false;
      store.voiceChannel.lastReason = "released";
      store.voiceChannel.lastUpdatedAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "released",
      channel: deepCloneValue(store.voiceChannel),
      bridge: deepCloneValue(store.state.deviceOps?.bridge || buildEmbeddedDeviceOps(updatedAt).bridge),
      error: ""
    });
  }

  if (pathname === "/v1/message" && method === "POST") {
    const exchange = buildEmbeddedMessageExchange(store, {
      text: String(body.text || ""),
      preferredProviderId: String(body.preferredProviderId || ""),
      taskType: String(body.taskType || ""),
      scene: String(body.scene || "love")
    });
    return makeEmbeddedJsonResponse({
      state: exchange.donePayload.state
    });
  }

  if (pathname === "/v1/message/withdraw-last" && method === "POST") {
    const scene = normalizeScene(body.scene, "love");
    const removeAssistantReply = body.removeAssistantReply !== false;
    const messages = store.state.messages;
    let userIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role !== "user") continue;
      if (scene && message.scene && message.scene !== scene) continue;
      userIndex = index;
      break;
    }
    if (userIndex < 0) {
      return makeEmbeddedJsonResponse({
        ok: false,
        reason: "scene_user_message_not_found",
        withdrawn: {
          scene,
          removedCount: 0,
          assistantRemovedCount: 0,
          removedMessageIds: [],
          userMessage: null
        },
        state: deepCloneValue(store.state),
        updatedAt: touchEmbeddedState(store)
      });
    }
    const removedMessageIds: string[] = [];
    const userMessage = messages[userIndex];
    removedMessageIds.push(userMessage.id);
    messages.splice(userIndex, 1);
    let assistantRemovedCount = 0;
    if (removeAssistantReply && messages[userIndex] && messages[userIndex].role === "aria") {
      removedMessageIds.push(messages[userIndex].id);
      messages.splice(userIndex, 1);
      assistantRemovedCount = 1;
    } else if (removeAssistantReply && userIndex > 0 && messages[userIndex - 1]?.role === "aria") {
      removedMessageIds.push(messages[userIndex - 1].id);
      messages.splice(userIndex - 1, 1);
      assistantRemovedCount = 1;
    }
    const nextUpdatedAt = touchEmbeddedState(store);
    return makeEmbeddedJsonResponse({
      ok: true,
      reason: "withdrawn",
      withdrawn: {
        scene,
        removedCount: removedMessageIds.length,
        assistantRemovedCount,
        removedMessageIds,
        userMessage
      },
      state: deepCloneValue(store.state),
      updatedAt: nextUpdatedAt
    });
  }

  if (pathname === "/v1/message/stream" && method === "POST") {
    const exchange = buildEmbeddedMessageExchange(store, {
      text: String(body.text || ""),
      preferredProviderId: String(body.preferredProviderId || ""),
      taskType: String(body.taskType || ""),
      scene: String(body.scene || "love")
    });
    const events: Array<{ event: string; data: unknown }> = [
      {
        event: "meta",
        data: {
          streamId: exchange.streamId,
          userMessage: exchange.userMessage,
          modelRoute: exchange.route
        } as StreamMetaPayload
      }
    ];
    for (const chunkPayload of exchange.chunks) {
      events.push({
        event: "chunk",
        data: chunkPayload
      });
    }
    events.push({
      event: "done",
      data: exchange.donePayload
    });
    return createSseResponse(events);
  }

  if (pathname === "/v1/xhs/pipeline/status" && method === "GET") {
    const jobId = String(requestUrl.searchParams.get("jobId") || "").trim();
    const jobs = deepCloneValue(store.xhsJobs);
    const target = jobId ? jobs.find((item) => item.id === jobId) || null : jobs[0] || null;
    return makeEmbeddedJsonResponse({
      ok: true,
      userId: store.state.userId,
      job: target,
      jobs,
      runningCount: jobs.filter((item) => item.status === "running").length,
      defaults: {
        assetsDir: "/Users/Shared/Movies",
        outputRoot: "/Users/Shared/Movies/aria-output",
        publish: false,
        skipUpload: true,
        headless: true
      },
      workflow: ["collect_assets", "generate_script", "compose_video", "publish_optional"],
      nextStepHint: "内置模式仅演示流程，不会真实上传。"
    });
  }

  if (pathname === "/v1/xhs/pipeline/start" && method === "POST") {
    const now = nowIso();
    const job: XhsPipelineJob = {
      id: nextEmbeddedId("xhs-job"),
      userId: store.state.userId,
      status: "completed",
      reason: "embedded_demo",
      summary: "内置模式已完成模拟执行",
      startedAt: now,
      updatedAt: now,
      finishedAt: now,
      exitCode: 0,
      pid: 0,
      input: {
        theme: String(body.theme || ""),
        assetsDir: String(body.assetsDir || ""),
        outputRoot: String(body.outputRoot || ""),
        publish: Boolean(body.publish),
        headless: Boolean(body.headless),
        skipUpload: body.skipUpload !== false,
        model: String(body.model || "gpt-4.1-mini")
      },
      outputDir: "/Users/Shared/Movies/aria-output",
      videoFile: "embedded-demo.mp4",
      uploadStatus: "skipped",
      runId: nextEmbeddedId("xhs-run"),
      error: "",
      logs: [
        {
          at: now,
          channel: "info",
          text: "embedded mode completed"
        }
      ],
      result: {
        demo: true
      }
    };
    store.xhsJobs.unshift(job);
    store.xhsJobs = store.xhsJobs.slice(0, 30);
    return makeEmbeddedJsonResponse({
      ok: true,
      userId: store.state.userId,
      job: deepCloneValue(job),
      workflow: ["collect_assets", "generate_script", "compose_video", "publish_optional"],
      nextStepHint: "模拟执行完成，可继续测试聊天与执行链路。"
    });
  }

  if (pathname === "/v1/xhs/pipeline/cancel" && method === "POST") {
    const jobId = String(body.jobId || "").trim();
    const job = store.xhsJobs.find((item) => item.id === jobId) || null;
    if (job) {
      job.status = "failed";
      job.reason = "cancelled";
      job.summary = "任务已取消";
      job.updatedAt = nowIso();
      job.finishedAt = nowIso();
    }
    return makeEmbeddedJsonResponse({
      ok: Boolean(job),
      reason: job ? "cancelled" : "not_found",
      job
    });
  }

  return null;
}

function shouldTryEmbeddedFallbackByStatus(status: number) {
  return status === 404 || status === 405 || status >= 500;
}

type GuestAuthPayload = {
  token: string;
  user: {
    id: string;
    name: string;
    isGuest: boolean;
  };
  expiresAt: string;
};

function sleep(ms: number) {
  return new Promise<void>((resolvePromise) => {
    window.setTimeout(() => resolvePromise(), Math.max(0, ms));
  });
}

function extractUpstreamTraceId(headers: Headers) {
  return (
    headers.get("x-cloudaicompanion-trace-id")
    || headers.get("x-request-id")
    || headers.get("trace-id")
    || ""
  ).trim();
}

function tryExtractReadableError(raw: string) {
  const text = String(raw || "").trim();
  if (!text) return "";
  try {
    const payload = JSON.parse(text) as {
      error?: string | { message?: string; code?: string | number };
      message?: string;
      reason?: string;
      status?: string;
    };
    if (typeof payload.error === "object" && payload.error) {
      const fromErrorObject = String(payload.error.message || payload.error.code || "").trim();
      if (fromErrorObject) {
        return fromErrorObject;
      }
    }
    const fromRoot = String(payload.message || payload.reason || payload.error || payload.status || "").trim();
    if (fromRoot) {
      return fromRoot;
    }
  } catch {
    // keep raw text
  }
  return text;
}

async function extractErrorDetail(response: Response) {
  const traceId = extractUpstreamTraceId(response.headers);
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as {
        error?: string | { message?: string; code?: string | number };
        message?: string;
        reason?: string;
        status?: string;
      };
      if (typeof payload.error === "object" && payload.error) {
        const fromErrorObject = String(payload.error.message || payload.error.code || "").trim();
        if (fromErrorObject) {
          return { detail: fromErrorObject, traceId };
        }
      }
      const fromRoot = String(payload.message || payload.error || payload.reason || payload.status || "").trim();
      return { detail: fromRoot, traceId };
    }
    const rawText = await response.text();
    return {
      detail: tryExtractReadableError(rawText),
      traceId
    };
  } catch {
    return { detail: "", traceId };
  }
}

function shouldRetryStreamError(error: unknown) {
  const text = String(error instanceof Error ? error.message : error || "").toLowerCase();
  if (!text) return false;
  if (/api request failed:\s*(408|425|429|500|502|503|504)\b/.test(text)) {
    return true;
  }
  return (
    text.includes("stream closed without a done event")
    || text.includes("stream connect timeout")
    || text.includes("stream idle timeout")
    || text.includes("stream total timeout")
    || text.includes("aborterror")
    || text.includes("aborted")
    || text.includes("timeout")
    || text.includes("internal error encountered")
    || text.includes("status\": \"internal")
    || text.includes("failed to fetch")
    || text.includes("networkerror")
  );
}

async function request<T>(
  path: string,
  init?: RequestInit,
  auth = true,
  retriedAfterAuth = false
): Promise<T> {
  const response = await requestRaw(path, init, auth, retriedAfterAuth);
  try {
    return (await response.json()) as T;
  } catch (parseError) {
    const fallbackResponse = buildEmbeddedFallbackResponse(path, init);
    if (fallbackResponse) {
      return (await fallbackResponse.json()) as T;
    }
    throw parseError;
  }
}

async function requestRaw(
  path: string,
  init?: RequestInit,
  auth = true,
  retriedAfterAuth = false
): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = await ensureGuestToken();
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-Aria-Client-Scope", CLIENT_SCOPE);
  }

  const baseCandidates = API_BASE_CANDIDATES.length > 0 ? API_BASE_CANDIDATES : [API_BASE];
  let response: Response | null = null;
  let lastNetworkError: unknown = null;
  let lastTriedBase = API_BASE;
  for (const base of baseCandidates) {
    lastTriedBase = base;
    try {
      response = await fetch(`${base}${path}`, {
        ...init,
        headers: headers
      });
      if (response) {
        break;
      }
    } catch (networkError) {
      lastNetworkError = networkError;
    }
  }

  if (!response) {
    const fallbackResponse = buildEmbeddedFallbackResponse(path, init);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    if (lastNetworkError instanceof Error && /fetch/i.test(lastNetworkError.message)) {
      const tries = baseCandidates.join(" / ");
      throw new Error(
        `无法连接 Aria API（已尝试：${tries || lastTriedBase}）。${RUNTIME_START_HINT}`
      );
    }
    throw (lastNetworkError || new Error("Unknown network error"));
  }

  if (response.status === 401 && auth && !retriedAfterAuth) {
    await forceRefreshAuth();
    return requestRaw(path, init, auth, true);
  }

  if (
    path.startsWith("/v1/message/stream")
    && response.ok
    && !(response.headers.get("content-type") || "").toLowerCase().includes("text/event-stream")
  ) {
    const fallbackResponse = buildEmbeddedFallbackResponse(path, init);
    if (fallbackResponse) {
      return fallbackResponse;
    }
  }

  if (!response.ok) {
    if (shouldTryEmbeddedFallbackByStatus(response.status)) {
      const fallbackResponse = buildEmbeddedFallbackResponse(path, init);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    const fallback = `${response.status} ${response.statusText}`;
    const detailPayload = await extractErrorDetail(response);
    const detail = detailPayload.detail;
    const traceId = detailPayload.traceId;
    const suffix = detail ? ` - ${detail}` : "";
    const traceSuffix = traceId ? ` [trace: ${traceId}]` : "";
    const retryHint = TRANSIENT_HTTP_STATUS.has(response.status)
      ? "（上游暂时异常，建议稍后自动重试）"
      : "";
    throw new Error(`API request failed: ${fallback}${suffix}${traceSuffix}${retryHint}`);
  }

  return response;
}

async function refreshGuestAuth() {
  const payload = await request<GuestAuthPayload>(
    "/v1/auth/guest",
    {
      method: "POST",
      body: JSON.stringify({
        deviceId: demoDeviceId,
        platform: "desktop-web",
        clientId: CLIENT_SCOPE
      })
    },
    false
  );
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_ID_KEY, payload.user.id);
  return payload.token;
}

async function ensureGuestToken() {
  const cached = localStorage.getItem(TOKEN_KEY);
  if (cached) {
    return cached;
  }
  return refreshGuestAuth();
}

function parseSseBlock(block: string) {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim());
    }
  }
  return {
    event,
    data: dataLines.join("\n")
  };
}

function normalizeSystemConfigResult<T extends Record<string, unknown>>(raw: T): T {
  if (!raw || typeof raw !== "object") {
    return raw;
  }
  if (!isLegacyCompatBridgeEnabled()) {
    return raw;
  }

  const normalized = { ...raw } as Record<string, unknown>;

  const runtime = normalized.modelRouterRuntime as Record<string, unknown> | undefined;
  if (runtime && typeof runtime === "object") {
    const legacyKernel = runtime.openclaw as Record<string, unknown> | undefined;
    if (!runtime.ariaKernel && legacyKernel) {
      runtime.ariaKernel = legacyKernel;
    }
    const providerRuntimes = Array.isArray(runtime.providerRuntimes) ? runtime.providerRuntimes : [];
    runtime.providerRuntimes = providerRuntimes.map((item) => {
      if (!item || typeof item !== "object") return item;
      const provider = { ...(item as Record<string, unknown>) };
      if (!provider.ariaKernelProvider && provider.openclawProvider) {
        provider.ariaKernelProvider = provider.openclawProvider;
      }
      return provider;
    });
    normalized.modelRouterRuntime = runtime;
  }

  const modelRoutingPolicy = normalized.modelRoutingPolicy as Record<string, unknown> | undefined;
  if (modelRoutingPolicy && typeof modelRoutingPolicy === "object") {
    const providers = Array.isArray(modelRoutingPolicy.providers) ? modelRoutingPolicy.providers : [];
    modelRoutingPolicy.providers = providers.map((item) => {
      if (!item || typeof item !== "object") return item;
      const provider = { ...(item as Record<string, unknown>) };
      if (!provider.ariaKernelProvider && provider.openclawProvider) {
        provider.ariaKernelProvider = provider.openclawProvider;
      }
      return provider;
    });
    normalized.modelRoutingPolicy = modelRoutingPolicy;
  }

  const runtimeConfig = normalized.runtime as Record<string, unknown> | undefined;
  if (runtimeConfig && typeof runtimeConfig === "object") {
    const versions = runtimeConfig.versions as Record<string, unknown> | undefined;
    if (versions && typeof versions === "object" && !versions.ariaKernelFusion && versions.openclawFusion) {
      versions.ariaKernelFusion = versions.openclawFusion;
    }
  }

  if (!normalized.ariaKernelFusionProfile && normalized.openclawFusionProfile) {
    normalized.ariaKernelFusionProfile = normalized.openclawFusionProfile;
  }
  if (!normalized.ariaKernelIncidentPlaybook && normalized.openclawIncidentPlaybook) {
    normalized.ariaKernelIncidentPlaybook = normalized.openclawIncidentPlaybook;
  }

  return normalized as T;
}

function normalizeCapabilityAssessmentResult<T extends {
  assessment?: {
    cores?: Array<{ id: string } & Record<string, unknown>>;
  };
}>(raw: T): T {
  if (!raw || typeof raw !== "object") {
    return raw;
  }
  if (!isLegacyCompatBridgeEnabled()) {
    return raw;
  }
  const normalized = { ...raw };
  const assessment = normalized.assessment;
  if (!assessment || typeof assessment !== "object") {
    return normalized;
  }
  const cores = Array.isArray(assessment.cores) ? assessment.cores : [];
  assessment.cores = cores.map((core) => {
    if (!core || typeof core !== "object") return core;
    if (core.id === "openclaw") {
      return {
        ...core,
        id: "ariaKernel"
      };
    }
    return core;
  });
  return normalized;
}

export function getCachedUserId() {
  return localStorage.getItem(USER_ID_KEY) || "";
}

export async function fetchDemoState() {
  const data = await request<{ state: DemoState }>("/v1/state");
  return data.state;
}

export async function fetchSceneConfigState() {
  const data = await request<{
    sceneConfig: DemoSceneConfigState;
    updatedAt: string;
  }>("/v1/scene/config");
  return data;
}

export async function fetchSystemConfig() {
  const data = await request<SystemConfigResult>("/v1/system/config");
  return normalizeSystemConfigResult(data);
}

export async function updateSystemConfig(payload: {
  persist?: boolean;
  operatorName?: string;
  operatorSource?: string;
  changeReason?: string;
  systemProfilePatch?: Record<string, unknown>;
  modelRoutingPatch?: Record<string, unknown>;
  ariaKernelFusionPatch?: Record<string, unknown>;
  superAutonomyPatch?: Record<string, unknown>;
  expansionSecurityPatch?: Record<string, unknown>;
  sceneOrchestrationPatch?: Record<string, unknown>;
  systemProfile?: Record<string, unknown>;
  modelRoutingPolicy?: Record<string, unknown>;
  ariaKernelFusionProfile?: Record<string, unknown>;
  superAutonomyProfile?: Record<string, unknown>;
  expansionSecurityPolicy?: Record<string, unknown>;
  sceneOrchestrationPolicy?: Record<string, unknown>;
}) {
  const data = await request<SystemConfigResult & {
    ok: boolean;
    changed: boolean;
    changedSections: string[];
    persisted: boolean;
    updatedAt: string;
  }>("/v1/system/config", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return normalizeSystemConfigResult(data);
}

export async function reloadSystemConfig() {
  const data = await request<SystemConfigResult & {
    ok: boolean;
    message: string;
  }>("/v1/system/config/reload", {
    method: "POST"
  });
  return normalizeSystemConfigResult(data);
}

export async function syncSystemConfigAriaKernel(payload?: {
  persist?: boolean;
  mode?: "merge" | "replace";
  includeLocal?: boolean;
  operatorName?: string;
  operatorSource?: string;
  note?: string;
}) {
  const data = await request<SystemConfigResult & {
    ok: boolean;
    reason: string;
    message: string;
    changed: boolean;
    changedSections: string[];
    persisted: boolean;
    mode: "merge" | "replace";
    includeLocal: boolean;
    syncedProviders: Array<{
      id: string;
      model: string;
      ariaKernelProvider: string;
      baseUrl: string;
      local: boolean;
    }>;
    updatedAt: string;
  }>("/v1/system/config/sync-aria-kernel", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return normalizeSystemConfigResult(data);
}

export async function fetchSystemConfigHistory(limit = 24) {
  const safeLimit = Math.max(1, Math.min(80, Math.floor(limit)));
  const data = await request<{
    history: SystemConfigOpsPreview;
    runtime: SystemConfigResult["runtime"];
    updatedAt: string;
  }>(`/v1/system/config/history?limit=${safeLimit}`);
  return data;
}

export async function rollbackSystemConfig(payload?: {
  mode?: "previous_stable" | "snapshot";
  snapshotId?: string;
  persist?: boolean;
  operatorName?: string;
  operatorSource?: string;
  note?: string;
}) {
  const data = await request<SystemConfigResult & {
    ok: boolean;
    changed: boolean;
    changedSections: string[];
    persisted: boolean;
    targetSnapshotId?: string;
    reason?: string;
    message?: string;
    configOps?: SystemConfigOpsPreview;
    updatedAt: string;
  }>("/v1/system/config/rollback", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return normalizeSystemConfigResult(data);
}

export async function fetchCodingPatchGate() {
  const data = await request<{
    gate: CodingPatchGateState;
    updatedAt: string;
  }>("/v1/code/patch/gate");
  return data;
}

export async function previewCodePatch(payload: {
  objective: string;
  cwd?: string;
  verifyCommands?: string[];
  operatorName?: string;
  operatorSource?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    message?: string;
    draft: CodingPatchDraft;
    gate: CodingPatchGateState;
    updatedAt: string;
  }>("/v1/code/patch/preview", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function applyCodePatchDraft(payload: {
  draftId: string;
  verifyCommands?: string[];
  operatorName?: string;
  operatorSource?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    message?: string;
    draft: CodingPatchDraft;
    receipt: CodingPatchReceipt;
    gate: CodingPatchGateState;
    updatedAt: string;
  }>("/v1/code/patch/apply", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function rollbackCodePatch(payload?: {
  receiptId?: string;
  verifyCommands?: string[];
  operatorName?: string;
  operatorSource?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    message?: string;
    receipt: CodingPatchReceipt;
    verify: {
      ok: boolean;
      bridgeOk: boolean;
      reason: string;
      summary: string;
      commands: string[];
    };
    restoredFiles: string[];
    gate: CodingPatchGateState;
    updatedAt: string;
  }>("/v1/code/patch/rollback", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchUnifiedTimeline(payload?: {
  flowId?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (payload?.flowId?.trim()) {
    params.set("flowId", payload.flowId.trim());
  }
  if (typeof payload?.limit === "number") {
    params.set("limit", String(payload.limit));
  }
  const query = params.toString();
  const data = await request<{
    timeline: UnifiedTimelineResult;
    updatedAt: string;
  }>(`/v1/timeline/unified${query ? `?${query}` : ""}`);
  return data;
}

export async function replayUnifiedTimeline(flowId: string, limit = 240) {
  const data = await request<{
    replay: UnifiedTimelineReplayResult;
    updatedAt: string;
  }>("/v1/timeline/replay", {
    method: "POST",
    body: JSON.stringify({
      flowId,
      limit
    })
  });
  return data;
}

export async function fetchTimelineDiagnosis(flowId: string, limit = 300) {
  const safeFlowId = String(flowId || "").trim();
  if (!safeFlowId) {
    throw new Error("flowId is required");
  }
  const safeLimit = Math.max(1, Math.min(600, Math.floor(limit)));
  const params = new URLSearchParams({
    flowId: safeFlowId,
    limit: String(safeLimit)
  });
  const data = await request<{
    diagnosis: TimelineFlowDiagnosis;
    updatedAt: string;
  }>(`/v1/timeline/diagnose?${params.toString()}`);
  return data;
}

export async function replayRepairTimelineFlow(payload: {
  flowId: string;
  mode?: "auto" | "queue_replay" | "rerun_dispatch" | "policy_adjust_then_replay" | "grant_permission_then_replay";
  processQueue?: boolean;
  queueLimit?: number;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    mode: string;
    flowId: string;
    targetFlowId: string;
    retriedDeadLetterCount: number;
    grantedCapabilities: string[];
    queueProcessResult: {
      changed: boolean;
      processed: number;
      succeeded: number;
      retried: number;
      deadLettered: number;
    };
    rerunDispatch?: {
      id: string;
      flowId: string;
      status: string;
      prompt: string;
    } | null;
    beforeDiagnosis: TimelineFlowDiagnosis;
    diagnosis: TimelineFlowDiagnosis;
    autonomy?: DemoAutonomyState;
    updatedAt: string;
  }>("/v1/timeline/replay-repair", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function fetchGoalContractSchema(payload?: {
  text?: string;
  scene?: SceneConfigScene;
  priority?: "high" | "medium" | "low";
}) {
  const params = new URLSearchParams();
  if (payload?.text?.trim()) {
    params.set("text", payload.text.trim());
  }
  if (payload?.scene?.trim()) {
    params.set("scene", payload.scene.trim());
  }
  if (payload?.priority?.trim()) {
    params.set("priority", payload.priority.trim());
  }
  const query = params.toString();
  const data = await request<AgiGoalContractSchemaResult>(
    `/v1/agi/goal-contract/schema${query ? `?${query}` : ""}`
  );
  return data;
}

export async function compileGoalContract(payload: {
  text?: string;
  input?: string;
  scene?: SceneConfigScene;
  priority?: "high" | "medium" | "low";
  plan?: Array<Record<string, unknown>>;
  goalContract?: Partial<AgiGoalContract>;
}) {
  const data = await request<AgiGoalContractCompileResult>("/v1/agi/goal-contract/compile", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchAgiFramework(payload?: {
  text?: string;
  scene?: SceneConfigScene;
  priority?: "high" | "medium" | "low";
}) {
  const params = new URLSearchParams();
  if (payload?.text?.trim()) {
    params.set("text", payload.text.trim());
  }
  if (payload?.scene?.trim()) {
    params.set("scene", payload.scene.trim());
  }
  if (payload?.priority?.trim()) {
    params.set("priority", payload.priority.trim());
  }
  const query = params.toString();
  const data = await request<AgiFrameworkResult>(`/v1/agi/framework${query ? `?${query}` : ""}`);
  return data;
}

export async function runAgiExecute(payload: {
  text?: string;
  input?: string;
  scene?: SceneConfigScene;
  priority?: "high" | "medium" | "low";
  execute?: boolean;
  source?: string;
  enqueueFailures?: boolean;
  autoRepair?: boolean;
  autoRepairMode?: "auto" | "queue_replay" | "rerun_dispatch" | "policy_adjust_then_replay" | "grant_permission_then_replay";
  autoRepairProcessQueue?: boolean;
  autoRepairQueueLimit?: number;
  diagnosisLimit?: number;
  plan?: Array<Record<string, unknown>>;
  goalContract?: Partial<AgiGoalContract>;
}) {
  const data = await request<AgiExecuteResult>("/v1/agi/execute", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function applySceneConfig(payload: {
  scene: SceneConfigScene;
  moduleId: string;
  title: string;
  goal?: string;
  configText?: string;
  prompt?: string;
  funGameConfig?: {
    difficulty?: "easy" | "normal" | "hard";
    rounds?: number;
    scoreEnabled?: boolean;
    rewardEnabled?: boolean;
    reviveEnabled?: boolean;
  };
  templateId?: string;
  templateName?: string;
  soulProfile?: {
    directive?: string;
    uploadedFiles?: Array<{
      id?: string;
      name?: string;
      type?: string;
      size?: number;
      uploadedAt?: string;
      excerpt?: string;
    }>;
  };
  execute?: boolean;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    module: DemoSceneConfigModule;
    execution: DemoSceneConfigModule["lastResult"];
    generatedPrompt: string;
    sceneConfig: DemoSceneConfigState;
    autonomy?: DemoAutonomyState;
    proactive?: DemoProactiveState;
    workday?: DemoWorkdayState;
    workbench?: DemoWorkbenchState;
    deviceOps?: DemoDeviceOpsState;
    expansion?: DemoExpansionState;
    funGames?: DemoFunGame[];
    updatedAt: string;
  }>("/v1/scene/config/apply", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchFunGames(limit = 40) {
  const params = new URLSearchParams();
  params.set("limit", String(Math.max(1, Math.min(80, limit))));
  const data = await request<{
    games: DemoFunGame[];
    total: number;
    updatedAt: string;
  }>(`/v1/fun/games?${params.toString()}`);
  return data;
}

export async function createFunGame(payload: {
  mode: "mini_game" | "handmade_game";
  title?: string;
  prompt?: string;
  templateId?: string;
  templateName?: string;
  funGameConfig?: {
    difficulty?: "easy" | "normal" | "hard";
    rounds?: number;
    scoreEnabled?: boolean;
    rewardEnabled?: boolean;
    reviveEnabled?: boolean;
  };
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    game: DemoFunGame;
    skillBootstrap?: DemoFunSkillBootstrap;
    games: DemoFunGame[];
    templates: DemoFunRuleTemplate[];
    updatedAt: string;
  }>("/v1/fun/games/create", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchEngagementState() {
  const data = await request<{
    engagement: DemoEngagement;
    proactive?: DemoProactiveState;
    autonomy?: DemoAutonomyState;
    workday?: DemoWorkdayState;
    deviceOps?: DemoDeviceOpsState;
  }>(
    "/v1/engagement/state"
  );
  return data;
}

export async function fetchAutonomyStatus() {
  const data = await request<AutonomyStatusResult>("/v1/autonomy/status");
  return data;
}

export async function fetchRuntimeHealth() {
  const data = await request<RuntimeHealthResult>("/v1/runtime/health");
  return data;
}

export async function triggerRuntimeGuardianHeal(payload?: {
  force?: boolean;
  queueLimit?: number;
  action?: "full_heal" | "queue_replay" | "schema_repair";
}) {
  const data = await request<RuntimeGuardianHealResult>("/v1/runtime/guardian/heal", {
    method: "POST",
    body: JSON.stringify({
      force: payload?.force ?? true,
      queueLimit: payload?.queueLimit,
      action: payload?.action || "full_heal"
    })
  });
  return data;
}

export async function updateRuntimeGuardianConfig(payload: {
  enabled?: boolean;
  mode?: "eco" | "balanced" | "peak";
  queueLimit?: number;
}) {
  const data = await request<RuntimeGuardianConfigResult>("/v1/runtime/guardian/config", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchAutonomyQueue() {
  const data = await request<{
    queue: DemoAutonomyQueueState;
    pending: number;
    deadLetters: number;
    updatedAt: string;
  }>("/v1/autonomy/queue");
  return data;
}

export async function fetchCapabilityAssessment() {
  const data = await request<{
    assessment: CapabilityAssessmentResult;
    updatedAt: string;
  }>("/v1/capability/assessment");
  return normalizeCapabilityAssessmentResult(data);
}

export async function fetchSuperAutonomyCapability() {
  const data = await request<{
    profile: Record<string, unknown>;
    runtime: CapabilitySuperAutonomyRuntime;
    updatedAt: string;
  }>("/v1/capability/super-autonomy");
  return data;
}

export async function fetchAriaKernelGatewayStatus() {
  const data = await request<{
    gateway: Record<string, unknown>;
    updatedAt: string;
  }>("/v1/aria-kernel/gateway/status");
  return data;
}

export async function fetchAriaKernelIncidentPlaybook() {
  const data = await request<AriaKernelIncidentPlaybookResult>("/v1/aria-kernel/incidents/playbook");
  return data;
}

export async function fetchAriaKernelFlywheelStatus(payload?: {
  taskType?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  const taskType = String(payload?.taskType || "").trim();
  if (taskType) {
    params.set("taskType", taskType);
  }
  if (payload?.limit !== undefined) {
    params.set("limit", String(Math.max(1, Math.min(120, Math.floor(Number(payload.limit) || 40)))));
  }
  const query = params.toString();
  const data = await request<{
    userId: string;
    flywheel: AriaKernelFlywheelState;
    updatedAt: string;
  }>(`/v1/aria-kernel/flywheel/status${query ? `?${query}` : ""}`);
  return data;
}

export async function replayAriaKernelFlywheel(payload?: {
  taskType?: string;
  limit?: number;
}) {
  const data = await request<{
    userId: string;
    ok: boolean;
    reason: string;
    replayed: number;
    taskType: string;
    flywheel: AriaKernelFlywheelState;
    updatedAt: string;
  }>("/v1/aria-kernel/flywheel/replay", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function rememberAriaKernelIncidentGuardrail(payload?: {
  incidentId?: string;
  issueMessage?: string;
}) {
  const data = await request<{
    ok: boolean;
    remembered: number;
    incidentIds: string[];
    memoryHighlights: string[];
    autonomy: DemoAutonomyState;
    updatedAt: string;
  }>("/v1/aria-kernel/incidents/remember", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchAutonomyInbox() {
  const data = await request<{ items: DemoAutonomyInboxItem[]; total: number }>("/v1/autonomy/inbox");
  return data;
}

export async function ackAutonomyInboxItem(id: string) {
  const data = await request<{ acked: DemoAutonomyInboxItem }>("/v1/autonomy/inbox/ack", {
    method: "POST",
    body: JSON.stringify({ id })
  });
  return data.acked;
}

export async function manualAutonomyRepair() {
  const data = await request<{ repaired: boolean; autonomy: DemoAutonomyState }>("/v1/autonomy/repair", {
    method: "POST"
  });
  return data;
}

export async function runAutonomyTick() {
  const data = await request<{
    changed: boolean;
    queueResult?: AutonomyQueueProcessResult;
    autonomy: DemoAutonomyState;
  }>("/v1/autonomy/tick", {
    method: "POST"
  });
  return data;
}

export async function processAutonomyQueueNow(limit?: number) {
  const payload = typeof limit === "number" ? { limit } : {};
  const data = await request<{
    result: AutonomyQueueProcessResult;
    queue: DemoAutonomyQueueState;
    updatedAt: string;
  }>("/v1/autonomy/queue/process", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function updateAutonomyQueuePolicy(payload: {
  enabled?: boolean;
  autoProcessOnTick?: boolean;
  processLimit?: number;
  strategies?: Record<string, Partial<DemoAutonomyQueueStrategy>>;
}) {
  const data = await request<{
    ok: boolean;
    policy: DemoAutonomyQueuePolicy;
    queue: DemoAutonomyQueueState;
    updatedAt: string;
  }>("/v1/autonomy/queue/policy", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function retryAutonomyDeadLetterItem(id: string, options?: {
  process?: boolean;
  limit?: number;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    item: DemoAutonomyQueueItem;
    processResult: AutonomyQueueProcessResult;
    queue: DemoAutonomyQueueState;
    updatedAt: string;
  }>("/v1/autonomy/queue/dead-letter/retry", {
    method: "POST",
    body: JSON.stringify({
      id,
      process: options?.process === true,
      limit: options?.limit
    })
  });
  return data;
}

export async function runAutonomyDispatch(input: {
  text: string;
  execute?: boolean;
  source?: string;
}) {
  const data = await request<{
    ok: boolean;
    dispatch: {
      id: string;
      flowId?: string;
      kernel: string;
      status: string;
      steps: Array<{
        id: string;
        index: number;
        type: string;
        title: string;
        status: string;
        reason: string;
      }>;
    };
    autonomy: DemoAutonomyState;
    updatedAt: string;
  }>("/v1/autonomy/dispatch", {
    method: "POST",
    body: JSON.stringify({
      text: input.text,
      execute: input.execute !== false,
      source: input.source || "desktop"
    })
  });
  return data;
}

export async function reportEngagementEvent(type: EngagementEventType, metadata?: Record<string, unknown>) {
  const data = await request<{ engagement: DemoEngagement }>("/v1/engagement/event", {
    method: "POST",
    body: JSON.stringify({
      type,
      source: "desktop",
      metadata: metadata || {}
    })
  });
  return data.engagement;
}

export async function updateDemoPreferences(preferences: Partial<DemoPreferences>) {
  const data = await request<{ preferences: DemoPreferences; updatedAt: string }>("/v1/preferences", {
    method: "POST",
    body: JSON.stringify(preferences)
  });
  return data;
}

export async function sendDemoMessage(text: string) {
  const data = await request<{ state: DemoState }>("/v1/message", {
    method: "POST",
    body: JSON.stringify({
      text
    })
  });
  return data.state;
}

export async function withdrawLastMessage(options?: {
  scene?: SceneConfigScene;
  removeAssistantReply?: boolean;
}) {
  const data = await request<WithdrawLastMessageResult>("/v1/message/withdraw-last", {
    method: "POST",
    body: JSON.stringify({
      scene: options?.scene,
      removeAssistantReply: options?.removeAssistantReply
    })
  });
  return data;
}

export async function searchDemoMemory(
  query: string,
  limit = 6,
  options?: {
    scene?: string;
    crossScene?: boolean;
  }
) {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  params.set("limit", String(limit));
  if (options?.scene) {
    params.set("scene", String(options.scene));
  }
  if (options?.crossScene === false) {
    params.set("crossScene", "false");
  }
  const data = await request<{ items: MemorySearchItem[]; query: string }>(
    `/v1/memory/search?${params.toString()}`
  );
  return data;
}

export type MemoryArchitectureUpdatePayload = {
  mode?: "three_plus_one" | "classic";
  shortTerm?: Partial<MemoryArchitectureTierConfig>;
  midTerm?: Partial<MemoryArchitectureTierConfig>;
  longTerm?: Partial<MemoryArchitectureTierConfig>;
  temporary?: Partial<MemoryArchitectureTierConfig>;
  realtimeReasoning?: Partial<MemoryArchitectureConfig["realtimeReasoning"]>;
};

export async function fetchMemoryArchitectureConfig() {
  const data = await request<{
    architecture: MemoryArchitectureConfig;
    summary: MemoryArchitectureSummary;
    updatedAt: string;
  }>("/v1/memory/architecture");
  return data;
}

export async function updateMemoryArchitectureConfig(payload: MemoryArchitectureUpdatePayload) {
  const data = await request<{
    architecture: MemoryArchitectureConfig;
    runtime?: SystemConfigResult["memoryPlaneRuntime"];
    updatedAt: string;
  }>("/v1/memory/architecture", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchMemoryBackendSelfCheck() {
  const data = await request<{ check: MemoryBackendSelfCheckResult }>(
    "/v1/memory/backend/check"
  );
  return data.check;
}

export async function createDemoMemory(
  content: string,
  options?: {
    scene?: string;
    tier?: "long_term" | "mid_term" | "short_term" | "temporary";
    source?: string;
    tags?: string[];
    importance?: number;
    confidence?: number;
  }
) {
  const data = await request<{ item: DemoMemoryItem; memoryHighlights: string[] }>(
    "/v1/memory",
    {
      method: "POST",
      body: JSON.stringify({
        content,
        scene: options?.scene,
        tier: options?.tier,
        source: options?.source,
        tags: options?.tags,
        importance: options?.importance,
        confidence: options?.confidence
      })
    }
  );
  return data;
}

export async function removeDemoMemory(memoryId: string) {
  const data = await request<{ removed: { id: string; content: string }; memoryHighlights: string[] }>(
    `/v1/memory/${encodeURIComponent(memoryId)}`,
    {
      method: "DELETE"
    }
  );
  return data;
}

export async function fetchNextProactive(scene = "desktop-home") {
  const data = await request<ProactiveNextResult>("/v1/proactive/next", {
    method: "POST",
    body: JSON.stringify({
      scene,
      localHour: new Date().getHours()
    })
  });
  return data;
}

export async function reportProactiveFeedback(
  feedback: "executed" | "ignored" | "dismissed",
  suggestionId = ""
) {
  const data = await request<{
    applied: boolean;
    reason: string;
    autonomy: DemoAutonomyState;
    proactive: DemoProactiveState;
    updatedAt: string;
  }>("/v1/proactive/feedback", {
    method: "POST",
    body: JSON.stringify({
      feedback,
      suggestionId
    })
  });
  return data;
}

export async function fetchWorkdayState() {
  const data = await request<{
    workday: DemoWorkdayState;
    nextQuest: WorkdayQuest | null;
    summary: string;
  }>("/v1/workday/state");
  return data;
}

export async function checkinWorkday(payload: {
  energy: number;
  pressure: number;
  focusIntent?: string;
}) {
  const data = await request<{
    workday: DemoWorkdayState;
    guidance: string;
    energy: number;
    pressure: number;
  }>("/v1/workday/checkin", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function completeWorkdayQuest(questId: string, note = "") {
  const data = await request<{
    ok: boolean;
    reason: string;
    xpGain: number;
    workday: DemoWorkdayState;
    engagement?: DemoEngagement;
  }>("/v1/workday/quest/complete", {
    method: "POST",
    body: JSON.stringify({
      questId,
      note
    })
  });
  return data;
}

export async function fetchWorkbenchState() {
  const data = await request<{
    workbench: DemoWorkbenchState;
    updatedAt: string;
  }>("/v1/workbench/state");
  return data;
}

export async function submitWorkbenchIntent(text: string, tags: string[] = []) {
  const data = await request<{
    ok: boolean;
    reason: string;
    tags: string[];
    plan: string[];
    feedItem: WorkbenchFeedItem;
    dispatch?: {
      id: string;
      status: string;
      steps: Array<{
        id: string;
        status: string;
      }>;
    } | null;
    autonomy?: DemoAutonomyState;
    deviceOps?: DemoDeviceOpsState;
    expansion?: DemoExpansionState;
    workbench: DemoWorkbenchState;
    workday: DemoWorkdayState;
    updatedAt: string;
  }>("/v1/workbench/intent", {
    method: "POST",
    body: JSON.stringify({
      text,
      tags
    })
  });
  return data;
}

export async function runWorkbenchTool(
  toolId: string,
  payload: Record<string, unknown> = {}
) {
  const data = await request<{
    ok: boolean;
    reason: string;
    task: DeviceTask | null;
    feedItem: WorkbenchFeedItem;
    workbench: DemoWorkbenchState;
    deviceOps: DemoDeviceOpsState;
    updatedAt: string;
  }>("/v1/workbench/tool/run", {
    method: "POST",
    body: JSON.stringify({
      toolId,
      payload
    })
  });
  return data;
}

export async function selectWorkbenchModel(modelId: string) {
  const data = await request<{
    ok: boolean;
    reason: string;
    selectedModel: {
      id: string;
      label: string;
      provider: string;
    };
    workbench: DemoWorkbenchState;
    updatedAt: string;
  }>("/v1/workbench/model/select", {
    method: "POST",
    body: JSON.stringify({
      modelId
    })
  });
  return data;
}

export async function updateCodingWorkspace(payload: {
  cwd: string;
  openInFinder?: boolean;
  createIfMissing?: boolean;
  operatorName?: string;
  operatorSource?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    workspace: CodingWorkspaceState;
    openResult?: {
      ok: boolean;
      reason: string;
      summary: string;
    } | null;
    workbench: DemoWorkbenchState;
    updatedAt: string;
  }>("/v1/workbench/coding/workspace", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function pickCodingWorkspaceDirectory(payload?: {
  prompt?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    path: string;
    absolutePath: string;
    message: string;
  }>("/v1/workbench/coding/workspace/pick", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function fetchCodingProjectTree(payload?: {
  cwd?: string;
  maxDepth?: number;
  maxNodes?: number;
}) {
  const params = new URLSearchParams();
  const cwd = String(payload?.cwd || "").trim();
  if (cwd) {
    params.set("cwd", cwd);
  }
  if (typeof payload?.maxDepth === "number") {
    params.set("maxDepth", String(payload.maxDepth));
  }
  if (typeof payload?.maxNodes === "number") {
    params.set("maxNodes", String(payload.maxNodes));
  }
  const query = params.toString();
  const data = await request<{
    ok: boolean;
    reason: string;
    tree: CodingProjectTreeState;
    updatedAt: string;
  }>(`/v1/workbench/coding/tree${query ? `?${query}` : ""}`);
  return data;
}

export async function fetchCodingFilePreview(payload: {
  path: string;
  cwd?: string;
  maxChars?: number;
}) {
  const params = new URLSearchParams();
  params.set("path", String(payload.path || ""));
  const cwd = String(payload.cwd || "").trim();
  if (cwd) {
    params.set("cwd", cwd);
  }
  if (typeof payload.maxChars === "number") {
    params.set("maxChars", String(payload.maxChars));
  }
  const query = params.toString();
  const data = await request<{
    ok: boolean;
    reason: string;
    file: CodingFilePreviewState;
    updatedAt: string;
  }>(`/v1/workbench/coding/file?${query}`);
  return data;
}

export async function fetchExpansionState() {
  const data = await request<{
    expansion: DemoExpansionState;
    updatedAt: string;
  }>("/v1/expansion/state");
  return data;
}

export async function installExpansionPack(payload: {
  packId?: string;
  name?: string;
  version?: string;
  source?: string;
  capabilities?: string[];
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    pack: ExpansionPack;
    expansion: DemoExpansionState;
    updatedAt: string;
  }>("/v1/expansion/packs/install", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
  return data;
}

export async function runAutonomyFetchDownload(payload: {
  targetUrl: string;
  saveAs?: string;
  reason?: string;
}) {
  const data = await request<{
    ok: boolean;
    reason: string;
    job: ExpansionJob | null;
    download?: {
      ok: boolean;
      reason: string;
      summary?: string;
      savedPath?: string;
      relativePath?: string;
      bytes?: number;
      sha256?: string;
      contentType?: string;
      error?: string;
    } | null;
    expansion: DemoExpansionState;
    updatedAt: string;
  }>("/v1/expansion/fetch-download", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function fetchDeviceCapabilities() {
  const data = await request<{ deviceOps: DemoDeviceOpsState }>("/v1/device/capabilities");
  return data;
}

export async function updateDevicePermission(
  capabilityId: string,
  status: "granted" | "blocked" | "prompt",
  reason = ""
) {
  const data = await request<{ ok: boolean; reason: string; deviceOps: DemoDeviceOpsState }>(
    "/v1/device/permissions",
    {
      method: "POST",
      body: JSON.stringify({
        capabilityId,
        status,
        reason
      })
    }
  );
  return data;
}

export async function fetchDeviceTasks(status = "", limit = 20) {
  const params = new URLSearchParams();
  if (status.trim()) {
    params.set("status", status.trim());
  }
  params.set("limit", String(limit));
  const data = await request<{ tasks: DeviceTask[]; total: number }>(
    `/v1/device/tasks?${params.toString()}`
  );
  return data;
}

export async function planDeviceTask(
  taskType:
    | "desktop_focus_cleanup"
    | "desktop_mail_inbox_zero"
    | "mobile_album_cleanup"
    | "mobile_sms_digest"
    | "mobile_email_digest"
    | "desktop_voice_briefing"
    | "desktop_hardware_check"
    | "mobile_voice_checkin"
    | "mobile_hardware_check",
  payload: Record<string, unknown> = {}
) {
  const data = await request<{
    ok: boolean;
    reason: string;
    task: DeviceTask | null;
    deviceOps: DemoDeviceOpsState;
  }>("/v1/device/tasks/plan", {
    method: "POST",
    body: JSON.stringify({
      taskType,
      payload
    })
  });
  return data;
}

export async function executeDeviceTask(taskId: string) {
  const data = await request<{
    ok: boolean;
    reason: string;
    task: DeviceTask | null;
    deviceOps: DemoDeviceOpsState;
  }>("/v1/device/tasks/execute", {
    method: "POST",
    body: JSON.stringify({
      taskId
    })
  });
  return data;
}

export async function fetchDeviceAudit(limit = 40) {
  const data = await request<{ audit: DeviceAuditItem[]; total: number }>(
    `/v1/device/audit?limit=${limit}`
  );
  return data;
}

export async function fetchHardwareStatus() {
  const data = await request<HardwareStatusResult>("/v1/hardware/status");
  return data;
}

export type VoiceChannelSnapshot = {
  active: boolean;
  owner: string;
  token?: string;
  tokenPreview?: string;
  acquiredAt: string;
  leaseMs: number;
  expiresAt: string;
  expiresInMs: number;
  lastReason: string;
  lastUpdatedAt: string;
  openclaw?: {
    mutexEnabled?: boolean;
    holdApplied?: boolean;
    previousTriggers?: string[];
    lastError?: string;
    lastSyncedAt?: string;
  };
};

type VoiceChannelControlResponse = {
  ok: boolean;
  reason: string;
  summary?: string;
  warning?: string;
  channel: VoiceChannelSnapshot | null;
  bridge: DemoDeviceOpsState["bridge"];
  error: string;
};

export type VoicePresetOption = {
  id: string;
  label: string;
  voice: string;
  rate: number;
  description?: string;
};

export type VoiceProfileState = {
  defaultVoice: string;
  defaultRate: number;
  allowMicCapture: boolean;
  activePresetId: string;
  presets: VoicePresetOption[];
};

type VoiceProfileResponse = {
  ok: boolean;
  reason: string;
  summary?: string;
  profile: VoiceProfileState | null;
  bridge: DemoDeviceOpsState["bridge"];
  error: string;
};

export async function runVoiceTts(text: string, options?: { voice?: string; rate?: number; dryRun?: boolean }) {
  const data = await request<{
    ok: boolean;
    reason: string;
    result: {
      summary?: string;
      metrics?: Record<string, number>;
    } | null;
    bridge: DemoDeviceOpsState["bridge"];
    error: string;
  }>("/v1/voice/tts", {
    method: "POST",
    body: JSON.stringify({
      text,
      voice: options?.voice,
      rate: options?.rate,
      dryRun: options?.dryRun ?? true
    })
  });
  return data;
}

export async function fetchVoiceChannelStatus() {
  const data = await request<VoiceChannelControlResponse>("/v1/voice/channel/status");
  return data;
}

export async function acquireVoiceChannel(
  owner: string,
  options?: { leaseMs?: number; client?: string }
) {
  const data = await request<VoiceChannelControlResponse>("/v1/voice/channel/acquire", {
    method: "POST",
    body: JSON.stringify({
      owner,
      leaseMs: options?.leaseMs,
      client: options?.client
    })
  });
  return data;
}

export async function renewVoiceChannel(token: string, options?: { leaseMs?: number }) {
  const data = await request<VoiceChannelControlResponse>("/v1/voice/channel/renew", {
    method: "POST",
    body: JSON.stringify({
      token,
      leaseMs: options?.leaseMs
    })
  });
  return data;
}

export async function releaseVoiceChannel(token: string) {
  const data = await request<VoiceChannelControlResponse>("/v1/voice/channel/release", {
    method: "POST",
    body: JSON.stringify({
      token
    })
  });
  return data;
}

export async function fetchVoiceProfile() {
  const data = await request<VoiceProfileResponse>("/v1/voice/profile");
  return data;
}

export async function updateVoiceProfile(input: {
  presetId?: string;
  voice?: string;
  rate?: number;
  allowMicCapture?: boolean;
}) {
  const data = await request<VoiceProfileResponse>("/v1/voice/profile", {
    method: "POST",
    body: JSON.stringify({
      presetId: input.presetId,
      voice: input.voice,
      rate: input.rate,
      allowMicCapture: input.allowMicCapture
    })
  });
  return data;
}

async function sendDemoMessageStreamOnce(
  text: string,
  handlers: StreamHandlers = {},
  options: StreamSendOptions = {}
) {
  const payload: {
    text: string;
    preferredProviderId?: string;
    taskType?: string;
    scene?: string;
  } = { text };
  const preferredProviderId = String(options.preferredProviderId || "").trim();
  const taskType = String(options.taskType || "").trim();
  const scene = String(options.scene || "").trim();
  if (preferredProviderId) {
    payload.preferredProviderId = preferredProviderId;
  }
  if (taskType) {
    payload.taskType = taskType;
  }
  if (scene) {
    payload.scene = scene;
  }
  const controller = new AbortController();
  let timeoutKind = "";
  let connectTimer: number | null = window.setTimeout(() => {
    timeoutKind = "connect";
    controller.abort();
  }, STREAM_CONNECT_TIMEOUT_MS);
  let idleTimer: number | null = null;
  let totalTimer: number | null = null;
  const clearTimer = (timer: number | null) => {
    if (typeof timer === "number") {
      window.clearTimeout(timer);
    }
  };
  const clearAllTimers = () => {
    clearTimer(connectTimer);
    clearTimer(idleTimer);
    clearTimer(totalTimer);
    connectTimer = null;
    idleTimer = null;
    totalTimer = null;
  };
  const resetIdleTimer = () => {
    clearTimer(idleTimer);
    idleTimer = window.setTimeout(() => {
      timeoutKind = "idle";
      controller.abort();
    }, STREAM_IDLE_TIMEOUT_MS);
  };
  try {
    const response = await requestRaw("/v1/message/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimer(connectTimer);
    connectTimer = null;
    totalTimer = window.setTimeout(() => {
      timeoutKind = "total";
      controller.abort();
    }, STREAM_TOTAL_TIMEOUT_MS);

    if (!response.body) {
      throw new Error("Stream response body is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let donePayload: StreamDonePayload | null = null;
    resetIdleTimer();

    while (true) {
      let readResult: ReadableStreamReadResult<Uint8Array>;
      try {
        readResult = await reader.read();
      } catch (readError) {
        if (controller.signal.aborted && timeoutKind) {
          break;
        }
        throw readError;
      }
      const { done, value } = readResult;
      if (value && value.length > 0) {
        resetIdleTimer();
      }
      buffer += decoder.decode(value || new Uint8Array(), {
        stream: !done
      });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (!block.trim()) {
          continue;
        }
        const parsed = parseSseBlock(block);
        if (!parsed.data) {
          continue;
        }

        const payload = JSON.parse(parsed.data) as unknown;
        if (parsed.event === "meta") {
          handlers.onMeta?.(payload as StreamMetaPayload);
          continue;
        }
        if (parsed.event === "chunk") {
          handlers.onChunk?.(payload as StreamChunkPayload);
          continue;
        }
        if (parsed.event === "done") {
          donePayload = payload as StreamDonePayload;
          handlers.onDone?.(donePayload);
          continue;
        }
        if (parsed.event === "error") {
          const streamError = payload as { message?: string };
          throw new Error(streamError.message || "Stream returned an error event.");
        }
      }

      if (done) {
        break;
      }
    }

    if (controller.signal.aborted && timeoutKind === "connect") {
      throw new Error(`Stream connect timeout after ${STREAM_CONNECT_TIMEOUT_MS}ms.`);
    }
    if (controller.signal.aborted && timeoutKind === "idle") {
      throw new Error(`Stream idle timeout after ${STREAM_IDLE_TIMEOUT_MS}ms.`);
    }
    if (controller.signal.aborted && timeoutKind === "total") {
      throw new Error(`Stream total timeout after ${STREAM_TOTAL_TIMEOUT_MS}ms.`);
    }

    if (!donePayload) {
      throw new Error("Stream closed without a done event.");
    }

    return donePayload;
  } catch (error) {
    if (controller.signal.aborted && timeoutKind === "connect") {
      throw new Error(`Stream connect timeout after ${STREAM_CONNECT_TIMEOUT_MS}ms.`);
    }
    if (controller.signal.aborted && timeoutKind === "idle") {
      throw new Error(`Stream idle timeout after ${STREAM_IDLE_TIMEOUT_MS}ms.`);
    }
    if (controller.signal.aborted && timeoutKind === "total") {
      throw new Error(`Stream total timeout after ${STREAM_TOTAL_TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    clearAllTimers();
  }
}

export async function sendDemoMessageStream(
  text: string,
  handlers: StreamHandlers = {},
  options: StreamSendOptions = {}
) {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= STREAM_RETRY_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await sendDemoMessageStreamOnce(text, handlers, options);
    } catch (error) {
      lastError = error;
      if (attempt >= STREAM_RETRY_MAX_ATTEMPTS || !shouldRetryStreamError(error)) {
        throw error;
      }
      await sleep(STREAM_RETRY_BASE_MS * attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("流式消息发送失败");
}

export async function fetchXhsPipelineStatus(jobId = "") {
  const query = String(jobId || "").trim();
  const suffix = query ? `?jobId=${encodeURIComponent(query)}` : "";
  const data = await request<XhsPipelineStatusResult>(`/v1/xhs/pipeline/status${suffix}`);
  return data;
}

export async function startXhsPipeline(input: XhsPipelineStartInput) {
  const payload = {
    theme: input.theme,
    assetsDir: input.assetsDir,
    outputRoot: input.outputRoot,
    publish: input.publish === true,
    headless: input.headless === true,
    skipUpload: input.skipUpload === true,
    model: input.model,
    maxAssets: input.maxAssets,
    clipDurationImageSec: input.clipDurationImageSec,
    clipDurationVideoSec: input.clipDurationVideoSec
  };
  const data = await request<{
    ok: boolean;
    userId: string;
    job: XhsPipelineJob;
    workflow: string[];
    nextStepHint: string;
  }>("/v1/xhs/pipeline/start", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data;
}

export async function cancelXhsPipeline(jobId: string) {
  const data = await request<{
    ok: boolean;
    reason: string;
    job: XhsPipelineJob;
  }>("/v1/xhs/pipeline/cancel", {
    method: "POST",
    body: JSON.stringify({
      jobId: String(jobId || "").trim()
    })
  });
  return data;
}

export async function resetDemoState() {
  const data = await request<{ state: DemoState }>("/v1/reset", {
    method: "POST"
  });
  return data.state;
}

export async function forceRefreshAuth() {
  localStorage.removeItem(TOKEN_KEY);
  return refreshGuestAuth();
}
