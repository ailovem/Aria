import "dart:convert";
import "dart:io";

import "package:http/http.dart" as http;

class DemoMessage {
  const DemoMessage({
    required this.id,
    required this.role,
    required this.text,
    required this.time,
    this.scene = "",
  });

  final String id;
  final String role;
  final String text;
  final String time;
  final String scene;

  factory DemoMessage.fromJson(Map<String, dynamic> json) {
    return DemoMessage(
      id: json["id"]?.toString() ?? "",
      role: json["role"]?.toString() ?? "aria",
      text: json["text"]?.toString() ?? "",
      time: json["time"]?.toString() ?? "",
      scene: json["scene"]?.toString() ?? "",
    );
  }
}

class DemoPreferences {
  const DemoPreferences({required this.mode, required this.online});

  final String mode;
  final bool online;

  factory DemoPreferences.fromJson(Map<String, dynamic> json) {
    return DemoPreferences(
      mode: json["mode"]?.toString() ?? "陪伴",
      online: json["online"] == true,
    );
  }
}

class DemoTodayEngagement {
  const DemoTodayEngagement({
    required this.date,
    required this.messageCount,
    required this.checkinDone,
    required this.questCompleted,
    required this.rewardClaimed,
  });

  final String date;
  final int messageCount;
  final bool checkinDone;
  final bool questCompleted;
  final bool rewardClaimed;

  factory DemoTodayEngagement.fromJson(Map<String, dynamic> json) {
    return DemoTodayEngagement(
      date: json["date"]?.toString() ?? "",
      messageCount: (json["messageCount"] as num?)?.toInt() ?? 0,
      checkinDone: json["checkinDone"] == true,
      questCompleted: json["questCompleted"] == true,
      rewardClaimed: json["rewardClaimed"] == true,
    );
  }
}

class DemoEngagement {
  const DemoEngagement({
    required this.xp,
    required this.level,
    required this.streakDays,
    required this.lastActiveDay,
    required this.lastEventAt,
    required this.lastEventType,
    required this.today,
  });

  final int xp;
  final int level;
  final int streakDays;
  final String lastActiveDay;
  final String lastEventAt;
  final String lastEventType;
  final DemoTodayEngagement today;

  factory DemoEngagement.fromJson(Map<String, dynamic> json) {
    return DemoEngagement(
      xp: (json["xp"] as num?)?.toInt() ?? 0,
      level: (json["level"] as num?)?.toInt() ?? 1,
      streakDays: (json["streakDays"] as num?)?.toInt() ?? 0,
      lastActiveDay: json["lastActiveDay"]?.toString() ?? "",
      lastEventAt: json["lastEventAt"]?.toString() ?? "",
      lastEventType: json["lastEventType"]?.toString() ?? "",
      today: DemoTodayEngagement.fromJson(
        (json["today"] as Map<String, dynamic>? ?? <String, dynamic>{}),
      ),
    );
  }
}

class DemoProactiveState {
  const DemoProactiveState({
    required this.todayDate,
    required this.sentCount,
    required this.maxDaily,
    required this.cooldownMinutes,
    required this.lastSentAt,
    required this.lastType,
  });

  final String todayDate;
  final int sentCount;
  final int maxDaily;
  final int cooldownMinutes;
  final String lastSentAt;
  final String lastType;

  factory DemoProactiveState.fromJson(Map<String, dynamic> json) {
    return DemoProactiveState(
      todayDate: json["todayDate"]?.toString() ?? "",
      sentCount: (json["sentCount"] as num?)?.toInt() ?? 0,
      maxDaily: (json["maxDaily"] as num?)?.toInt() ?? 3,
      cooldownMinutes: (json["cooldownMinutes"] as num?)?.toInt() ?? 90,
      lastSentAt: json["lastSentAt"]?.toString() ?? "",
      lastType: json["lastType"]?.toString() ?? "",
    );
  }
}

