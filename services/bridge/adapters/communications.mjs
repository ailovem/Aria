import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const MOBILE_RELAY_FILE = resolve(
  String(process.env.ARIA_MOBILE_RELAY_FILE || "")
    .trim()
    .replace(/^~(?=\/)/, process.env.HOME || "~")
    || resolve(process.env.HOME || ".", ".aria/mobile-relay.json")
);

function parseInteger(text, fallback = 0) {
  const value = Number.parseInt(String(text || "").trim(), 10);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

function parseBoolean(value, fallback = false) {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) {
    return fallback;
  }
  if (["1", "true", "yes", "on", "enabled"].includes(text)) {
    return true;
  }
  if (["0", "false", "no", "off", "disabled"].includes(text)) {
    return false;
  }
  return fallback;
}

function normalizeChannel(input) {
  const text = String(input || "").trim().toLowerCase();
  if (!text) {
    return "";
  }
  if (text.includes("feishu") || text.includes("lark") || text.includes("飞书")) {
    return "feishu_webhook";
  }
  if (text.includes("mobile") || text.includes("ios") || text.includes("手机") || text.includes("app")) {
    return "mobile_link";
  }
  if (text.includes("email") || text.includes("mail") || text.includes("邮件") || text.includes("邮箱")) {
    return "email";
  }
  return text;
}

function readMobileRelayState() {
  if (!existsSync(MOBILE_RELAY_FILE)) {
    return {
      outbox: []
    };
  }
  try {
    const parsed = JSON.parse(readFileSync(MOBILE_RELAY_FILE, "utf8"));
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.outbox)) {
      return {
        outbox: []
      };
    }
    return parsed;
  } catch {
    return {
      outbox: []
    };
  }
}

function writeMobileRelayState(state) {
  mkdirSync(dirname(MOBILE_RELAY_FILE), {
    recursive: true
  });
  writeFileSync(MOBILE_RELAY_FILE, JSON.stringify(state, null, 2), "utf8");
}

