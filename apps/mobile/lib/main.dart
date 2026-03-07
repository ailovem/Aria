import "dart:async";
import "dart:ui";

import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:flutter_tts/flutter_tts.dart";
import "package:speech_to_text/speech_to_text.dart" as stt;

import "demo_api.dart";

void main() {
  runApp(const AriaApp());
}

class AriaApp extends StatelessWidget {
  const AriaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Aria Mobile",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFFBF8F3),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFAD4B2D),
          secondary: const Color(0xFF5A4A40),
          surface: const Color(0xFFFFFDFB),
          brightness: Brightness.light,
        ),
        fontFamily: "PingFang SC",
        textTheme: const TextTheme(
          displayLarge:
              TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF2D1F17)),
          titleLarge:
              TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF3B271C)),
          bodyLarge: TextStyle(color: Color(0xFF4A3A31), height: 1.5),
        ),
      ),
      home: const AriaMobileShell(),
    );
  }
}

class GlassContainer extends StatelessWidget {
  const GlassContainer({
    super.key,
    required this.child,
    this.borderRadius,
    this.blur = 12,
    this.opacity = 0.6,
    this.color = Colors.white,
    this.border,
  });

  final Widget child;
  final BorderRadius? borderRadius;
  final double blur;
  final double opacity;
  final Color color;
  final BoxBorder? border;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration: BoxDecoration(
            color: color.withOpacity(opacity),
            borderRadius: borderRadius,
            border: border ?? Border.all(color: Colors.white.withOpacity(0.25)),
          ),
          child: child,
        ),
      ),
    );
  }
}

class CompanionScene {
  const CompanionScene({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageAsset,
    required this.gradientStart,
    required this.gradientEnd,
    required this.welcome,
  });

  final String id;
  final String title;
  final String subtitle;
  final String imageAsset;
  final Color gradientStart;
  final Color gradientEnd;
  final String welcome;
}

class QuickShortcut {
  const QuickShortcut({
    required this.label,
    required this.prompt,
    required this.icon,
  });

  final String label;
  final String prompt;
  final IconData icon;
}

class CenterAction {
  const CenterAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.description,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final String description;
}

class CallTimelineEntry {
  const CallTimelineEntry({
    required this.role,
    required this.text,
    required this.time,
  });

  final String role;
  final String text;
  final String time;
}

class ActionExecutionResult {
  const ActionExecutionResult({
    required this.summary,
    this.chatPrompt = "",
  });

  final String summary;
  final String chatPrompt;
}

const List<CompanionScene> kCompanionScenes = <CompanionScene>[
  CompanionScene(
    id: "work",
    title: "工作陪伴",
    subtitle: "专注支持",
    imageAsset: "assets/scenes/work.png",
    gradientStart: Color(0xFFE8DECF),
    gradientEnd: Color(0xFFF0EBE1),
    welcome: "工作模式就绪，我会先帮你理清今天最重要的三件事。",
  ),
  CompanionScene(
    id: "life",
    title: "生活日常",
    subtitle: "温柔提醒",
    imageAsset: "assets/scenes/life.png",
    gradientStart: Color(0xFFE5DCD0),
    gradientEnd: Color(0xFFEDE5DC),
    welcome: "生活场景切换完成，吃饭、运动、休息我都会陪着你安排好。",
  ),
  CompanionScene(
    id: "fun",
    title: "娱乐放松",
    subtitle: "轻松玩乐",
    imageAsset: "assets/scenes/fun.png",
    gradientStart: Color(0xFFF1DECB),
    gradientEnd: Color(0xFFF7EDE3),
    welcome: "娱乐模式开启，想聊天、玩小游戏还是看点有趣的内容？",
  ),
  CompanionScene(
    id: "love",
    title: "情感陪伴",
    subtitle: "亲密互动",
    imageAsset: "assets/scenes/love.png",
    gradientStart: Color(0xFFEFD2CA),
    gradientEnd: Color(0xFFF9EAE6),
    welcome: "情感场景已开启，我会先听你现在的心情，再给你回应和行动。",
  ),
];

const List<QuickShortcut> kQuickShortcuts = <QuickShortcut>[
  QuickShortcut(
    label: "早安关心",
    prompt: "早安，先问候我并给我今天的状态建议。",
    icon: Icons.wb_sunny_outlined,
  ),
  QuickShortcut(
    label: "今日计划",
    prompt: "帮我拆解今天的计划，按优先级列出前三件事。",
    icon: Icons.format_list_bulleted,
  ),
  QuickShortcut(
    label: "情绪陪伴",
    prompt: "我现在有点累，先共情再给我一个小恢复方案。",
    icon: Icons.favorite_outline,
  ),
  QuickShortcut(
    label: "放松一下",
    prompt: "给我一个 10 分钟就能完成的放松小游戏。",
    icon: Icons.sports_esports_outlined,
  ),
  QuickShortcut(
    label: "生活提醒",
    prompt: "帮我做今天晚上到睡前的生活安排。",
    icon: Icons.nightlight_round,
  ),
  QuickShortcut(
    label: "复盘总结",
    prompt: "帮我复盘今天，给出 3 条温柔但有行动感的建议。",
    icon: Icons.auto_graph,
  ),
];

const List<CenterAction> kAriaServiceActions = <CenterAction>[
  CenterAction(
    title: "能力涌现",
    subtitle: "喂图+喂知识",
    icon: Icons.auto_awesome,
    description: "随时拍照或输入知识，交给女友自动消化整理并回注到脑系统。",
  ),
  CenterAction(
    title: "知识中心",
    subtitle: "PDF/文档仓",
    icon: Icons.library_books_outlined,
    description: "上传工作资料与文档，作为长期知识储备，可生成 PPT 和商业日记。",
  ),
  CenterAction(
    title: "日历记忆",
    subtitle: "行程与纪念日",
    icon: Icons.calendar_month_rounded,
    description: "统一管理你的日程、纪念日和周期性提醒。",
  ),
  CenterAction(
    title: "客户管理",
    subtitle: "关系分层",
    icon: Icons.groups_2_outlined,
    description: "沉淀客户画像、标签与触达策略，辅助你做跟进节奏。",
  ),
  CenterAction(
    title: "文件管理",
    subtitle: "分类检索",
    icon: Icons.folder_copy_outlined,
    description: "文档自动分类，支持按场景检索与要点摘要。",
  ),
  CenterAction(
    title: "相册管理",
    subtitle: "智能整理",
    icon: Icons.photo_library_outlined,
    description: "自动清理重复照片，按人物与场景聚合回忆。",
  ),
  CenterAction(
    title: "聊天交友",
    subtitle: "社交陪练",
    icon: Icons.forum_outlined,
    description: "提供开场白、回复建议和关系推进节奏。",
  ),
  CenterAction(
    title: "家庭生活",
    subtitle: "家人照护",
    icon: Icons.home_outlined,
    description: "围绕家庭事务、健康提醒和生活服务提供协助。",
  ),
  CenterAction(
    title: "商业日志",
    subtitle: "成长复盘",
    icon: Icons.sticky_note_2_outlined,
    description: "记录关键业务动作，自动生成周报与阶段复盘。",
  ),
];