class DemoAutonomyInboxItem {
  const DemoAutonomyInboxItem({
    required this.id,
    required this.suggestionId,
    required this.type,
    required this.title,
    required this.message,
    required this.ctaLabel,
    required this.prefillText,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String suggestionId;
  final String type;
  final String title;
  final String message;
  final String ctaLabel;
  final String prefillText;
  final String status;
  final String createdAt;

  factory DemoAutonomyInboxItem.fromJson(Map<String, dynamic> json) {
    return DemoAutonomyInboxItem(
      id: json["id"]?.toString() ?? "",
      suggestionId: json["suggestionId"]?.toString() ?? "",
      type: json["type"]?.toString() ?? "",
      title: json["title"]?.toString() ?? "",
      message: json["message"]?.toString() ?? "",
      ctaLabel: json["ctaLabel"]?.toString() ?? "执行",
      prefillText: json["prefillText"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "pending",
      createdAt: json["createdAt"]?.toString() ?? "",
    );
  }
}

class DemoAutonomyState {
  const DemoAutonomyState({
    required this.enabled,
    required this.tickCount,
    required this.lastTickAt,
    required this.lastRepairAt,
    required this.lastLearnAt,
    required this.generatedCount,
    required this.inbox,
  });

  final bool enabled;
  final int tickCount;
  final String lastTickAt;
  final String lastRepairAt;
  final String lastLearnAt;
  final int generatedCount;
  final List<DemoAutonomyInboxItem> inbox;

  factory DemoAutonomyState.fromJson(Map<String, dynamic> json) {
    final List<dynamic> inboxJson =
        json["inbox"] as List<dynamic>? ?? <dynamic>[];
    return DemoAutonomyState(
      enabled: json["enabled"] != false,
      tickCount: (json["tickCount"] as num?)?.toInt() ?? 0,
      lastTickAt: json["lastTickAt"]?.toString() ?? "",
      lastRepairAt: json["lastRepairAt"]?.toString() ?? "",
      lastLearnAt: json["lastLearnAt"]?.toString() ?? "",
      generatedCount: (json["generatedCount"] as num?)?.toInt() ?? 0,
      inbox: inboxJson
          .whereType<Map<String, dynamic>>()
          .map(DemoAutonomyInboxItem.fromJson)
          .toList(growable: false),
    );
  }
}

class WorkdayQuest {
  const WorkdayQuest({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    required this.category,
    required this.minutes,
    required this.rewardXp,
    required this.careBonus,
    required this.status,
    required this.completedAt,
    required this.note,
  });

  final String id;
  final String code;
  final String title;
  final String description;
  final String category;
  final int minutes;
  final int rewardXp;
  final int careBonus;
  final String status;
  final String completedAt;
  final String note;

  factory WorkdayQuest.fromJson(Map<String, dynamic> json) {
    return WorkdayQuest(
      id: json["id"]?.toString() ?? "",
      code: json["code"]?.toString() ?? "",
      title: json["title"]?.toString() ?? "",
      description: json["description"]?.toString() ?? "",
      category: json["category"]?.toString() ?? "execution",
      minutes: (json["minutes"] as num?)?.toInt() ?? 0,
      rewardXp: (json["rewardXp"] as num?)?.toInt() ?? 0,
      careBonus: (json["careBonus"] as num?)?.toInt() ?? 0,
      status: json["status"]?.toString() ?? "todo",
      completedAt: json["completedAt"]?.toString() ?? "",
      note: json["note"]?.toString() ?? "",
    );
  }
}

class DemoWorkdayState {
  const DemoWorkdayState({
    required this.date,
    required this.clarityScore,
    required this.affectionScore,
    required this.flowStreakDays,
    required this.flowCombo,
    required this.focusMinutes,
    required this.totalQuestXp,
    required this.completedCount,
    required this.totalCount,
    required this.quests,
    required this.lastSummary,
  });

  final String date;
  final int clarityScore;
  final int affectionScore;
  final int flowStreakDays;
  final int flowCombo;
  final int focusMinutes;
  final int totalQuestXp;
  final int completedCount;
  final int totalCount;
  final List<WorkdayQuest> quests;
  final String lastSummary;

  factory DemoWorkdayState.fromJson(Map<String, dynamic> json) {
    final List<dynamic> questsJson =
        json["quests"] as List<dynamic>? ?? <dynamic>[];
    return DemoWorkdayState(
      date: json["date"]?.toString() ?? "",
      clarityScore: (json["clarityScore"] as num?)?.toInt() ?? 0,
      affectionScore: (json["affectionScore"] as num?)?.toInt() ?? 0,
      flowStreakDays: (json["flowStreakDays"] as num?)?.toInt() ?? 0,
      flowCombo: (json["flowCombo"] as num?)?.toInt() ?? 0,
      focusMinutes: (json["focusMinutes"] as num?)?.toInt() ?? 0,
      totalQuestXp: (json["totalQuestXp"] as num?)?.toInt() ?? 0,
      completedCount: (json["completedCount"] as num?)?.toInt() ?? 0,
      totalCount: (json["totalCount"] as num?)?.toInt() ?? 0,
      quests: questsJson
          .whereType<Map<String, dynamic>>()
          .map(WorkdayQuest.fromJson)
          .toList(growable: false),
      lastSummary: json["lastSummary"]?.toString() ?? "",
    );
  }
}

class DeviceCapability {
  const DeviceCapability({
    required this.id,
    required this.platform,
    required this.name,
    required this.description,
    required this.risk,
    required this.permission,
  });

  final String id;
  final String platform;
  final String name;
  final String description;
  final String risk;
  final String permission;

  factory DeviceCapability.fromJson(Map<String, dynamic> json) {
    return DeviceCapability(
      id: json["id"]?.toString() ?? "",
      platform: json["platform"]?.toString() ?? "",
      name: json["name"]?.toString() ?? "",
      description: json["description"]?.toString() ?? "",
      risk: json["risk"]?.toString() ?? "medium",
      permission: json["permission"]?.toString() ?? "prompt",
    );
  }
}

class DeviceTask {
  const DeviceTask({
    required this.id,
    required this.type,
    required this.capabilityId,
    required this.title,
    required this.summary,
    required this.status,
    required this.reason,
    required this.outputSummary,
  });

  final String id;
  final String type;
  final String capabilityId;
  final String title;
  final String summary;
  final String status;
  final String reason;
  final String outputSummary;

  factory DeviceTask.fromJson(Map<String, dynamic> json) {
    final dynamic output = json["output"];
    String outputSummary = "";
    if (output is Map<String, dynamic>) {
      outputSummary = output["summary"]?.toString() ?? "";
    }
    return DeviceTask(
      id: json["id"]?.toString() ?? "",
      type: json["type"]?.toString() ?? "",
      capabilityId: json["capabilityId"]?.toString() ?? "",
      title: json["title"]?.toString() ?? "",
      summary: json["summary"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "planned",
      reason: json["reason"]?.toString() ?? "",
      outputSummary: outputSummary,
    );
  }
}

class DemoDeviceOpsState {
  const DemoDeviceOpsState({
    required this.permissions,
    required this.capabilities,
    required this.tasks,
    required this.bridgeStatus,
    required this.bridgeBaseUrl,
  });

  final Map<String, String> permissions;
  final List<DeviceCapability> capabilities;
  final List<DeviceTask> tasks;
  final String bridgeStatus;
  final String bridgeBaseUrl;

  factory DemoDeviceOpsState.fromJson(Map<String, dynamic> json) {
    final Map<String, String> permissions = <String, String>{};
    final dynamic permissionMap = json["permissions"];
    if (permissionMap is Map<String, dynamic>) {
      for (final MapEntry<String, dynamic> entry in permissionMap.entries) {
        permissions[entry.key] = entry.value?.toString() ?? "prompt";
      }
    }

    final List<dynamic> capabilityJson =
        json["capabilities"] as List<dynamic>? ?? <dynamic>[];
    final List<dynamic> taskJson =
        json["tasks"] as List<dynamic>? ?? <dynamic>[];

    return DemoDeviceOpsState(
      permissions: permissions,
      capabilities: capabilityJson
          .whereType<Map<String, dynamic>>()
          .map(DeviceCapability.fromJson)
          .toList(growable: false),
      tasks: taskJson
          .whereType<Map<String, dynamic>>()
          .map(DeviceTask.fromJson)
          .toList(growable: false),
      bridgeStatus: (json["bridge"] as Map<String, dynamic>? ??
                  <String, dynamic>{})["lastStatus"]
              ?.toString() ??
          "unknown",
      bridgeBaseUrl: (json["bridge"] as Map<String, dynamic>? ??
                  <String, dynamic>{})["baseUrl"]
              ?.toString() ??
          "",
    );
  }
}

class MemorySearchItem {
  const MemorySearchItem({
    required this.id,
    required this.source,
    required this.content,
    required this.score,
    required this.embeddingScore,
    required this.rerankScore,
    required this.triggerConfidence,
  });

  final String id;
  final String source;
  final String content;
  final double score;
  final double embeddingScore;
  final double rerankScore;
  final double triggerConfidence;

  factory MemorySearchItem.fromJson(Map<String, dynamic> json) {
    return MemorySearchItem(
      id: json["id"]?.toString() ?? "",
      source: json["source"]?.toString() ?? "memory_highlight",
      content: json["content"]?.toString() ?? "",
      score: (json["score"] as num?)?.toDouble() ?? 0.0,
      embeddingScore: (json["embedding_score"] as num?)?.toDouble() ?? 0.0,
      rerankScore: (json["rerank_score"] as num?)?.toDouble() ?? 0.0,
      triggerConfidence:
          (json["trigger_confidence"] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class ProactiveSuggestion {
  const ProactiveSuggestion({
    required this.id,
    required this.title,
    required this.message,
    required this.ctaLabel,
    required this.prefillText,
    required this.triggerConfidence,
  });

  final String id;
  final String title;
  final String message;
  final String ctaLabel;
  final String prefillText;
  final double triggerConfidence;

  factory ProactiveSuggestion.fromJson(Map<String, dynamic> json) {
    final dynamic triggerRaw =
        json["triggerConfidence"] ?? json["trigger_confidence"];
    return ProactiveSuggestion(
      id: json["id"]?.toString() ?? "",
      title: json["title"]?.toString() ?? "",
      message: json["message"]?.toString() ?? "",
      ctaLabel: json["ctaLabel"]?.toString() ?? "执行",
      prefillText: json["prefillText"]?.toString() ?? "",
      triggerConfidence: (triggerRaw as num?)?.toDouble() ?? 0.0,
    );
  }
}

class ProactiveNextResult {
  const ProactiveNextResult({
    required this.delivered,
    required this.decision,
    required this.reason,
    required this.nextEligibleAt,
    required this.triggerConfidence,
    required this.proactive,
    required this.suggestion,
  });

  final bool delivered;
  final String decision;
  final String reason;
  final String nextEligibleAt;
  final double triggerConfidence;
  final DemoProactiveState proactive;
  final ProactiveSuggestion? suggestion;

  factory ProactiveNextResult.fromJson(Map<String, dynamic> json) {
    final dynamic suggestionJson = json["suggestion"];
    return ProactiveNextResult(
      delivered: json["delivered"] == true,
      decision: json["decision"]?.toString() ?? "",
      reason: json["reason"]?.toString() ?? "",
      nextEligibleAt: json["nextEligibleAt"]?.toString() ?? "",
      triggerConfidence:
          (json["trigger_confidence"] as num?)?.toDouble() ?? 0.0,
      proactive: DemoProactiveState.fromJson(
        (json["proactive"] as Map<String, dynamic>? ?? <String, dynamic>{}),
      ),
      suggestion: suggestionJson is Map<String, dynamic>
          ? ProactiveSuggestion.fromJson(suggestionJson)
          : null,
    );
  }
}

class DemoState {
  const DemoState({
    required this.userId,
    required this.preferences,
    required this.messages,
    required this.memoryHighlights,
    required this.engagement,
    required this.proactive,
    required this.autonomy,
    required this.workday,
    required this.deviceOps,
    required this.updatedAt,
  });

  final String userId;
  final DemoPreferences preferences;
  final List<DemoMessage> messages;
  final List<String> memoryHighlights;
  final DemoEngagement engagement;
  final DemoProactiveState? proactive;
  final DemoAutonomyState? autonomy;
  final DemoWorkdayState? workday;
  final DemoDeviceOpsState? deviceOps;
  final String updatedAt;

  factory DemoState.fromJson(Map<String, dynamic> json) {
    final List<dynamic> messageJson =
        (json["messages"] as List<dynamic>? ?? <dynamic>[]);
    final List<dynamic> memoryJson =
        (json["memoryHighlights"] as List<dynamic>? ?? <dynamic>[]);

    return DemoState(
      userId: json["userId"]?.toString() ?? "mobile-demo-user",
      preferences: DemoPreferences.fromJson(
        (json["preferences"] as Map<String, dynamic>? ?? <String, dynamic>{}),
      ),
      messages: messageJson
          .map(
            (dynamic item) =>
                DemoMessage.fromJson(item as Map<String, dynamic>),
          )
          .toList(growable: false),
      memoryHighlights: memoryJson
          .map((dynamic item) => item.toString())
          .toList(growable: false),
      engagement: DemoEngagement.fromJson(
        (json["engagement"] as Map<String, dynamic>? ?? <String, dynamic>{}),
      ),
      proactive: json["proactive"] is Map<String, dynamic>
          ? DemoProactiveState.fromJson(
              json["proactive"] as Map<String, dynamic>,
            )
          : null,
      autonomy: json["autonomy"] is Map<String, dynamic>
          ? DemoAutonomyState.fromJson(
              json["autonomy"] as Map<String, dynamic>,
            )
          : null,
      workday: json["workday"] is Map<String, dynamic>
          ? DemoWorkdayState.fromJson(
              json["workday"] as Map<String, dynamic>,
            )
          : null,
      deviceOps: json["deviceOps"] is Map<String, dynamic>
          ? DemoDeviceOpsState.fromJson(
              json["deviceOps"] as Map<String, dynamic>,
            )
          : null,
      updatedAt: json["updatedAt"]?.toString() ?? "",
    );
  }
}

class DemoSystemProvider {
  const DemoSystemProvider({
    required this.id,
    required this.vendor,
    required this.model,
  });

  final String id;
  final String vendor;
  final String model;

  factory DemoSystemProvider.fromJson(Map<String, dynamic> json) {
    return DemoSystemProvider(
      id: json["id"]?.toString() ?? "",
      vendor: json["vendor"]?.toString() ?? "",
      model: json["model"]?.toString() ?? "",
    );
  }
}

class DemoSystemConfig {
  const DemoSystemConfig({
    required this.loadedAt,
    required this.modelRoutingVersion,
    required this.defaultRoute,
    required this.fallbackRoute,
    required this.enabledScenes,
    required this.degradeTimeoutMs,
    required this.degradeMaxRetries,
    required this.providers,
    required this.taskRoutes,
  });

  final String loadedAt;
  final String modelRoutingVersion;
  final String defaultRoute;
  final String fallbackRoute;
  final List<String> enabledScenes;
  final int degradeTimeoutMs;
  final int degradeMaxRetries;
  final List<DemoSystemProvider> providers;
  final Map<String, List<String>> taskRoutes;

  factory DemoSystemConfig.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> runtime =
        json["runtime"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> versions =
        runtime["versions"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> systemProfile =
        json["systemProfile"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> layers =
        systemProfile["layers"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> modelLayer =
        layers["model"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> appLayer =
        layers["application"] as Map<String, dynamic>? ?? <String, dynamic>{};
    final Map<String, dynamic> modelRouting =
        json["modelRoutingPolicy"] as Map<String, dynamic>? ??
            <String, dynamic>{};
    final Map<String, dynamic> degradeStrategy =
        modelRouting["degradeStrategy"] as Map<String, dynamic>? ??
            <String, dynamic>{};
    final List<dynamic> providersJson =
        modelRouting["providers"] as List<dynamic>? ?? <dynamic>[];
    final Map<String, dynamic> routesRaw =
        modelRouting["taskRoutes"] as Map<String, dynamic>? ??
            <String, dynamic>{};

    final Map<String, List<String>> taskRoutes = <String, List<String>>{};
    for (final MapEntry<String, dynamic> entry in routesRaw.entries) {
      final String taskType = entry.key.trim();
      if (taskType.isEmpty) {
        continue;
      }
      final List<dynamic> providersRaw = entry.value is List<dynamic>
          ? entry.value as List<dynamic>
          : <dynamic>[];
      final List<String> providers = providersRaw
          .map((dynamic item) => item.toString().trim())
          .where((String item) => item.isNotEmpty)
          .toList(growable: false);
      taskRoutes[taskType] = providers;
    }

    final List<String> enabledScenes =
        (appLayer["enabledScenes"] as List<dynamic>? ?? <dynamic>[])
            .map((dynamic item) => item.toString().trim())
            .where((String item) => item.isNotEmpty)
            .toList(growable: false);

    return DemoSystemConfig(
      loadedAt: runtime["loadedAt"]?.toString() ?? "",
      modelRoutingVersion: versions["modelRouting"]?.toString() ?? "",
      defaultRoute: modelLayer["defaultRoute"]?.toString() ?? "",
      fallbackRoute: modelLayer["fallbackRoute"]?.toString() ?? "",
      enabledScenes: enabledScenes,
      degradeTimeoutMs:
          (degradeStrategy["timeoutMs"] as num?)?.toInt() ?? 20000,
      degradeMaxRetries: (degradeStrategy["maxRetries"] as num?)?.toInt() ?? 2,
      providers: providersJson
          .whereType<Map<String, dynamic>>()
          .map(DemoSystemProvider.fromJson)
          .toList(growable: false),
      taskRoutes: taskRoutes,
    );
  }
}

class DemoUnifiedTimelineEvent {
  const DemoUnifiedTimelineEvent({
    required this.id,
    required this.flowId,
    required this.source,
    required this.stage,
    required this.status,
    required this.title,
    required this.detail,
    required this.at,
    required this.refs,
  });

  final String id;
  final String flowId;
  final String source;
  final String stage;
  final String status;
  final String title;
  final String detail;
  final String at;
  final Map<String, dynamic> refs;

  factory DemoUnifiedTimelineEvent.fromJson(Map<String, dynamic> json) {
    return DemoUnifiedTimelineEvent(
      id: json["id"]?.toString() ?? "",
      flowId: json["flowId"]?.toString() ?? "",
      source: json["source"]?.toString() ?? "",
      stage: json["stage"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "info",
      title: json["title"]?.toString() ?? "",
      detail: json["detail"]?.toString() ?? "",
      at: json["at"]?.toString() ?? "",
      refs: json["refs"] is Map<String, dynamic>
          ? json["refs"] as Map<String, dynamic>
          : <String, dynamic>{},
    );
  }
}

class DemoUnifiedTimelineFlow {
  const DemoUnifiedTimelineFlow({
    required this.flowId,
    required this.title,
    required this.startedAt,
    required this.lastAt,
    required this.status,
    required this.sources,
    required this.stages,
    required this.total,
    required this.success,
    required this.warnings,
    required this.errors,
  });

  final String flowId;
  final String title;
  final String startedAt;
  final String lastAt;
  final String status;
  final List<String> sources;
  final List<String> stages;
  final int total;
  final int success;
  final int warnings;
  final int errors;

  factory DemoUnifiedTimelineFlow.fromJson(Map<String, dynamic> json) {
    return DemoUnifiedTimelineFlow(
      flowId: json["flowId"]?.toString() ?? "",
      title: json["title"]?.toString() ?? "",
      startedAt: json["startedAt"]?.toString() ?? "",
      lastAt: json["lastAt"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "info",
      sources: (json["sources"] as List<dynamic>? ?? <dynamic>[])
          .map((dynamic item) => item.toString())
          .toList(growable: false),
      stages: (json["stages"] as List<dynamic>? ?? <dynamic>[])
          .map((dynamic item) => item.toString())
          .toList(growable: false),
      total: (json["total"] as num?)?.toInt() ?? 0,
      success: (json["success"] as num?)?.toInt() ?? 0,
      warnings: (json["warnings"] as num?)?.toInt() ?? 0,
      errors: (json["errors"] as num?)?.toInt() ?? 0,
    );
  }
}

class DemoUnifiedTimeline {
  const DemoUnifiedTimeline({
    required this.flowId,
    required this.total,
    required this.events,
    required this.flows,
  });

  final String flowId;
  final int total;
  final List<DemoUnifiedTimelineEvent> events;
  final List<DemoUnifiedTimelineFlow> flows;

  factory DemoUnifiedTimeline.fromJson(Map<String, dynamic> json) {
    return DemoUnifiedTimeline(
      flowId: json["flowId"]?.toString() ?? "",
      total: (json["total"] as num?)?.toInt() ?? 0,
      events: (json["events"] as List<dynamic>? ?? <dynamic>[])
          .whereType<Map<String, dynamic>>()
          .map(DemoUnifiedTimelineEvent.fromJson)
          .toList(growable: false),
      flows: (json["flows"] as List<dynamic>? ?? <dynamic>[])
          .whereType<Map<String, dynamic>>()
          .map(DemoUnifiedTimelineFlow.fromJson)
          .toList(growable: false),
    );
  }
}

class DemoUnifiedTimelineReplay {
  const DemoUnifiedTimelineReplay({
    required this.flowId,
    required this.summary,
    required this.events,
    required this.generatedAt,
  });

  final String flowId;
  final DemoUnifiedTimelineFlow? summary;
  final List<DemoUnifiedTimelineEvent> events;
  final String generatedAt;

  factory DemoUnifiedTimelineReplay.fromJson(Map<String, dynamic> json) {
    final dynamic summaryJson = json["summary"];
    return DemoUnifiedTimelineReplay(
      flowId: json["flowId"]?.toString() ?? "",
      summary: summaryJson is Map<String, dynamic>
          ? DemoUnifiedTimelineFlow.fromJson(summaryJson)
          : null,
      events: (json["events"] as List<dynamic>? ?? <dynamic>[])
          .whereType<Map<String, dynamic>>()
          .map(DemoUnifiedTimelineEvent.fromJson)
          .toList(growable: false),
      generatedAt: json["generatedAt"]?.toString() ?? "",
    );
  }
}

class GuestAuth {
  const GuestAuth({required this.token, required this.userId});

  final String token;
  final String userId;
}

class VoiceChannelSnapshot {
  const VoiceChannelSnapshot({
    required this.active,
    required this.owner,
    required this.token,
    required this.leaseMs,
    required this.expiresAt,
    required this.lastReason,
  });

  final bool active;
  final String owner;
  final String token;
  final int leaseMs;
  final String expiresAt;
  final String lastReason;

  factory VoiceChannelSnapshot.fromJson(Map<String, dynamic> json) {
    return VoiceChannelSnapshot(
      active: json["active"] == true,
      owner: json["owner"]?.toString() ?? "",
      token: json["token"]?.toString() ?? "",
      leaseMs: (json["leaseMs"] as num?)?.toInt() ?? 0,
      expiresAt: json["expiresAt"]?.toString() ?? "",
      lastReason: json["lastReason"]?.toString() ?? "",
    );
  }
}

class VoiceChannelControlResult {
  const VoiceChannelControlResult({
    required this.ok,
    required this.reason,
    required this.summary,
    required this.warning,
    required this.error,
    required this.channel,
  });

  final bool ok;
  final String reason;
  final String summary;
  final String warning;
  final String error;
  final VoiceChannelSnapshot? channel;

  factory VoiceChannelControlResult.fromJson(Map<String, dynamic> json) {
    final dynamic channelRaw = json["channel"];
    return VoiceChannelControlResult(
      ok: json["ok"] == true,
      reason: json["reason"]?.toString() ?? "",
      summary: json["summary"]?.toString() ?? "",
      warning: json["warning"]?.toString() ?? "",
      error: json["error"]?.toString() ?? "",
      channel: channelRaw is Map<String, dynamic>
          ? VoiceChannelSnapshot.fromJson(channelRaw)
          : null,
    );
  }
}

class _SseBlock {
  const _SseBlock({required this.event, required this.data});

  final String event;
  final String data;
}

class DemoApiClient {
  DemoApiClient({http.Client? client, String? baseUrl, String? deviceId})
      : _client = client ?? http.Client(),
        baseUrl = baseUrl ??
            const String.fromEnvironment(
              "ARIA_API_BASE",
              defaultValue: "http://127.0.0.1:8787",
            ),
        _deviceId = deviceId ?? "mobile-flutter-companion";

  final http.Client _client;
  final String baseUrl;
  final String _deviceId;
  String? _token;
  String? _userId;

  static const Set<int> _transientStatusCodes = <int>{
    408,
    425,
    429,
    500,
    502,
    503,
    504,
  };
  static const int _streamRetryMaxAttempts = 3;
  static const int _streamRetryBaseMs = 850;

  String get currentUserId => _userId ?? "";

  bool _isTransientStatusCode(int statusCode) {
    return _transientStatusCodes.contains(statusCode);
  }

  String _extractTraceId(http.BaseResponse response) {
    final Map<String, String> headers = response.headers;
    return headers["x-cloudaicompanion-trace-id"] ??
        headers["x-request-id"] ??
        headers["trace-id"] ??
        "";
  }

  String _extractReadableErrorDetail(String body) {
    final String text = body.trim();
    if (text.isEmpty) {
      return "";
    }
    try {
      final dynamic decoded = jsonDecode(text);
      if (decoded is Map<String, dynamic>) {
        final dynamic nestedError = decoded["error"];
        if (nestedError is Map<String, dynamic>) {
          final String nestedMessage =
              nestedError["message"]?.toString().trim() ?? "";
          final String nestedCode =
              nestedError["code"]?.toString().trim() ?? "";
          if (nestedMessage.isNotEmpty) {
            return nestedMessage;
          }
          if (nestedCode.isNotEmpty) {
            return nestedCode;
          }
        }
        final String rootMessage = decoded["message"]?.toString().trim() ?? "";
        if (rootMessage.isNotEmpty) {
          return rootMessage;
        }
        final String rootReason = decoded["reason"]?.toString().trim() ?? "";
        if (rootReason.isNotEmpty) {
          return rootReason;
        }
        final String rootError = decoded["error"]?.toString().trim() ?? "";
        if (rootError.isNotEmpty) {
          return rootError;
        }
      }
    } catch (_) {
      // keep raw text
    }
    return text;
  }

  Exception _httpError(http.BaseResponse response, String body) {
    final String detail = _extractReadableErrorDetail(body);
    final String traceId = _extractTraceId(response);
    final String transientHint =
        _isTransientStatusCode(response.statusCode) ? "（上游暂时异常，建议自动重试）" : "";
    final String traceSuffix = traceId.isNotEmpty ? " [trace: $traceId]" : "";
    return Exception(
      "API error ${response.statusCode}: $detail$traceSuffix$transientHint",
    );
  }

  bool _shouldRetryStreamError(Object error) {
    final String text = error.toString().toLowerCase();
    if (text.contains("api error 408") ||
        text.contains("api error 425") ||
        text.contains("api error 429") ||
        text.contains("api error 500") ||
        text.contains("api error 502") ||
        text.contains("api error 503") ||
        text.contains("api error 504")) {
      return true;
    }
    return text.contains("internal error encountered") ||
        text.contains("status\": \"internal") ||
        text.contains("stream connect timeout") ||
        text.contains("stream idle timeout") ||
        text.contains("stream total timeout") ||
        text.contains("socketexception") ||
        text.contains("timed out") ||
        text.contains("failed host lookup") ||
        text.contains("connection closed before full header was received") ||
        text.contains("connection reset by peer");
  }

  Uri _uri(String path, Map<String, String> query) {
    return Uri.parse("$baseUrl$path").replace(queryParameters: query);
  }

  Exception _runtimeConnectionError(Object error) {
    return Exception(
      "无法连接 Aria API（$baseUrl）。\n"
      "如果是本地运行，请确保：\n"
      "1) 电脑端已启动服务：bash scripts/run-mobile-demo.sh\n"
      "2) 真机调试请配置电脑局域网IP：--dart-define=ARIA_API_BASE=http://<MacIP>:8787\n"
      "原始错误：$error",
    );
  }

  Future<GuestAuth> _authGuest() async {
    final Uri uri = _uri("/v1/auth/guest", const <String, String>{});
    late http.Response response;
    try {
      response = await _client.post(
        uri,
        headers: <String, String>{"Content-Type": "application/json"},
        body: jsonEncode(<String, dynamic>{
          "deviceId": _deviceId,
          "platform": "ios-flutter",
        }),
      );
    } on SocketException catch (error) {
      throw _runtimeConnectionError(error);
    } on http.ClientException catch (error) {
      throw _runtimeConnectionError(error);
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        "Guest auth failed: ${response.statusCode} ${response.body}",
      );
    }

    final dynamic decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception("Invalid auth response.");
    }
    final String token = decoded["token"]?.toString() ?? "";
    final String userId =
        (decoded["user"] as Map<String, dynamic>?)?["id"]?.toString() ?? "";
    if (token.isEmpty || userId.isEmpty) {
      throw Exception("Missing token or user id in auth response.");
    }
    _token = token;
    _userId = userId;
    return GuestAuth(token: token, userId: userId);
  }

  Future<String> _ensureToken() async {
    if (_token != null && _token!.isNotEmpty) {
      return _token!;
    }
    final GuestAuth auth = await _authGuest();
    return auth.token;
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, String> query = const <String, String>{},
    Map<String, dynamic>? body,
    bool auth = true,
    bool retriedAfterAuth = false,
  }) async {
    final Uri uri = _uri(path, query);

    final Map<String, String> headers = <String, String>{
      "Content-Type": "application/json",
    };
    if (auth) {
      headers["Authorization"] = "Bearer ${await _ensureToken()}";
    }

    late http.Response response;
    try {
      if (method == "GET") {
        response = await _client.get(uri, headers: headers);
      } else {
        response = await _client.post(
          uri,
          headers: headers,
          body: jsonEncode(body ?? <String, dynamic>{}),
        );
      }
    } on SocketException catch (error) {
      throw _runtimeConnectionError(error);
    } on http.ClientException catch (error) {
      throw _runtimeConnectionError(error);
    }

    if (response.statusCode == 401 && auth && !retriedAfterAuth) {
      _token = null;
      await _authGuest();
      return _request(
        method,
        path,
        query: query,
        body: body,
        auth: auth,
        retriedAfterAuth: true,
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw _httpError(response, response.body);
    }

    final dynamic decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw Exception("Unexpected API response shape.");
    }
    return decoded;
  }

  _SseBlock _parseSseBlock(String block) {
    String event = "message";
    final List<String> dataLines = <String>[];
    for (final String rawLine in block.split(RegExp(r"\r?\n"))) {
      final String line = rawLine.trim();
      if (line.isEmpty) {
        continue;
      }
      if (line.startsWith("event:")) {
        event = line.substring("event:".length).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.add(line.substring("data:".length).trim());
      }
    }
    return _SseBlock(event: event, data: dataLines.join("\n"));
  }

  Future<DemoState> _sendMessageStreamInternal({
    required String text,
    required String scene,
    required void Function(String fullText)? onChunk,
    required bool retriedAfterAuth,
  }) async {
    final Uri uri = _uri("/v1/message/stream", const <String, String>{});
    final String token = await _ensureToken();

    final http.Request request = http.Request("POST", uri);
    request.headers.addAll(<String, String>{
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      "Authorization": "Bearer $token",
    });
    request.body = jsonEncode(<String, dynamic>{
      "text": text,
      if (scene.trim().isNotEmpty) "scene": scene.trim(),
    });

    late http.StreamedResponse response;
    try {
      response = await _client.send(request);
    } on SocketException catch (error) {
      throw _runtimeConnectionError(error);
    } on http.ClientException catch (error) {
      throw _runtimeConnectionError(error);
    }

    if (response.statusCode == 401 && !retriedAfterAuth) {
      _token = null;
      await _authGuest();
      return _sendMessageStreamInternal(
        text: text,
        scene: scene,
        onChunk: onChunk,
        retriedAfterAuth: true,
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final String body = await response.stream.bytesToString();
      throw _httpError(response, body);
    }

    String buffer = "";
    Map<String, dynamic>? donePayload;

    await for (final String part in response.stream.transform(utf8.decoder)) {
      buffer += part;
      final List<String> blocks = buffer.split(RegExp(r"\r?\n\r?\n"));
      buffer = blocks.removeLast();

      for (final String block in blocks) {
        if (block.trim().isEmpty) {
          continue;
        }
        final _SseBlock parsed = _parseSseBlock(block);
        if (parsed.data.isEmpty) {
          continue;
        }

        final dynamic decoded = jsonDecode(parsed.data);
        if (decoded is! Map<String, dynamic>) {
          continue;
        }

        if (parsed.event == "chunk") {
          onChunk?.call(decoded["fullText"]?.toString() ?? "");
          continue;
        }
        if (parsed.event == "done") {
          donePayload = decoded;
          continue;
        }
        if (parsed.event == "error") {
          throw Exception(
            decoded["message"]?.toString() ?? "Stream returned an error event.",
          );
        }
      }
    }

    if (donePayload == null) {
      throw Exception("Stream ended without done event.");
    }

    final dynamic state = donePayload["state"];
    if (state is! Map<String, dynamic>) {
      throw Exception("Stream done payload missing state.");
    }

    return DemoState.fromJson(state);
  }

  Future<DemoState> fetchState() async {
    final Map<String, dynamic> data = await _request("GET", "/v1/state");
    return DemoState.fromJson(data["state"] as Map<String, dynamic>);
  }

  Future<DemoEngagement> fetchEngagementState() async {
    final Map<String, dynamic> data = await _request(
      "GET",
      "/v1/engagement/state",
    );
    return DemoEngagement.fromJson(data["engagement"] as Map<String, dynamic>);
  }

  Future<DemoWorkdayState> fetchWorkdayState() async {
    final Map<String, dynamic> data =
        await _request("GET", "/v1/workday/state");
    return DemoWorkdayState.fromJson(
      data["workday"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoWorkdayState> workdayCheckin({
    required int energy,
    required int pressure,
    String focusIntent = "",
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/workday/checkin",
      body: <String, dynamic>{
        "energy": energy,
        "pressure": pressure,
        "focusIntent": focusIntent,
      },
    );
    return DemoWorkdayState.fromJson(
      data["workday"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoWorkdayState> completeWorkdayQuest({
    required String questId,
    String note = "",
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/workday/quest/complete",
      body: <String, dynamic>{
        "questId": questId,
        "note": note,
      },
    );
    return DemoWorkdayState.fromJson(
      data["workday"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoDeviceOpsState> fetchDeviceCapabilities() async {
    final Map<String, dynamic> data =
        await _request("GET", "/v1/device/capabilities");
    return DemoDeviceOpsState.fromJson(
      data["deviceOps"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoDeviceOpsState> updateDevicePermission({
    required String capabilityId,
    required String status,
    String reason = "",
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/device/permissions",
      body: <String, dynamic>{
        "capabilityId": capabilityId,
        "status": status,
        "reason": reason,
      },
    );
    return DemoDeviceOpsState.fromJson(
      data["deviceOps"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<List<DeviceTask>> fetchDeviceTasks({
    String status = "",
    int limit = 20,
  }) async {
    final Map<String, dynamic> data = await _request(
      "GET",
      "/v1/device/tasks",
      query: <String, String>{
        if (status.trim().isNotEmpty) "status": status.trim(),
        "limit": limit.toString(),
      },
    );
    final List<dynamic> items = data["tasks"] as List<dynamic>? ?? <dynamic>[];
    return items
        .whereType<Map<String, dynamic>>()
        .map(DeviceTask.fromJson)
        .toList(growable: false);
  }

  Future<DeviceTask?> planDeviceTask({
    required String taskType,
    Map<String, dynamic> payload = const <String, dynamic>{},
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/device/tasks/plan",
      body: <String, dynamic>{
        "taskType": taskType,
        "payload": payload,
      },
    );
    final dynamic taskJson = data["task"];
    if (taskJson is! Map<String, dynamic>) {
      return null;
    }
    return DeviceTask.fromJson(taskJson);
  }

  Future<DeviceTask?> executeDeviceTask({required String taskId}) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/device/tasks/execute",
      body: <String, dynamic>{"taskId": taskId},
    );
    final dynamic taskJson = data["task"];
    if (taskJson is! Map<String, dynamic>) {
      return null;
    }
    return DeviceTask.fromJson(taskJson);
  }

  Future<Map<String, dynamic>> fetchHardwareStatus() async {
    return _request("GET", "/v1/hardware/status");
  }

  Future<Map<String, dynamic>> fetchAriaKernelIncidentPlaybook() async {
    return _request("GET", "/v1/aria-kernel/incidents/playbook");
  }

  Future<Map<String, dynamic>> rememberAriaKernelIncidentGuardrails({
    String incidentId = "",
    String issueMessage = "",
  }) async {
    return _request(
      "POST",
      "/v1/aria-kernel/incidents/remember",
      body: <String, dynamic>{
        if (incidentId.trim().isNotEmpty) "incidentId": incidentId.trim(),
        if (issueMessage.trim().isNotEmpty) "issueMessage": issueMessage.trim(),
      },
    );
  }

  Future<Map<String, dynamic>> runVoiceTts({
    required String text,
    String? voice,
    int? rate,
    bool dryRun = true,
  }) async {
    return _request(
      "POST",
      "/v1/voice/tts",
      body: <String, dynamic>{
        "text": text,
        if (voice != null && voice.trim().isNotEmpty) "voice": voice.trim(),
        if (rate != null) "rate": rate,
        "dryRun": dryRun,
      },
    );
  }

  Future<VoiceChannelControlResult> fetchVoiceChannelStatus() async {
    final Map<String, dynamic> data = await _request(
      "GET",
      "/v1/voice/channel/status",
    );
    return VoiceChannelControlResult.fromJson(data);
  }

  Future<VoiceChannelControlResult> acquireVoiceChannel({
    required String owner,
    int leaseMs = 30000,
    String client = "aria-mobile",
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/voice/channel/acquire",
      body: <String, dynamic>{
        "owner": owner,
        "leaseMs": leaseMs,
        "client": client,
      },
    );
    return VoiceChannelControlResult.fromJson(data);
  }

  Future<VoiceChannelControlResult> renewVoiceChannel({
    required String token,
    int? leaseMs,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/voice/channel/renew",
      body: <String, dynamic>{
        "token": token,
        if (leaseMs != null) "leaseMs": leaseMs,
      },
    );
    return VoiceChannelControlResult.fromJson(data);
  }

  Future<VoiceChannelControlResult> releaseVoiceChannel({
    required String token,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/voice/channel/release",
      body: <String, dynamic>{"token": token},
    );
    return VoiceChannelControlResult.fromJson(data);
  }

  Future<List<MemorySearchItem>> searchMemory({
    String query = "",
    int limit = 6,
  }) async {
    final Map<String, dynamic> data = await _request(
      "GET",
      "/v1/memory/search",
      query: <String, String>{
        if (query.trim().isNotEmpty) "q": query.trim(),
        "limit": limit.toString(),
      },
    );
    final List<dynamic> itemsJson =
        (data["items"] as List<dynamic>? ?? <dynamic>[]);
    return itemsJson
        .whereType<Map<String, dynamic>>()
        .map(MemorySearchItem.fromJson)
        .toList(growable: false);
  }

  Future<void> createMemory({required String content}) async {
    await _request(
      "POST",
      "/v1/memory",
      body: <String, dynamic>{"content": content},
    );
  }

  Future<ProactiveNextResult> fetchProactiveNext({
    String scene = "mobile-chat",
    int? localHour,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/proactive/next",
      body: <String, dynamic>{
        "scene": scene,
        "localHour": localHour ?? DateTime.now().hour,
      },
    );
    return ProactiveNextResult.fromJson(data);
  }

  Future<void> reportProactiveFeedback({
    required String feedback,
    String suggestionId = "",
  }) async {
    await _request(
      "POST",
      "/v1/proactive/feedback",
      body: <String, dynamic>{
        "feedback": feedback,
        "suggestionId": suggestionId,
      },
    );
  }

  Future<DemoAutonomyState> fetchAutonomyStatus() async {
    final Map<String, dynamic> data =
        await _request("GET", "/v1/autonomy/status");
    return DemoAutonomyState.fromJson(
      data["autonomy"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<List<DemoAutonomyInboxItem>> fetchAutonomyInbox() async {
    final Map<String, dynamic> data =
        await _request("GET", "/v1/autonomy/inbox");
    final List<dynamic> itemsJson =
        data["items"] as List<dynamic>? ?? <dynamic>[];
    return itemsJson
        .whereType<Map<String, dynamic>>()
        .map(DemoAutonomyInboxItem.fromJson)
        .toList(growable: false);
  }

  Future<void> ackAutonomyInboxItem({required String id}) async {
    await _request(
      "POST",
      "/v1/autonomy/inbox/ack",
      body: <String, dynamic>{"id": id},
    );
  }

  Future<void> runAutonomyTick() async {
    await _request("POST", "/v1/autonomy/tick");
  }

  Future<void> runAutonomyRepair() async {
    await _request("POST", "/v1/autonomy/repair");
  }

  Future<DemoSystemConfig> fetchSystemConfig() async {
    final Map<String, dynamic> data =
        await _request("GET", "/v1/system/config");
    return DemoSystemConfig.fromJson(data);
  }

  Future<DemoSystemConfig> updateSystemConfig({
    required String defaultRoute,
    required String fallbackRoute,
    required List<String> enabledScenes,
    required int timeoutMs,
    required int maxRetries,
    required Map<String, List<String>> taskRoutes,
    bool persist = true,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/system/config",
      body: <String, dynamic>{
        "persist": persist,
        "systemProfilePatch": <String, dynamic>{
          "layers": <String, dynamic>{
            "model": <String, dynamic>{
              "defaultRoute": defaultRoute,
              "fallbackRoute": fallbackRoute,
            },
            "application": <String, dynamic>{
              "enabledScenes": enabledScenes,
            },
          },
        },
        "modelRoutingPatch": <String, dynamic>{
          "degradeStrategy": <String, dynamic>{
            "timeoutMs": timeoutMs,
            "maxRetries": maxRetries,
          },
          "taskRoutes": taskRoutes,
        },
      },
    );
    return DemoSystemConfig.fromJson(data);
  }

  Future<DemoSystemConfig> reloadSystemConfig() async {
    final Map<String, dynamic> data =
        await _request("POST", "/v1/system/config/reload");
    return DemoSystemConfig.fromJson(data);
  }

  Future<DemoSystemConfig> syncSystemConfigAriaKernel({
    bool persist = true,
    String mode = "merge",
    bool includeLocal = false,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/system/config/sync-aria-kernel",
      body: <String, dynamic>{
        "persist": persist,
        "mode": mode,
        "includeLocal": includeLocal,
        "operatorSource": "mobile-config-center",
      },
    );
    return DemoSystemConfig.fromJson(data);
  }

  Future<void> submitWorkbenchIntent({
    required String text,
    List<String> tags = const <String>[],
    bool autoRun = true,
  }) async {
    await _request(
      "POST",
      "/v1/workbench/intent",
      body: <String, dynamic>{
        "text": text,
        "tags": tags,
        "autoRun": autoRun,
      },
    );
  }

  Future<DemoUnifiedTimeline> fetchUnifiedTimeline({
    String flowId = "",
    int limit = 120,
  }) async {
    final Map<String, dynamic> data = await _request(
      "GET",
      "/v1/timeline/unified",
      query: <String, String>{
        if (flowId.trim().isNotEmpty) "flowId": flowId.trim(),
        "limit": limit.toString(),
      },
    );
    return DemoUnifiedTimeline.fromJson(
      data["timeline"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoUnifiedTimelineReplay> replayUnifiedTimeline({
    required String flowId,
    int limit = 240,
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/timeline/replay",
      body: <String, dynamic>{
        "flowId": flowId,
        "limit": limit,
      },
    );
    return DemoUnifiedTimelineReplay.fromJson(
      data["replay"] as Map<String, dynamic>? ?? <String, dynamic>{},
    );
  }

  Future<DemoPreferences> updatePreferences({
    String? mode,
    bool? online,
  }) async {
    final Map<String, dynamic> payload = <String, dynamic>{};
    if (mode != null) {
      payload["mode"] = mode;
    }
    if (online != null) {
      payload["online"] = online;
    }

    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/preferences",
      body: payload,
    );
    return DemoPreferences.fromJson(
      data["preferences"] as Map<String, dynamic>,
    );
  }

  Future<DemoEngagement> reportEngagementEvent({
    required String type,
    Map<String, dynamic> metadata = const <String, dynamic>{},
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/engagement/event",
      body: <String, dynamic>{
        "type": type,
        "source": "mobile",
        "metadata": metadata,
      },
    );
    return DemoEngagement.fromJson(data["engagement"] as Map<String, dynamic>);
  }

  Future<DemoState> sendMessage({
    required String text,
    String scene = "",
  }) async {
    final Map<String, dynamic> data = await _request(
      "POST",
      "/v1/message",
      body: <String, dynamic>{
        "text": text,
        if (scene.trim().isNotEmpty) "scene": scene.trim(),
      },
    );
    return DemoState.fromJson(data["state"] as Map<String, dynamic>);
  }

  Future<DemoState> sendMessageStream({
    required String text,
    String scene = "",
    void Function(String fullText)? onChunk,
  }) async {
    Object? lastError;
    for (int attempt = 1; attempt <= _streamRetryMaxAttempts; attempt += 1) {
      try {
        return await _sendMessageStreamInternal(
          text: text,
          scene: scene,
          onChunk: onChunk,
          retriedAfterAuth: false,
        );
      } catch (error) {
        lastError = error;
        if (attempt >= _streamRetryMaxAttempts ||
            !_shouldRetryStreamError(error)) {
          rethrow;
        }
        await Future<void>.delayed(
          Duration(milliseconds: _streamRetryBaseMs * attempt),
        );
      }
    }
    throw Exception(lastError?.toString() ?? "Stream send failed");
  }

  Future<DemoState> resetState() async {
    final Map<String, dynamic> data = await _request("POST", "/v1/reset");
    return DemoState.fromJson(data["state"] as Map<String, dynamic>);
  }

  void dispose() {
    _client.close();
  }
}