function appendMobileRelayMessage(payload = {}) {
  const relay = readMobileRelayState();
  relay.outbox.unshift({
    id: `relay-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    channel: "mobile_link",
    recipient: String(payload.recipient || "mobile-app"),
    message: String(payload.message || ""),
    attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
    createdAt: new Date().toISOString()
  });
  if (relay.outbox.length > 200) {
    relay.outbox.length = 200;
  }
  writeMobileRelayState(relay);
  return relay.outbox[0];
}

function composeChannelText(message, attachments = []) {
  const base = String(message || "").trim();
  const attachmentLines = Array.isArray(attachments)
    ? attachments
        .map((item) => {
          const filePath = String(item?.path || "").trim();
          if (!filePath) {
            return "";
          }
          const title = String(item?.title || "").trim();
          return title ? `${title}: ${filePath}` : filePath;
        })
        .filter(Boolean)
    : [];
  if (attachmentLines.length === 0) {
    return base;
  }
  return [base || "任务附件如下：", ...attachmentLines.map((line) => `- ${line}`)].join("\n");
}

function parseEmailRecipients(input = "") {
  const text = String(input || "").trim();
  if (!text) {
    return [];
  }
  const directMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const dedup = new Set();
  for (const item of directMatches) {
    const normalized = String(item || "").trim().toLowerCase();
    if (!normalized) {
      continue;
    }
    dedup.add(normalized);
  }
  if (dedup.size > 0) {
    return Array.from(dedup).slice(0, 12);
  }
  const fallback = text
    .split(/[，,;；\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(item));
  return Array.from(new Set(fallback)).slice(0, 12);
}

function escapeAppleScriptString(valueInput = "") {
  return String(valueInput || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"");
}

function buildAppleScriptList(valuesInput = []) {
  const values = Array.isArray(valuesInput) ? valuesInput : [];
  if (values.length === 0) {
    return "{}";
  }
  return `{${values.map((item) => `"${escapeAppleScriptString(item)}"`).join(", ")}}`;
}

function resolveSmtpConfig(payload = {}) {
  const smtpPayload = payload?.smtp && typeof payload.smtp === "object" ? payload.smtp : {};
  const url = String(
    smtpPayload.url
    || payload.smtpUrl
    || process.env.ARIA_SMTP_URL
    || ""
  ).trim();
  const host = String(
    smtpPayload.host
    || payload.smtpHost
    || process.env.ARIA_SMTP_HOST
    || ""
  ).trim();
  const secure = parseBoolean(
    smtpPayload.secure
    ?? payload.smtpSecure
    ?? process.env.ARIA_SMTP_SECURE,
    false
  );
  const port = parseInteger(
    smtpPayload.port
    ?? payload.smtpPort
    ?? process.env.ARIA_SMTP_PORT,
    secure ? 465 : 587
  );
  const user = String(
    smtpPayload.user
    || payload.smtpUser
    || process.env.ARIA_SMTP_USER
    || ""
  ).trim();
  const pass = String(
    smtpPayload.pass
    || payload.smtpPass
    || process.env.ARIA_SMTP_PASS
    || ""
  ).trim();
  const from = String(
    smtpPayload.from
    || payload.from
    || process.env.ARIA_SMTP_FROM
    || user
    || ""
  ).trim();
  const requireTLS = parseBoolean(
    smtpPayload.requireTLS
    ?? payload.smtpRequireTLS
    ?? process.env.ARIA_SMTP_REQUIRE_TLS,
    false
  );
  const rejectUnauthorized = !parseBoolean(
    smtpPayload.ignoreTLSReject
    ?? payload.smtpIgnoreTLSReject
    ?? process.env.ARIA_SMTP_IGNORE_TLS_REJECT,
    false
  );
  return {
    url,
    host,
    port,
    secure,
    user,
    pass,
    from,
    requireTLS,
    rejectUnauthorized
  };
}

function smtpConfigAvailable(config = {}) {
  const url = String(config?.url || "").trim();
  const host = String(config?.host || "").trim();
  const from = String(config?.from || "").trim();
  if (url) {
    return Boolean(from);
  }
  return Boolean(host && from);
}

function normalizeEmailAttachments(attachmentsInput = []) {
  const attachments = Array.isArray(attachmentsInput) ? attachmentsInput : [];
  return attachments
    .map((item) => {
      const filePath = String(item?.path || "").trim();
      if (!filePath || !existsSync(filePath)) {
        return null;
      }
      const title = String(item?.title || "").trim();
      return {
        filename: title || basename(filePath),
        path: filePath
      };
    })
    .filter(Boolean)
    .slice(0, 10);
}

async function sendEmailViaSmtp(payload = {}) {
  const recipients = parseEmailRecipients(payload?.recipient || "");
  if (recipients.length === 0) {
    return {
      ok: false,
      reason: "email_recipient_required",
      summary: "邮件发送失败：缺少有效收件人邮箱。"
    };
  }
  const subject = String(payload?.subject || "Aria 自动邮件回执").trim().slice(0, 180) || "Aria 自动邮件回执";
  const message = composeChannelText(payload?.message, payload?.attachments);
  if (!message) {
    return {
      ok: false,
      reason: "message_required",
      summary: "邮件发送失败：消息内容为空。"
    };
  }
  const smtpConfig = resolveSmtpConfig(payload);
  if (!smtpConfigAvailable(smtpConfig)) {
    return {
      ok: false,
      reason: "smtp_not_configured",
      summary: "SMTP 未配置：请设置 ARIA_SMTP_HOST/ARIA_SMTP_FROM（或 ARIA_SMTP_URL）。"
    };
  }
  let nodemailer;
  try {
    const imported = await import("nodemailer");
    nodemailer = imported?.default || imported;
  } catch (error) {
    return {
      ok: false,
      reason: "smtp_dependency_missing",
      summary: "SMTP 发送失败：缺少 nodemailer 依赖。",
      error: error instanceof Error ? error.message : String(error)
    };
  }

  const transportOptions = smtpConfig.url
    ? {
        url: smtpConfig.url,
        requireTLS: smtpConfig.requireTLS,
        tls: {
          rejectUnauthorized: smtpConfig.rejectUnauthorized
        }
      }
    : {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.user
          ? {
              user: smtpConfig.user,
              pass: smtpConfig.pass
            }
          : undefined,
        requireTLS: smtpConfig.requireTLS,
        tls: {
          rejectUnauthorized: smtpConfig.rejectUnauthorized
        }
      };
  let transporter;
  try {
    transporter = smtpConfig.url
      ? nodemailer.createTransport(smtpConfig.url, {
          requireTLS: smtpConfig.requireTLS,
          tls: {
            rejectUnauthorized: smtpConfig.rejectUnauthorized
          }
        })
      : nodemailer.createTransport(transportOptions);
  } catch (error) {
    return {
      ok: false,
      reason: "smtp_transport_invalid",
      summary: "SMTP 发送失败：传输配置无效。",
      error: error instanceof Error ? error.message : String(error)
    };
  }

  const attachments = normalizeEmailAttachments(payload?.attachments);
  try {
    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to: recipients.join(", "),
      subject,
      text: message,
      attachments
    });
    return {
      ok: true,
      reason: "email_sent_smtp",
      summary: `邮件发送成功（SMTP）：${recipients.length} 位收件人。`,
      delivery: {
        channel: "email",
        provider: "smtp",
        recipients,
        subject,
        attachments: attachments.length,
        messageId: String(info?.messageId || "").trim()
      }
    };
  } catch (error) {
    return {
      ok: false,
      reason: "smtp_send_failed",
      summary: "SMTP 发送失败：请检查账号、密码、端口与 TLS 配置。",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function sendEmailViaAppleMail(runCommand, payload = {}) {
  if (typeof runCommand !== "function") {
    return {
      ok: false,
      reason: "mail_runtime_unavailable",
      summary: "邮件发送失败：当前通道未注入命令执行器。"
    };
  }
  const recipients = parseEmailRecipients(payload?.recipient || "");
  if (recipients.length === 0) {
    return {
      ok: false,
      reason: "email_recipient_required",
      summary: "邮件发送失败：缺少有效收件人邮箱。"
    };
  }
  const subject = String(payload?.subject || "Aria 自动邮件回执").trim().slice(0, 180) || "Aria 自动邮件回执";
  const message = composeChannelText(payload?.message, payload?.attachments);
  if (!message) {
    return {
      ok: false,
      reason: "message_required",
      summary: "邮件发送失败：消息内容为空。"
    };
  }
  const validAttachments = (Array.isArray(payload?.attachments) ? payload.attachments : [])
    .map((item) => String(item?.path || "").trim())
    .filter((item) => item && existsSync(item))
    .slice(0, 8);
  const recipientsLiteral = buildAppleScriptList(recipients);
  const attachmentLiteral = buildAppleScriptList(validAttachments);
  const script = `
set recipientList to ${recipientsLiteral}
set attachmentList to ${attachmentLiteral}
set subjectText to "${escapeAppleScriptString(subject)}"
set bodyText to "${escapeAppleScriptString(message)}"
tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:subjectText, content:bodyText & return & return, visible:false}
  tell newMessage
    repeat with addressValue in recipientList
      make new to recipient at end of to recipients with properties {address:(addressValue as string)}
    end repeat
    repeat with attachmentPath in attachmentList
      try
        make new attachment with properties {file name:(POSIX file (attachmentPath as string))} at after the last paragraph
      end try
    end repeat
    send
  end tell
end tell
return "EMAIL_SENT"
`;
  const runResult = await runCommand("osascript", ["-e", script], {
    ignoreError: true,
    timeoutMs: 45000
  });
  if (!runResult.ok) {
    return {
      ok: false,
      reason: "email_send_failed",
      summary: "邮件发送失败：Mail 自动化未授权或账号不可用。",
      error: runResult.error || runResult.stderr || "mail_not_available"
    };
  }
  return {
    ok: true,
    reason: "email_sent",
    summary: `邮件发送成功：${recipients.length} 位收件人。`,
    delivery: {
      channel: "email",
      recipients,
      subject,
      attachments: validAttachments.length
    }
  };
}

async function sendFeishuWebhook(payload = {}) {
  const webhookUrl = String(payload.webhookUrl || process.env.ARIA_FEISHU_WEBHOOK_URL || "").trim();
  if (!webhookUrl) {
    return {
      ok: false,
      reason: "feishu_webhook_missing",
      summary: "飞书发送失败：未配置 ARIA_FEISHU_WEBHOOK_URL。"
    };
  }
  const text = composeChannelText(payload.message, payload.attachments);
  if (!text) {
    return {
      ok: false,
      reason: "message_required",
      summary: "飞书发送失败：消息内容为空。"
    };
  }
  let response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        msg_type: "text",
        content: {
          text
        }
      })
    });
  } catch (error) {
    return {
      ok: false,
      reason: "feishu_network_error",
      summary: "飞书发送失败：网络异常。",
      error: error instanceof Error ? error.message : String(error)
    };
  }

  let responseBody = {};
  try {
    responseBody = await response.json();
  } catch {
    responseBody = {};
  }
  const statusCode = Number(responseBody?.StatusCode ?? responseBody?.code ?? 0);
  const ok = response.ok && statusCode === 0;
  return {
    ok,
    reason: ok ? "feishu_sent" : "feishu_send_failed",
    summary: ok ? "飞书消息发送成功。" : "飞书消息发送失败，请检查 webhook 权限。",
    delivery: {
      channel: "feishu_webhook",
      statusCode,
      responseStatus: response.status
    },
    response: responseBody
  };
}

async function fetchMailUnread(runCommand) {
  const script = `
tell application "Mail"
  if not (exists inbox) then
    return "0"
  end if
  return (unread count of inbox) as string
end tell
`;
  const result = await runCommand("osascript", ["-e", script], {
    ignoreError: true,
    timeoutMs: 12000
  });
  if (!result.ok) {
    return {
      ok: false,
      unread: 0,
      error: result.error || result.stderr || "mail_permission_denied"
    };
  }
  return {
    ok: true,
    unread: parseInteger(result.stdout, 0)
  };
}

async function fetchSmsChatCount(runCommand) {
  const script = `
tell application "Messages"
  set targetService to first service whose service type = SMS
  return (count of chats of targetService) as string
end tell
`;
  const result = await runCommand("osascript", ["-e", script], {
    ignoreError: true,
    timeoutMs: 12000
  });
  if (!result.ok) {
    return {
      ok: false,
      chats: 0,
      error: result.error || result.stderr || "messages_permission_denied"
    };
  }
  return {
    ok: true,
    chats: parseInteger(result.stdout, 0)
  };
}

export const adapter = {
  id: "communications",
  name: "Communications Digest",
  capabilities: [
    {
      id: "desktop.mail_triage",
      platform: "desktop",
      name: "桌面邮件分拣",
      risk: "medium"
    },
    {
      id: "mobile.email_digest",
      platform: "mobile",
      name: "手机邮件摘要",
      risk: "medium"
    },
    {
      id: "mobile.sms_digest",
      platform: "mobile",
      name: "手机短信摘要",
      risk: "medium"
    },
    {
      id: "desktop.channel_delivery",
      platform: "desktop",
      name: "跨通道消息发送",
      risk: "high"
    },
    {
      id: "mobile.link_sync",
      platform: "mobile",
      name: "桌面-手机消息联通",
      risk: "medium"
    }
  ],
  actions: {
    "communications.mail_digest": async ({ runCommand }) => {
      const mail = await fetchMailUnread(runCommand);
      if (!mail.ok) {
        return {
          ok: false,
          reason: "mail_unavailable",
          summary: "邮件摘要失败：未授予 Mail 自动化权限。",
          error: mail.error
        };
      }
      return {
        ok: true,
        summary: `邮件摘要完成：收件箱未读 ${mail.unread} 封。`,
        metrics: {
          unread: mail.unread
        }
      };
    },

    "communications.sms_digest": async ({ runCommand }) => {
      const sms = await fetchSmsChatCount(runCommand);
      if (!sms.ok) {
        return {
          ok: false,
          reason: "sms_unavailable",
          summary: "短信摘要失败：未授予 Messages 自动化权限。",
          error: sms.error
        };
      }
      return {
        ok: true,
        summary: `短信摘要完成：检测到 ${sms.chats} 个 SMS 会话。`,
        metrics: {
          chats: sms.chats
        }
      };
    },

    "communications.send_channel": async ({ payload, runCommand }) => {
      const channel = normalizeChannel(payload?.channel || "");
      const message = String(payload?.message || "").trim();
      const subject = String(payload?.subject || "").trim();
      const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
      const recipient = String(payload?.recipient || "").trim();

      if (!channel) {
        return {
          ok: false,
          reason: "channel_required",
          summary: "发送失败：缺少 channel（支持飞书、mobile、email）。"
        };
      }

      if (channel === "feishu_webhook") {
        return sendFeishuWebhook({
          webhookUrl: payload?.webhookUrl,
          message,
          attachments
        });
      }

      if (channel === "mobile_link") {
        const relayMessage = appendMobileRelayMessage({
          recipient,
          message,
          attachments
        });
        return {
          ok: true,
          reason: "mobile_relay_enqueued",
          summary: "已投递到手机联通通道。",
          delivery: {
            channel: "mobile_link",
            relayId: relayMessage.id,
            recipient: relayMessage.recipient
          }
        };
      }

      if (channel === "email") {
        const forceSmtp = parseBoolean(process.env.ARIA_EMAIL_FORCE_SMTP, false);
        const disableAppleMail = parseBoolean(process.env.ARIA_EMAIL_DISABLE_APPLE_MAIL, false);
        const attempts = [];
        if (!forceSmtp && !disableAppleMail) {
          const appleResult = await sendEmailViaAppleMail(runCommand, {
            ...payload,
            recipient,
            subject,
            message,
            attachments
          });
          attempts.push({
            provider: "apple_mail",
            ok: appleResult.ok,
            reason: appleResult.reason
          });
          if (appleResult.ok) {
            return {
              ...appleResult,
              delivery: {
                ...(appleResult.delivery || {}),
                provider: "apple_mail"
              },
              attempts
            };
          }
        }
        const smtpResult = await sendEmailViaSmtp({
          ...payload,
          recipient,
          subject,
          message,
          attachments
        });
        attempts.push({
          provider: "smtp",
          ok: smtpResult.ok,
          reason: smtpResult.reason
        });
        if (smtpResult.ok) {
          const degraded = attempts.some((item) => item.provider === "apple_mail" && item.ok === false);
          const summaryPrefix = degraded ? "Mail 不可用，已自动切换 SMTP。 " : "";
          return {
            ...smtpResult,
            summary: `${summaryPrefix}${smtpResult.summary}`,
            attempts
          };
        }
        return {
          ok: false,
          reason: smtpResult.reason || "email_send_failed",
          summary: attempts.some((item) => item.provider === "apple_mail")
            ? "邮件发送失败：Apple Mail 与 SMTP 均不可用。"
            : String(smtpResult.summary || "邮件发送失败。"),
          error: smtpResult.error || "",
          attempts
        };
      }

      return {
        ok: false,
        reason: "channel_not_supported",
        summary: `发送失败：暂不支持通道 ${channel}。`
      };
    },

    "communications.mobile_outbox": async ({ payload }) => {
      const limit = parseInteger(payload?.limit, 40);
      const safeLimit = Math.max(1, Math.min(200, limit));
      const relay = readMobileRelayState();
      return {
        ok: true,
        reason: "mobile_outbox_loaded",
        summary: `已读取手机联通投递记录 ${Math.min(safeLimit, relay.outbox.length)} 条。`,
        items: relay.outbox.slice(0, safeLimit),
        total: relay.outbox.length
      };
    }
  }
};