const List<CenterAction> kConfigCenterActions = <CenterAction>[
  CenterAction(
    title: "硬件接入",
    subtitle: "设备权限",
    icon: Icons.memory_rounded,
    description: "管理麦克风、相机、系统自动化与设备执行权限。",
  ),
  CenterAction(
    title: "语音设置",
    subtitle: "通话参数",
    icon: Icons.call_outlined,
    description: "调整语速、音色、连麦模式与语音输入策略。",
  ),
  CenterAction(
    title: "模型路由",
    subtitle: "任务分配",
    icon: Icons.hub_outlined,
    description: "按任务类型设置模型优先级和回退策略。",
  ),
  CenterAction(
    title: "自动化策略",
    subtitle: "自主执行",
    icon: Icons.track_changes_outlined,
    description: "配置自动执行阈值、重试策略和任务熔断。",
  ),
  CenterAction(
    title: "隐私安全",
    subtitle: "访问边界",
    icon: Icons.privacy_tip_outlined,
    description: "管理敏感数据策略、审计日志与访问白名单。",
  ),
  CenterAction(
    title: "通知中心",
    subtitle: "触达偏好",
    icon: Icons.notifications_active_outlined,
    description: "统一设置消息提醒频率和紧急通知规则。",
  ),
  CenterAction(
    title: "备份恢复",
    subtitle: "状态保护",
    icon: Icons.backup_outlined,
    description: "保存当前配置快照，支持一键回滚到可用版本。",
  ),
  CenterAction(
    title: "扩展插件",
    subtitle: "技能市场",
    icon: Icons.extension_outlined,
    description: "管理第三方插件、签名校验和能力沙箱。",
  ),
  CenterAction(
    title: "系统诊断",
    subtitle: "故障排查",
    icon: Icons.health_and_safety_outlined,
    description: "查看网络、权限和执行链路的健康状态。",
  ),
];

class AriaMobileShell extends StatefulWidget {
  const AriaMobileShell({super.key});

  @override
  State<AriaMobileShell> createState() => _AriaMobileShellState();
}

class _AriaMobileShellState extends State<AriaMobileShell> {
  final DemoApiClient _actionApi = DemoApiClient();
  int _tabIndex = 0;
  CompanionScene _activeScene = kCompanionScenes.first;
  String _chatInjectedPrompt = "";
  int _chatInjectedToken = 0;

  @override
  void dispose() {
    _actionApi.dispose();
    super.dispose();
  }

  void _setScene(CompanionScene scene) {
    setState(() {
      _activeScene = scene;
      _tabIndex = 0;
    });
  }

