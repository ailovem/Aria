import { existsSync } from "node:fs";
import { resolve } from "node:path";

function sanitizeVoiceName(input, fallback) {
  const value = String(input || "").trim();
  if (!value) {
    return fallback;
  }
  if (value.length > 80 || /[\r\n\t]/.test(value)) {
    return fallback;
  }
  return value;
}

export const adapter = {
  id: "voice",
  name: "Voice Runtime",
  capabilities: [
    {
      id: "desktop.speaker_tts",
      platform: "desktop",
      name: "桌面语音播报",
      risk: "low"
    },
    {
      id: "desktop.microphone_access",
      platform: "desktop",
      name: "桌面麦克风输入",
      risk: "high"
    },
    {
      id: "mobile.voice_assistant",
      platform: "mobile",
      name: "手机语音助手",
      risk: "medium"
    }
  ],
  actions: {
    "voice.tts": async ({ payload, runCommand, policy }) => {
      const text = String(payload?.text || "").trim();
      if (!text) {
        return {
          ok: false,
          reason: "text_required",
          summary: "语音播报失败：缺少 text。"
        };
      }

      const defaultVoice = String(policy?.voice?.defaultVoice || "Flo (中文（中国大陆）)");
      const defaultRate = Number(policy?.voice?.defaultRate || 178);
      const voice = sanitizeVoiceName(payload?.voice, defaultVoice);
      const rate = Number.isFinite(Number(payload?.rate))
        ? Math.max(120, Math.min(320, Number(payload.rate)))
        : defaultRate;
      const dryRun = payload?.dryRun === true;

      if (dryRun) {
        return {
          ok: true,
          summary: "语音播报 dry-run 完成。",
          metrics: {
            characters: text.length,
            rate,
            selectedVoice: voice
          },
          command: {
            bin: "say",
            args: ["-v", voice, "-r", String(rate), text]
          }
        };
      }

      const fallbackVoiceCandidates = Array.from(
        new Set([
          voice,
          defaultVoice,
          "Flo (中文（中国大陆）)",
          "Meijia",
          "Tingting"
        ].map((item) => String(item || "").trim()).filter(Boolean))
      );
      let lastTts = null;
      let selectedVoice = "";
      for (const candidate of fallbackVoiceCandidates) {
        const tts = await runCommand("say", ["-v", candidate, "-r", String(rate), text], {
          ignoreError: true,
          timeoutMs: 45000
        });
        lastTts = tts;
        if (tts.ok) {
          selectedVoice = candidate;
          break;
        }
      }

      if (!selectedVoice) {
        return {
          ok: false,
          reason: "tts_failed",
          summary: "语音播报失败，请检查系统语音权限。",
          error: lastTts?.error || lastTts?.stderr || "",
          triedVoices: fallbackVoiceCandidates
        };
      }

      return {
        ok: true,
        summary: "语音播报完成。",
        metrics: {
          characters: text.length,
          rate,
          selectedVoice
        }
      };
    },

    "voice.stt": async ({ payload, runCommand, policy }) => {
      if (policy?.voice?.allowMicCapture === false) {
        return {
          ok: false,
          reason: "mic_capture_disabled",
          summary: "策略禁止麦克风采集。"
        };
      }

      const audioPath = String(payload?.audioPath || "").trim();
      if (!audioPath) {
        return {
          ok: false,
          reason: "audio_path_required",
          summary: "语音转文字失败：缺少 audioPath。"
        };
      }
      const resolved = resolve(audioPath);
      if (!existsSync(resolved)) {
        return {
          ok: false,
          reason: "audio_file_missing",
          summary: "语音转文字失败：音频文件不存在。"
        };
      }

      const whisper = await runCommand("whisper", ["--help"], {
        ignoreError: true,
        timeoutMs: 5000
      });
      if (!whisper.ok) {
        return {
          ok: false,
          reason: "whisper_missing",
          summary: "未安装 whisper CLI，暂无法执行离线 STT。",
          hint: "安装示例：pip install -U openai-whisper"
        };
      }

      const language = String(payload?.language || "zh");
      const model = String(payload?.model || "base");
      const outputDir = "/tmp";
      const stt = await runCommand(
        "whisper",
        [
          resolved,
          "--language",
          language,
          "--model",
          model,
          "--output_dir",
          outputDir,
          "--output_format",
          "txt"
        ],
        {
          ignoreError: true,
          timeoutMs: 180000
        }
      );

      if (!stt.ok) {
        return {
          ok: false,
          reason: "stt_failed",
          summary: "语音转文字失败。",
          error: stt.error || stt.stderr || ""
        };
      }

      return {
        ok: true,
        summary: "语音转文字已完成（结果保存在 /tmp 输出文件）。",
        metrics: {
          model,
          language
        },
        raw: stt.stdout.slice(0, 5000)
      };
    }
  }
};
