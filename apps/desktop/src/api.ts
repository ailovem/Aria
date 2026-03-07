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
    memorySummary?: {
      longTerm?: number;
      shortTerm?: number;
      temporary?: number;
      vectorIndex?: number;
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
  return (await response.json()) as T;
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

  if (!response.ok) {
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
    tier?: "long_term" | "short_term" | "temporary";
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