  void _openScenePicker() {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: const Color(0xFFF9F4EE),
      builder: (BuildContext context) {
        return ScenePickerSheet(
          activeScene: _activeScene,
          onSelected: (CompanionScene scene) {
            Navigator.of(context).pop();
            _setScene(scene);
          },
        );
      },
    );
  }

  void _openVoiceCall() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) => VoiceCallPage(scene: _activeScene),
      ),
    );
  }

  void _injectPromptToChat(String prompt) {
    final String safe = prompt.trim();
    if (safe.isEmpty) {
      return;
    }
    setState(() {
      _tabIndex = 0;
      _chatInjectedPrompt = safe;
      _chatInjectedToken += 1;
    });
  }

  String _normalizeActionInput(CenterAction action, String input) {
    final String safe = input.trim();
    if (safe.isNotEmpty) {
      return safe;
    }
    return action.description;
  }

  Future<ActionExecutionResult> _executeCenterAction(
    CenterAction action,
    String input,
  ) async {
    final String content = _normalizeActionInput(action, input);
    switch (action.title) {
      case "能力涌现":
        await _actionApi.createMemory(content: "能力涌现输入：$content");
        await _actionApi.sendMessage(text: "请消化这条新输入并提炼可执行知识：$content");
        return const ActionExecutionResult(
          summary: "已写入脑系统并完成一次知识消化。",
        );
      case "知识中心":
        await _actionApi.createMemory(content: "知识中心资料：$content");
        await _actionApi.submitWorkbenchIntent(
          text: "基于以下资料生成可执行产出（PPT/商业日记/摘要）：$content",
          autoRun: true,
        );
        return const ActionExecutionResult(
          summary: "知识资料已入库，并触发工作台自动产出流程。",
        );
      case "日历记忆":
        await _actionApi.createMemory(content: "日历记忆：$content");
        return const ActionExecutionResult(summary: "日历记忆已写入。");
      case "客户管理":
        await _actionApi.createMemory(content: "客户管理记录：$content");
        await _actionApi.submitWorkbenchIntent(
          text: "请基于客户记录生成后续跟进计划：$content",
          autoRun: true,
        );
        return const ActionExecutionResult(summary: "客户记录已沉淀，并生成跟进计划。");
      case "文件管理":
        final DeviceTask? planned = await _actionApi.planDeviceTask(
          taskType: "desktop_focus_cleanup",
          payload: <String, dynamic>{
            "target": "workspace",
            "note": content,
            "source": "mobile-file-center",
          },
        );
        if (planned != null && planned.status == "planned") {
          await _actionApi.executeDeviceTask(taskId: planned.id);
        }
        return const ActionExecutionResult(summary: "文件整理任务已下发并执行。");
      case "相册管理":
        final DeviceTask? albumPlan = await _actionApi.planDeviceTask(
          taskType: "mobile_album_cleanup",
          payload: <String, dynamic>{
            "target": "camera-roll",
            "note": content,
            "source": "mobile-album-center",
          },
        );
        if (albumPlan != null && albumPlan.status == "planned") {
          await _actionApi.executeDeviceTask(taskId: albumPlan.id);
        }
        return const ActionExecutionResult(summary: "相册整理任务已执行。");
      case "聊天交友":
        return ActionExecutionResult(
          summary: "已生成社交陪练话术，并写入聊天输入区。",
          chatPrompt: "请帮我做一段自然开场，目标是：$content",
        );
      case "家庭生活":
        return ActionExecutionResult(
          summary: "已生成家庭生活执行方案，并写入聊天输入区。",
          chatPrompt: "请围绕家庭生活需求给我一套可执行安排：$content",
        );
      case "商业日志":
        await _actionApi.submitWorkbenchIntent(
          text: "请把以下内容整理为商业日志，并输出下一步执行建议：$content",
          autoRun: true,
        );
        return const ActionExecutionResult(summary: "商业日志流程已启动。");
      case "硬件接入":
        await _actionApi.updateDevicePermission(
          capabilityId: "desktop.global_control",
          status: "granted",
          reason: "mobile_config_center",
        );
        await _actionApi.updateDevicePermission(
          capabilityId: "mobile.photos_organize",
          status: "granted",
          reason: "mobile_config_center",
        );
        await _actionApi.fetchDeviceCapabilities();
        return const ActionExecutionResult(summary: "关键硬件权限已授权并同步。");
      case "语音设置":
        await _actionApi.runVoiceTts(
          text: "Aria 语音系统检测完成。",
          dryRun: true,
        );
        return const ActionExecutionResult(summary: "语音引擎检测通过。");
      case "模型路由":
        await _actionApi.syncSystemConfigAriaKernel(
          persist: true,
          mode: "merge",
          includeLocal: false,
        );
        return const ActionExecutionResult(summary: "模型路由已同步 Aria Kernel 配置。");
      case "自动化策略":
        await _actionApi.runAutonomyTick();
        await _actionApi.runAutonomyRepair();
        return const ActionExecutionResult(summary: "自治内核已执行巡检与自修复。");
      case "隐私安全":
        await _actionApi.fetchSystemConfig();
        return const ActionExecutionResult(summary: "隐私与安全策略已拉取，可继续在脑系统中微调。");
      case "通知中心":
        await _actionApi.reportEngagementEvent(
          type: "daily_checkin",
          metadata: <String, dynamic>{"source": "mobile-notification-center"},
        );
        return const ActionExecutionResult(summary: "通知触达偏好已同步。");
      case "备份恢复":
        await _actionApi.reloadSystemConfig();
        return const ActionExecutionResult(summary: "配置快照已重载，恢复链路可用。");
      case "扩展插件":
        await _actionApi.sendMessage(text: "请安装并校验扩展插件：$content");
        return const ActionExecutionResult(summary: "扩展插件任务已提交给自治调度。");
      case "系统诊断":
        await _actionApi.fetchHardwareStatus();
        await _actionApi.fetchAutonomyStatus();
        final Map<String, dynamic> playbook =
            await _actionApi.fetchAriaKernelIncidentPlaybook();
        final Map<String, dynamic> playbookData =
            playbook["playbook"] as Map<String, dynamic>? ??
                <String, dynamic>{};
        final int matchedCount =
            (playbookData["matchedCount"] as num?)?.toInt() ?? 0;
        final int totalIncidents =
            (playbookData["totalIncidents"] as num?)?.toInt() ?? 0;
        return ActionExecutionResult(
          summary: "系统诊断完成，已刷新硬件与自治状态；防复发手册命中 $matchedCount/$totalIncidents。",
        );
      default:
        await _actionApi.sendMessage(text: content);
        return const ActionExecutionResult(summary: "任务已提交。");
    }
  }

  void _openActionBrief(CenterAction action) {
    final TextEditingController inputController = TextEditingController();
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (BuildContext context) {
        bool running = false;
        String resultText = "";
        return StatefulBuilder(
          builder: (BuildContext context,
              void Function(void Function()) setSheetState) {
            Future<void> handleRun() async {
              if (running) {
                return;
              }
              setSheetState(() {
                running = true;
                resultText = "";
              });
              try {
                final ActionExecutionResult result = await _executeCenterAction(
                  action,
                  inputController.text,
                );
                if (!mounted) {
                  return;
                }
                setSheetState(() {
                  resultText = result.summary;
                });
                if (result.chatPrompt.trim().isNotEmpty) {
                  _injectPromptToChat(result.chatPrompt);
                }
              } catch (error) {
                if (!mounted) {
                  return;
                }
                setSheetState(() {
                  resultText = "执行失败：$error";
                });
              } finally {
                if (mounted) {
                  setSheetState(() {
                    running = false;
                  });
                }
              }
            }

            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 6, 20, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      action.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action.description,
                      style: const TextStyle(
                        fontSize: 14,
                        height: 1.45,
                        color: Color(0xFF5A4A40),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: inputController,
                      minLines: 1,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: "补充执行目标（可选）",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    if (resultText.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 10),
                      Text(
                        resultText,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF5A4A40),
                          height: 1.4,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: FilledButton(
                            onPressed: running ? null : handleRun,
                            child: Text(running ? "执行中..." : "立即执行"),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: running
                                ? null
                                : () => Navigator.of(context).pop(),
                            child: const Text("关闭"),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    ).whenComplete(inputController.dispose);
  }

  @override
  Widget build(BuildContext context) {
    final bool isKeyboardVisible = MediaQuery.viewInsetsOf(context).bottom > 0;
    return Scaffold(
      extendBody:
          !isKeyboardVisible, // Flow under navbar only when keyboard is hidden
      body: IndexedStack(
        index: _tabIndex,
        children: <Widget>[
          CompanionChatPage(
            scene: _activeScene,
            onOpenScenePicker: _openScenePicker,
            onOpenVoiceCall: _openVoiceCall,
            onOpenServiceCenter: () {
              setState(() {
                _tabIndex = 1;
              });
            },
            injectedPrompt: _chatInjectedPrompt,
            injectedPromptToken: _chatInjectedToken,
          ),
          ServiceCenterPage(onActionTap: _openActionBrief),
        ],
      ),
      bottomNavigationBar: isKeyboardVisible
          ? null
          : GlassContainer(
              opacity: 0.7,
              blur: 20,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
              child: NavigationBar(
                height: 70,
                backgroundColor: Colors.transparent,
                indicatorColor: const Color(0xFFF3EAE4),
                selectedIndex: _tabIndex,
                onDestinationSelected: (int value) {
                  setState(() {
                    _tabIndex = value;
                  });
                },
                destinations: const <NavigationDestination>[
                  NavigationDestination(
                    icon: Icon(Icons.chat_bubble_outline_rounded),
                    selectedIcon: Icon(Icons.chat_bubble_rounded,
                        color: Color(0xFFAD4B2D)),
                    label: "陪伴",
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.grid_view_rounded),
                    selectedIcon:
                        Icon(Icons.grid_view_rounded, color: Color(0xFFAD4B2D)),
                    label: "脑机",
                  ),
                ],
              ),
            ),
    );
  }
}

class CompanionChatPage extends StatefulWidget {
  const CompanionChatPage({
    super.key,
    required this.scene,
    required this.onOpenScenePicker,
    required this.onOpenVoiceCall,
    required this.onOpenServiceCenter,
    required this.injectedPrompt,
    required this.injectedPromptToken,
  });

  final CompanionScene scene;
  final VoidCallback onOpenScenePicker;
  final VoidCallback onOpenVoiceCall;
  final VoidCallback onOpenServiceCenter;
  final String injectedPrompt;
  final int injectedPromptToken;

  @override
  State<CompanionChatPage> createState() => _CompanionChatPageState();
}

class _CompanionChatPageState extends State<CompanionChatPage> {
  final DemoApiClient _api = DemoApiClient();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<DemoMessage> _messages = <DemoMessage>[];
  bool _loading = true;
  bool _sending = false;
  String _errorText = "";
  String get _activeSceneId => widget.scene.id.trim().toLowerCase();

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void didUpdateWidget(covariant CompanionChatPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.scene.id != widget.scene.id) {
      _appendLocalMessage(
        role: "aria",
        text: "已切换到「${widget.scene.title}」：${widget.scene.welcome}",
      );
    }
    if (oldWidget.injectedPromptToken != widget.injectedPromptToken) {
      final String prompt = widget.injectedPrompt.trim();
      if (prompt.isNotEmpty) {
        unawaited(_sendText(preset: prompt));
      }
    }
  }

  @override
  void dispose() {
    _api.dispose();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() {
      _loading = true;
      _errorText = "";
    });

    try {
      final DemoState state = await _api.fetchState();
      if (!mounted) {
        return;
      }
      final List<DemoMessage> scopedMessages =
          _filterMessagesByActiveScene(state.messages);
      setState(() {
        _messages = scopedMessages.isEmpty
            ? <DemoMessage>[_localBotMessage(widget.scene.welcome)]
            : scopedMessages;
      });
      _scrollToBottom();
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        if (_messages.isEmpty) {
          _messages = <DemoMessage>[_localBotMessage(widget.scene.welcome)];
        }
        _errorText = "同步失败：$error";
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  DemoMessage _localBotMessage(String text) {
    return DemoMessage(
      id: "bot-${DateTime.now().microsecondsSinceEpoch}",
      role: "aria",
      text: text,
      time: _timeNow(),
      scene: _activeSceneId,
    );
  }

  DemoMessage _localUserMessage(String text) {
    return DemoMessage(
      id: "user-${DateTime.now().microsecondsSinceEpoch}",
      role: "user",
      text: text,
      time: _timeNow(),
      scene: _activeSceneId,
    );
  }

  List<DemoMessage> _filterMessagesByActiveScene(List<DemoMessage> source) {
    final String activeScene = _activeSceneId;
    if (activeScene.isEmpty) {
      return source;
    }
    final List<DemoMessage> scoped = source.where((DemoMessage message) {
      final String scene = message.scene.trim().toLowerCase();
      return scene.isNotEmpty && scene == activeScene;
    }).toList(growable: false);
    if (scoped.isNotEmpty) {
      return scoped;
    }
    return source;
  }

  String _timeNow() {
    final DateTime now = DateTime.now();
    final String hour = now.hour.toString().padLeft(2, "0");
    final String minute = now.minute.toString().padLeft(2, "0");
    return "$hour:$minute";
  }

  void _appendLocalMessage({required String role, required String text}) {
    setState(() {
      _messages = <DemoMessage>[
        ..._messages,
        DemoMessage(
          id: "loc-${DateTime.now().microsecondsSinceEpoch}",
          role: role,
          text: text,
          time: _timeNow(),
          scene: _activeSceneId,
        ),
      ];
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      final double offset = _scrollController.position.maxScrollExtent + 120;
      _scrollController.animateTo(
        offset,
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _sendText({String? preset}) async {
    try {
      HapticFeedback.lightImpact();
    } catch (_) {
      // Ignore haptic errors on iOS Simulator (Missing hapticpatternlibrary.plist)
    }
    final String text = preset ?? _textController.text.trim();
    if (text.isEmpty || _sending) {
      return;
    }
    if (preset == null) {
      _textController.clear();
    }
    final String optimisticAriaId =
        "aria-${DateTime.now().microsecondsSinceEpoch}";

    setState(() {
      _errorText = "";
      _sending = true;
      _messages = <DemoMessage>[
        ..._messages,
        _localUserMessage(text),
        DemoMessage(
          id: optimisticAriaId,
          role: "aria",
          text: "",
          time: _timeNow(),
          scene: _activeSceneId,
        ),
      ];
    });
    _scrollToBottom();

    try {
      final DemoState state = await _api.sendMessageStream(
        text: text,
        scene: _activeSceneId,
        onChunk: (String fullText) {
          if (!mounted) {
            return;
          }
          final String nextText = fullText.trim();
          if (nextText.isEmpty) {
            return;
          }
          setState(() {
            _messages = _messages
                .map(
                  (DemoMessage item) => item.id == optimisticAriaId
                      ? DemoMessage(
                          id: item.id,
                          role: item.role,
                          text: nextText,
                          time: _timeNow(),
                          scene: item.scene,
                        )
                      : item,
                )
                .toList(growable: false);
          });
          _scrollToBottom();
        },
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _messages = _filterMessagesByActiveScene(state.messages);
      });
      _scrollToBottom();
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorText = "发送失败：$error";
        _messages = <DemoMessage>[
          ..._messages,
          _localBotMessage("我收到了，但网络刚刚抖了一下。再说一次？"),
        ];
      });
      _scrollToBottom();
    } finally {
      if (mounted) {
        setState(() {
          _sending = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: <Color>[widget.scene.gradientStart, widget.scene.gradientEnd],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: <Widget>[
            _ChatTopBar(
              scene: widget.scene,
              onHeartPressed: widget.onOpenScenePicker,
              onCallPressed: widget.onOpenVoiceCall,
            ),
            if (_errorText.isNotEmpty)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFE6DE),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _errorText,
                  style: const TextStyle(
                    color: Color(0xFF7F3A20),
                    fontSize: 12,
                  ),
                ),
              ),
            if (_errorText.isNotEmpty)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFAD4B2D).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: const Color(0xFFAD4B2D).withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded,
                        color: Color(0xFFAD4B2D), size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _errorText,
                        style: const TextStyle(
                          color: Color(0xFFAD4B2D),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded,
                          size: 18, color: Color(0xFFAD4B2D)),
                      onPressed: () => setState(() => _errorText = ""),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _MessageList(
                      messages: _messages,
                      sending: _sending,
                      controller: _scrollController,
                    ),
            ),
            _ComposerArea(
              controller: _textController,
              onSubmit: _sendText,
              onVoiceTap: widget.onOpenVoiceCall,
              onPlusTap: widget.onOpenServiceCenter,
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatTopBar extends StatelessWidget {
  const _ChatTopBar({
    required this.scene,
    required this.onHeartPressed,
    required this.onCallPressed,
  });

  final CompanionScene scene;
  final VoidCallback onHeartPressed;
  final VoidCallback onCallPressed;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      opacity: 0.4,
      blur: 15,
      borderRadius: const BorderRadius.only(
        bottomLeft: Radius.circular(24),
        bottomRight: Radius.circular(24),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(
          children: <Widget>[
            _CircleActionButton(
              icon: Icons.favorite_rounded,
              color: const Color(0xFFDE6A74),
              onTap: onHeartPressed,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(
                    scene.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF2D1F17),
                      letterSpacing: -0.5,
                    ),
                  ),
                  Row(
                    children: <Widget>[
                      const _OnlineDot(),
                      const SizedBox(width: 6),
                      Text(
                        scene.subtitle,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF7A6558),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            _CircleActionButton(
              icon: Icons.call_rounded,
              color: const Color(0xFF2E7A55),
              onTap: onCallPressed,
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleActionButton extends StatelessWidget {
  const _CircleActionButton({
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: const Color(0xFFE7D5C4)),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
      ),
    );
  }
}

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.messages,
    required this.sending,
    required this.controller,
  });

  final List<DemoMessage> messages;
  final bool sending;
  final ScrollController controller;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: controller,
      padding: const EdgeInsets.fromLTRB(16, 20, 16,
          20), // Reduced bottom padding because Composer area has dynamic padding
      itemCount: messages.length + (sending ? 1 : 0),
      itemBuilder: (BuildContext context, int index) {
        if (sending && index == messages.length) {
          return const _PulseTypingIndicator();
        }
        final DemoMessage msg = messages[index];
        final bool isUser = msg.role == "user";
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            mainAxisAlignment:
                isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              if (!isUser) ...<Widget>[
                const CircleAvatar(
                  radius: 14,
                  backgroundColor: Color(0xFFAD4B2D),
                  child:
                      Icon(Icons.auto_awesome, color: Colors.white, size: 16),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Container(
                  constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.72,
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: isUser
                        ? const LinearGradient(
                            colors: <Color>[
                              Color(0xFFE29F7A),
                              Color(0xFFAD4B2D)
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : null,
                    color: isUser ? null : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(20),
                      topRight: const Radius.circular(20),
                      bottomLeft: Radius.circular(isUser ? 20 : 4),
                      bottomRight: Radius.circular(isUser ? 4 : 20),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: (isUser ? const Color(0xFFAD4B2D) : Colors.black)
                            .withOpacity(0.08),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    msg.text,
                    style: TextStyle(
                      fontSize: 15,
                      height: 1.5,
                      color: isUser ? Colors.white : const Color(0xFF2D1F17),
                      fontWeight: isUser ? FontWeight.w500 : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ComposerArea extends StatelessWidget {
  const _ComposerArea({
    required this.controller,
    required this.onSubmit,
    required this.onVoiceTap,
    required this.onPlusTap,
  });

  final TextEditingController controller;
  final Future<void> Function({String? preset}) onSubmit;
  final VoidCallback onVoiceTap;
  final VoidCallback onPlusTap;

  @override
  Widget build(BuildContext context) {
    final bool isKeyboardVisible = MediaQuery.viewInsetsOf(context).bottom > 0;
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, isKeyboardVisible ? 12 : 92),
      child: GlassContainer(
        opacity: 0.8,
        blur: 25,
        borderRadius: BorderRadius.circular(32),
        color: const Color(0xFFFDF9F2),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  itemCount: kQuickShortcuts.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (BuildContext context, int index) {
                    final QuickShortcut action = kQuickShortcuts[index];
                    return Material(
                      color: Colors.white.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(20),
                      child: InkWell(
                        onTap: () => onSubmit(preset: action.prompt),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                                color: Colors.white.withOpacity(0.4)),
                          ),
                          child: Text(
                            action.label,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF867265),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: <Widget>[
                  const SizedBox(width: 4),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: controller,
                        onSubmitted: (_) => onSubmit(),
                        style: const TextStyle(fontSize: 15),
                        decoration: InputDecoration(
                          hintText: "跟 Aria 说说你的想法...",
                          hintStyle: const TextStyle(
                            color: Color(0xFFBEAEA1),
                            fontSize: 14,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  _OneTapVoiceButton(onTap: onVoiceTap),
                  _ComposerButton(
                    icon: Icons.add_circle_outline_rounded,
                    onTap: onPlusTap,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ComposerButton extends StatelessWidget {
  const _ComposerButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Icon(icon, color: const Color(0xFFB19B8C), size: 26),
        ),
      ),
    );
  }
}

class _OneTapVoiceButton extends StatelessWidget {
  const _OneTapVoiceButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: const LinearGradient(
              colors: <Color>[Color(0xFFE6A57D), Color(0xFFB25233)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: const Color(0xFFAD4B2D).withOpacity(0.25),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(Icons.mic_rounded, color: Colors.white, size: 18),
              SizedBox(width: 4),
              Text(
                "一键连麦",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ScenePickerSheet extends StatelessWidget {
  const ScenePickerSheet({
    super.key,
    required this.activeScene,
    required this.onSelected,
  });

  final CompanionScene activeScene;
  final ValueChanged<CompanionScene> onSelected;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Text(
                "切换陪伴场景",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF4A3A31),
                ),
              ),
            ),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.6,
              physics: const NeverScrollableScrollPhysics(),
              children: kCompanionScenes.map((CompanionScene scene) {
                final bool isActive = scene.id == activeScene.id;
                return InkWell(
                  onTap: () => onSelected(scene),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isActive ? Colors.white : const Color(0xFFF3EBE1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive
                            ? const Color(0xFFC28769)
                            : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: <Widget>[
                        CircleAvatar(
                          radius: 18,
                          backgroundImage: AssetImage(scene.imageAsset),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            scene.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isActive
                                  ? const Color(0xFF7A4D38)
                                  : const Color(0xFF6B584E),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class ServiceCenterPage extends StatelessWidget {
  const ServiceCenterPage({super.key, required this.onActionTap});

  final void Function(CenterAction) onActionTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFBF8F3), // Match scaffold color
      ),
      child: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: <Widget>[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const <Widget>[
                    Text(
                      "脑机中心",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF2D1F17),
                        letterSpacing: -1.0,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      "管理 Aria 的服务能力、硬件权限与自治配置。",
                      style: TextStyle(
                        fontSize: 14,
                        color: Color(0xFF7B6A5E),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverToBoxAdapter(
                child: _ServiceGridSection(
                  title: "Aria 服务能力",
                  subtitle: "实时记录、知识消化与任务调度",
                  actions: kAriaServiceActions,
                  onTap: onActionTap,
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              sliver: SliverToBoxAdapter(
                child: _ServiceGridSection(
                  title: "系统配置中心",
                  subtitle: "硬件管控、安全策略与内核同步",
                  actions: kConfigCenterActions,
                  onTap: onActionTap,
                ),
              ),
            ),
            const SliverToBoxAdapter(
                child: SizedBox(height: 120)), // Space for glass navbar
          ],
        ),
      ),
    );
  }
}

class _ServiceGridSection extends StatelessWidget {
  const _ServiceGridSection({
    required this.title,
    required this.subtitle,
    required this.actions,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final List<CenterAction> actions;
  final void Function(CenterAction) onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF342117),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF8A7669),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
            child: GridView.builder(
              itemCount: actions.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.95,
              ),
              itemBuilder: (BuildContext context, int index) {
                final CenterAction action = actions[index];
                return Material(
                  color: const Color(0xFFFBF8F3),
                  borderRadius: BorderRadius.circular(20),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(20),
                    onTap: () => onTap(action),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 10,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: <BoxShadow>[
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.03),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                            child: Icon(
                              action.icon,
                              size: 22,
                              color: Color(0xFFAD4B2D),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            action.title,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF4E3121),
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            action.subtitle,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Color(0xFF8A7669),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class VoiceCallPage extends StatefulWidget {
  const VoiceCallPage({super.key, required this.scene});

  final CompanionScene scene;

  @override
  State<VoiceCallPage> createState() => _VoiceCallPageState();
}

class _VoiceCallPageState extends State<VoiceCallPage>
    with SingleTickerProviderStateMixin {
  final DemoApiClient _api = DemoApiClient();
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  Timer? _durationTimer;
  Timer? _listenRestartTimer;
  Timer? _channelHeartbeatTimer;
  bool _engineReady = false;
  bool _callActive = false;
  bool _listening = false;
  bool _busy = false;
  bool _muted = false;
  bool _speakerOn = true;
  int _elapsedSeconds = 0;
  int _voiceLeaseMs = 30000;
  String _voiceChannelToken = "";
  String _voiceChannelOwner = "";

  String _statusText = "正在初始化语音引擎...";
  String _partialText = "";
  String _lastRecognizedFinal = "";
  List<CallTimelineEntry> _timeline = <CallTimelineEntry>[];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _setupVoiceEngine();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _durationTimer?.cancel();
    _listenRestartTimer?.cancel();
    _channelHeartbeatTimer?.cancel();
    _speech.stop();
    _speech.cancel();
    _tts.stop();
    unawaited(_releaseVoiceChannelLock().whenComplete(_api.dispose));
    super.dispose();
  }

  String _timeNow() {
    final DateTime now = DateTime.now();
    final String hour = now.hour.toString().padLeft(2, "0");
    final String minute = now.minute.toString().padLeft(2, "0");
    return "$hour:$minute";
  }

  String _durationText() {
    final int minutes = _elapsedSeconds ~/ 60;
    final int seconds = _elapsedSeconds % 60;
    return "${minutes.toString().padLeft(2, "0")}:${seconds.toString().padLeft(2, "0")}";
  }

  void _addTimeline({required String role, required String text}) {
    setState(() {
      _timeline = <CallTimelineEntry>[
        ..._timeline,
        CallTimelineEntry(role: role, text: text, time: _timeNow()),
      ];
      if (_timeline.length > 20) {
        _timeline = _timeline.sublist(_timeline.length - 20);
      }
    });
  }

  String _buildVoiceChannelOwner() {
    final String sceneId =
        widget.scene.id.trim().isEmpty ? "default" : widget.scene.id.trim();
    return "aria-mobile:$sceneId:${DateTime.now().millisecondsSinceEpoch}";
  }

  void _startVoiceChannelHeartbeat() {
    _channelHeartbeatTimer?.cancel();
    if (_voiceChannelToken.isEmpty || _voiceLeaseMs <= 0) {
      return;
    }
    final int intervalMs = (_voiceLeaseMs * 0.6).round().clamp(5000, 15000);
    _channelHeartbeatTimer =
        Timer.periodic(Duration(milliseconds: intervalMs), (_) async {
      if (!mounted || _voiceChannelToken.isEmpty) {
        return;
      }
      try {
        final VoiceChannelControlResult renewed = await _api.renewVoiceChannel(
          token: _voiceChannelToken,
          leaseMs: _voiceLeaseMs,
        );
        if (!mounted) {
          return;
        }
        if (renewed.ok && renewed.channel != null) {
          final int leaseMs = renewed.channel!.leaseMs;
          if (leaseMs > 0) {
            _voiceLeaseMs = leaseMs;
          }
          return;
        }
        setState(() {
          _statusText = renewed.summary.isNotEmpty
              ? "语音通道续租异常：${renewed.summary}"
              : "语音通道续租异常，正在自动重试。";
        });
      } catch (error) {
        if (!mounted) {
          return;
        }
        setState(() {
          _statusText = "语音通道续租失败：$error";
        });
      }
    });
  }

  Future<bool> _acquireVoiceChannelLock() async {
    _voiceChannelOwner = _buildVoiceChannelOwner();
    final VoiceChannelControlResult acquired = await _api.acquireVoiceChannel(
      owner: _voiceChannelOwner,
      leaseMs: _voiceLeaseMs,
      client: "aria-mobile",
    );
    if (!acquired.ok || acquired.channel == null || !acquired.channel!.active) {
      final String holder = acquired.channel?.owner.trim() ?? "";
      final String busyHint = holder.isEmpty ? "" : "（当前占用：$holder）";
      final String summary = acquired.summary.trim();
      setState(() {
        _statusText = summary.isNotEmpty
            ? "语音通道不可用：$summary$busyHint"
            : "语音通道不可用$busyHint";
      });
      return false;
    }
    _voiceChannelToken = acquired.channel!.token.trim();
    final int leaseMs = acquired.channel!.leaseMs;
    if (leaseMs > 0) {
      _voiceLeaseMs = leaseMs;
    }
    _startVoiceChannelHeartbeat();
    return _voiceChannelToken.isNotEmpty;
  }

  Future<void> _releaseVoiceChannelLock() async {
    _channelHeartbeatTimer?.cancel();
    _channelHeartbeatTimer = null;
    final String token = _voiceChannelToken.trim();
    _voiceChannelToken = "";
    if (token.isEmpty) {
      return;
    }
    try {
      await _api.releaseVoiceChannel(token: token);
    } catch (_) {
      // Ignore release failures during teardown.
    }
  }

  Future<void> _setupVoiceEngine() async {
    try {
      await _tts.awaitSpeakCompletion(true);
      await _tts.setLanguage("zh-CN");
      await _tts.setSpeechRate(0.48);
      await _tts.setPitch(1.0);
      await _tts.setVolume(1.0);

      // Best effort for iOS audio session
      try {
        await _tts.setIosAudioCategory(
          IosTextToSpeechAudioCategory.playAndRecord,
          <IosTextToSpeechAudioCategoryOptions>[
            IosTextToSpeechAudioCategoryOptions.defaultToSpeaker,
            IosTextToSpeechAudioCategoryOptions.allowBluetooth,
            IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
          ],
          IosTextToSpeechAudioMode.voiceChat,
        );
      } catch (_) {
        // Ignore if platform doesn't support or category fails
      }

      final bool available = await _speech.initialize(
        onStatus: _onSpeechStatus,
        onError: (dynamic error) {
          if (!mounted) {
            return;
          }
          setState(() {
            _listening = false;
            _statusText = "语音识别报错：$error";
          });
          _restartListeningSoon(delayMs: 1200);
        },
      );

      if (!mounted) {
        return;
      }

      if (!available) {
        setState(() {
          _engineReady = false;
          _statusText = "麦克风或语音权限被拒绝，请在系统设置中手动开启。";
        });
        return;
      }

      final bool channelReady = await _acquireVoiceChannelLock();
      if (!mounted) {
        return;
      }
      if (!channelReady) {
        setState(() {
          _engineReady = false;
          _callActive = false;
        });
        return;
      }

      setState(() {
        _engineReady = true;
        _callActive = true;
        _statusText = "实时语音通话已建立，正在聆听...";
        _timeline = <CallTimelineEntry>[
          CallTimelineEntry(
            role: "aria",
            text: "我在线了，你可以直接说话。",
            time: _timeNow(),
          ),
        ];
      });

      _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted || !_callActive) {
          return;
        }
        setState(() {
          _elapsedSeconds += 1;
        });
      });

      await _startListening();
    } catch (e) {
      await _releaseVoiceChannelLock();
      if (mounted) {
        setState(() {
          _statusText = "引擎初始化失败：$e";
        });
      }
    }
  }

  void _onSpeechStatus(String status) {
    if (!mounted) {
      return;
    }
    final String normalized = status.toLowerCase();
    if (normalized == "listening") {
      setState(() {
        _listening = true;
        if (!_busy) {
          _statusText = "正在聆听你说话...";
        }
      });
      return;
    }

    if (normalized == "done" || normalized == "notlistening") {
      setState(() {
        _listening = false;
      });
      _restartListeningSoon();
    }
  }

  void _restartListeningSoon({int delayMs = 380}) {
    if (!_callActive || !_engineReady || _muted || _busy || _listening) {
      return;
    }
    _listenRestartTimer?.cancel();
    _listenRestartTimer = Timer(Duration(milliseconds: delayMs), () {
      if (!mounted) {
        return;
      }
      _startListening();
    });
  }

  Future<void> _startListening() async {
    if (!_engineReady || !_callActive || _muted || _busy || _listening) {
      return;
    }

    await _speech.listen(
      onResult: _onSpeechResult,
      localeId: "zh_CN",
      pauseFor: const Duration(seconds: 2),
      listenFor: const Duration(minutes: 10),
      listenOptions: stt.SpeechListenOptions(
        partialResults: true,
        cancelOnError: false,
        listenMode: stt.ListenMode.dictation,
      ),
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _listening = true;
      _statusText = "正在聆听你说话...";
    });
  }

  Future<void> _onSpeechResult(dynamic result) async {
    if (!mounted || !_callActive) {
      return;
    }

    final String recognized = (result.recognizedWords as String? ?? "").trim();
    setState(() {
      _partialText = recognized;
    });

    final bool finalResult = result.finalResult == true;
    if (!finalResult || recognized.isEmpty) {
      return;
    }
    if (recognized == _lastRecognizedFinal) {
      return;
    }
    _lastRecognizedFinal = recognized;

    await _speech.stop();
    await _sendSpeechToAria(recognized);
  }

  String _extractLatestAriaReply(List<DemoMessage> messages) {
    for (int i = messages.length - 1; i >= 0; i -= 1) {
      final DemoMessage message = messages[i];
      if (message.role.toLowerCase() != "user") {
        return message.text.trim();
      }
    }
    return "";
  }

  Future<void> _sendSpeechToAria(String text) async {
    if (_busy || !_callActive) {
      return;
    }

    setState(() {
      _busy = true;
      _listening = false;
      _partialText = "";
      _statusText = "正在理解你的话...";
    });

    _addTimeline(role: "user", text: text);

    try {
      final DemoState state = await _api.sendMessageStream(
        text: text,
        scene: widget.scene.id.trim().toLowerCase(),
        onChunk: (String fullText) {
          if (!mounted) {
            return;
          }
          if (fullText.trim().isEmpty) {
            return;
          }
          setState(() {
            _statusText = "Aria 正在实时回复...";
          });
        },
      );
      final String reply = _extractLatestAriaReply(state.messages);
      final String safeReply = reply.isEmpty ? "我在，你刚刚说的我听到了。" : reply;
      _addTimeline(role: "aria", text: safeReply);
      if (mounted) {
        setState(() {
          _statusText = "Aria 正在回复...";
        });
      }
      await _tts.speak(safeReply);
      if (mounted) {
        setState(() {
          _statusText = "通话中";
        });
      }
    } catch (error) {
      const String fallback = "网络刚刚波动了，我还在，继续说我能听到。";
      _addTimeline(role: "aria", text: fallback);
      if (mounted) {
        setState(() {
          _statusText = "通话异常：$error";
        });
      }
      await _tts.speak(fallback);
    } finally {
      if (mounted) {
        setState(() {
          _busy = false;
        });
        _restartListeningSoon(delayMs: 420);
      }
    }
  }

  Future<void> _toggleMute() async {
    setState(() {
      _muted = !_muted;
    });
    if (_muted) {
      await _speech.stop();
      if (mounted) {
        setState(() {
          _listening = false;
          _statusText = "你已静音";
        });
      }
    } else {
      if (mounted) {
        setState(() {
          _statusText = "静音已关闭，继续聆听...";
        });
      }
      _restartListeningSoon();
    }
  }

  Future<void> _toggleSpeaker() async {
    setState(() {
      _speakerOn = !_speakerOn;
    });
    await _tts.setVolume(_speakerOn ? 1.0 : 0.2);
    if (mounted) {
      setState(() {
        _statusText = _speakerOn ? "扬声器已开启" : "已切换为听筒音量";
      });
    }
  }

  Future<void> _hangUp() async {
    setState(() {
      _callActive = false;
      _statusText = "通话已结束";
    });
    _durationTimer?.cancel();
    _listenRestartTimer?.cancel();
    _channelHeartbeatTimer?.cancel();
    await _speech.stop();
    await _tts.stop();
    await _releaseVoiceChannelLock();
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[
              widget.scene.gradientStart,
              widget.scene.gradientEnd,
              widget.scene.gradientStart.withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: <Widget>[
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: <Widget>[
                    GlassContainer(
                      blur: 10,
                      opacity: 0.2,
                      borderRadius: BorderRadius.circular(999),
                      child: IconButton(
                        onPressed: _hangUp,
                        icon: const Icon(
                          Icons.arrow_back_rounded,
                          color: Color(0xFF5B463A),
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Text(
                      "实时通话",
                      style: TextStyle(
                        color: Color(0xFF2D1F17),
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const Spacer(),
                    const SizedBox(width: 48),
                  ],
                ),
              ),
              const Spacer(flex: 2),
              ScaleTransition(
                scale: _callActive
                    ? _pulseAnimation
                    : const AlwaysStoppedAnimation<double>(1.0),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white.withOpacity(0.4),
                      width: 2,
                    ),
                  ),
                  child: CircleAvatar(
                    radius: 82,
                    backgroundColor: Colors.white,
                    child: CircleAvatar(
                      radius: 78,
                      backgroundImage: AssetImage(widget.scene.imageAsset),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                "Aria · ${widget.scene.title}",
                style: const TextStyle(
                  color: Color(0xFF2D1F17),
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              GlassContainer(
                blur: 8,
                opacity: 0.3,
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  child: Text(
                    _engineReady ? "通话中 · ${_durationText()}" : "连接中...",
                    style: const TextStyle(
                      color: Color(0xFF4A3A31),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Text(
                  _statusText,
                  style: const TextStyle(
                    color: Color(0xFF6A5447),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              if (_partialText.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                  child: GlassContainer(
                    blur: 5,
                    opacity: 0.1,
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text(
                        _partialText,
                        style: const TextStyle(
                          color: Color(0xFF4A3A31),
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
              const Spacer(flex: 1),
              Container(
                height: 140,
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: GlassContainer(
                  opacity: 0.25,
                  blur: 20,
                  borderRadius: BorderRadius.circular(24),
                  child: _timeline.isEmpty
                      ? const Center(
                          child: Text(
                            "语音对话记录将在此同步...",
                            style: TextStyle(
                              color: Color(0xFF7A675A),
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _timeline.length,
                          itemBuilder: (BuildContext context, int index) {
                            final CallTimelineEntry entry = _timeline[index];
                            final bool isUser = entry.role == "user";
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Text(
                                    "${isUser ? "你" : "Aria"} • ",
                                    style: TextStyle(
                                      color: isUser
                                          ? const Color(0xFF744E39)
                                          : const Color(0xFFAD4B2D),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      entry.text,
                                      style: const TextStyle(
                                        color: Color(0xFF2D1F17),
                                        fontSize: 13,
                                        height: 1.4,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ),
              const Spacer(flex: 3),
              Padding(
                padding: const EdgeInsets.fromLTRB(28, 0, 28, 48),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: <Widget>[
                    _CallActionButton(
                      icon: _muted ? Icons.mic_off_rounded : Icons.mic_rounded,
                      label: _muted ? "已静音" : "静音",
                      active: _muted,
                      onTap: _toggleMute,
                    ),
                    _CallActionButton(
                      icon: _speakerOn
                          ? Icons.volume_up_rounded
                          : Icons.hearing_disabled_rounded,
                      label: _speakerOn ? "扬声器" : "听筒",
                      active: _speakerOn,
                      onTap: _toggleSpeaker,
                    ),
                    _CallActionButton(
                      icon: Icons.call_end_rounded,
                      label: "挂断",
                      active: true,
                      danger: true,
                      onTap: _hangUp,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CallActionButton extends StatelessWidget {
  const _CallActionButton({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final Color bg = danger
        ? const Color(0xFFE95E55)
        : active
            ? Colors.white
            : Colors.white.withValues(alpha: 0.24);
    final Color fg = danger
        ? Colors.white
        : active
            ? const Color(0xFF6D3F2F)
            : const Color(0xFF5B463A);

    return Column(
      children: <Widget>[
        Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(999),
            onTap: onTap,
            child: Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: bg,
                shape: BoxShape.circle,
                border: Border.all(
                  color: danger ? const Color(0xFFFFB3AE) : Colors.white54,
                ),
              ),
              child: Icon(icon, color: fg, size: 28),
            ),
          ),
        ),
        const SizedBox(height: 7),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF5A453A), fontSize: 12),
        ),
      ],
    );
  }
}

class _OnlineDot extends StatefulWidget {
  const _OnlineDot();

  @override
  State<_OnlineDot> createState() => _OnlineDotState();
}

class _OnlineDotState extends State<_OnlineDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: const Color(0xFF42C83C),
          shape: BoxShape.circle,
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: const Color(0xFF42C83C).withOpacity(0.5),
              blurRadius: 4,
              spreadRadius: 1,
            ),
          ],
        ),
      ),
    );
  }
}

class _PulseTypingIndicator extends StatefulWidget {
  const _PulseTypingIndicator();

  @override
  State<_PulseTypingIndicator> createState() => _PulseTypingIndicatorState();
}

class _PulseTypingIndicatorState extends State<_PulseTypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: <Widget>[
            CircleAvatar(
              radius: 14,
              backgroundColor: Color(0xFFAD4B2D),
              child: Icon(Icons.auto_awesome, color: Colors.white, size: 16),
            ),
            SizedBox(width: 8),
            Text(
              "Aria 正在思考...",
              style: TextStyle(
                fontSize: 13,
                color: Color(0xFF8D7E72),
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
