import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function safeString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function loadConfig(configPathInput = "") {
  const configPath = resolve(String(configPathInput || ""));
  if (!configPath || !existsSync(configPath)) {
    throw new Error("CONFIG_NOT_FOUND");
  }
  const raw = readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("CONFIG_INVALID");
  }
  return {
    ...parsed,
    configPath
  };
}

function ensureParentDir(filePath = "") {
  const parent = dirname(resolve(filePath));
  mkdirSync(parent, {
    recursive: true
  });
}

async function tryFill(page, selectors = [], value = "") {
  const content = String(value || "");
  if (!content) {
    return "";
  }
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.count() === 0) {
        continue;
      }
      await locator.fill(content, {
        timeout: 2500
      });
      return selector;
    } catch {
      continue;
    }
  }
  return "";
}

async function tryTypeContentEditable(page, selectors = [], value = "") {
  const content = String(value || "");
  if (!content) {
    return "";
  }
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.count() === 0) {
        continue;
      }
      await locator.click({
        timeout: 2000
      });
      await locator.fill(content, {
        timeout: 2500
      });
      return selector;
    } catch {
      continue;
    }
  }
  return "";
}

function escapeTextSelector(text = "") {
  return String(text || "").replace(/"/g, "\\\"");
}

async function tryClick(page, labels = []) {
  for (const rawLabel of labels) {
    const label = String(rawLabel || "").trim();
    if (!label) {
      continue;
    }
    const escaped = escapeTextSelector(label);
    const selectors = [
      `button:has-text("${escaped}")`,
      `a:has-text("${escaped}")`,
      `input[type="submit"][value*="${escaped}"]`,
      `input[type="button"][value*="${escaped}"]`,
      `text=${escaped}`
    ];
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector).first();
        if (await locator.count() === 0) {
          continue;
        }
        await locator.click({
          timeout: 2500
        });
        return selector;
      } catch {
        continue;
      }
    }
  }
  return "";
}

function containsHumanCheckHint(text = "") {
  const body = String(text || "").toLowerCase();
  return /captcha|验证码|人机验证|安全验证|滑块|not a robot|robot check/.test(body);
}

async function readBodyText(page) {
  try {
    const bodyText = await page.locator("body").innerText({
      timeout: 3000
    });
    return String(bodyText || "");
  } catch {
    return "";
  }
}

async function main() {
  const configPath = process.argv[2];
  const config = loadConfig(configPath);
  const mode = safeString(config.mode, "login").toLowerCase();
  const result = {
    ok: false,
    reason: "unknown",
    summary: "",
    mode,
    url: safeString(config.url),
    runId: safeString(config.runId),
    executedAt: new Date().toISOString(),
    steps: [],
    screenshotPath: safeString(config.screenshotPath),
    tracePath: safeString(config.tracePath)
  };

  let chromium;
  try {
    const playwright = await import("playwright");
    chromium = playwright.chromium;
  } catch (error) {
    result.reason = "playwright_missing";
    result.summary = "缺少 Playwright 依赖。";
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: config.headless !== false
    });
  } catch (error) {
    result.reason = "playwright_launch_failed";
    result.summary = "浏览器启动失败，请安装 Playwright Chromium。";
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  let actionCompleted = false;
  try {
    await page.goto(result.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    result.steps.push({
      step: "navigate",
      ok: true
    });

    const usernameSelectors = [
      'input[name="username"]',
      'input[name*="user"]',
      'input[type="email"]',
      'input[autocomplete="username"]',
      "#username",
      "#email",
      'input[placeholder*="邮箱"]',
      'input[placeholder*="账号"]',
      'input[placeholder*="用户名"]'
    ];
    const emailSelectors = [
      'input[type="email"]',
      'input[name*="email"]',
      "#email",
      'input[placeholder*="邮箱"]'
    ];
    const passwordSelectors = [
      'input[type="password"]',
      'input[name*="password"]',
      'input[autocomplete="current-password"]',
      "#password"
    ];
    const titleSelectors = [
      'input[name*="title"]',
      'input[placeholder*="标题"]',
      "#title"
    ];
    const contentSelectors = [
      "textarea",
      'textarea[name*="content"]',
      'textarea[placeholder*="内容"]',
      '[contenteditable="true"]',
      ".editor",
      "#content"
    ];

    if (mode.includes("register")) {
      const emailField = await tryFill(page, emailSelectors, safeString(config.email));
      const usernameField = await tryFill(page, usernameSelectors, safeString(config.username));
      const passwordField = await tryFill(page, passwordSelectors, safeString(config.password));
      const submitSelector = await tryClick(page, ["注册", "Sign up", "Register", "创建账号"]);
      result.steps.push({
        step: "register",
        ok: Boolean(emailField || usernameField || passwordField || submitSelector),
        selectors: {
          emailField,
          usernameField,
          passwordField,
          submitSelector
        }
      });
      actionCompleted = actionCompleted || Boolean(emailField || usernameField || passwordField || submitSelector);
      await page.waitForTimeout(2000);
    }

    if (mode.includes("login")) {
      const usernameField = await tryFill(page, usernameSelectors, safeString(config.username));
      const emailField = !usernameField ? await tryFill(page, emailSelectors, safeString(config.email)) : "";
      const passwordField = await tryFill(page, passwordSelectors, safeString(config.password));
      const submitSelector = await tryClick(page, ["登录", "Sign in", "Login", "Continue"]);
      result.steps.push({
        step: "login",
        ok: Boolean(usernameField || emailField || passwordField || submitSelector),
        selectors: {
          usernameField,
          emailField,
          passwordField,
          submitSelector
        }
      });
      actionCompleted = actionCompleted || Boolean(usernameField || emailField || passwordField || submitSelector);
      await page.waitForTimeout(2000);
    }

    if (mode.includes("publish")) {
      const titleField = await tryFill(page, titleSelectors, safeString(config.postTitle));
      let contentField = await tryFill(page, contentSelectors, safeString(config.postContent));
      if (!contentField) {
        contentField = await tryTypeContentEditable(page, contentSelectors, safeString(config.postContent));
      }
      const submitSelector = await tryClick(page, ["发布", "发帖", "Post", "Publish", "Submit", "发布帖子"]);
      result.steps.push({
        step: "publish",
        ok: Boolean(titleField || contentField || submitSelector),
        selectors: {
          titleField,
          contentField,
          submitSelector
        }
      });
      actionCompleted = actionCompleted || Boolean(titleField || contentField || submitSelector);
      await page.waitForTimeout(2000);
    }

    const bodyText = await readBodyText(page);
    if (containsHumanCheckHint(bodyText)) {
      result.ok = false;
      result.reason = "human_verification_required";
      result.summary = "触发验证码或人机验证，需人工介入后重试。";
    } else if (!actionCompleted) {
      result.ok = false;
      result.reason = "no_action_target";
      result.summary = "未定位到可执行控件，请补充页面地址、账号字段或发布内容。";
    } else {
      result.ok = true;
      result.reason = "browser_workflow_completed";
      result.summary = "网站自动化执行完成，已输出截图和执行回执。";
    }

    if (config.screenshotPath) {
      ensureParentDir(config.screenshotPath);
      await page.screenshot({
        path: config.screenshotPath,
        fullPage: true
      });
    }
    if (config.tracePath) {
      ensureParentDir(config.tracePath);
      writeFileSync(config.tracePath, JSON.stringify({
        mode,
        url: result.url,
        steps: result.steps,
        finishedAt: new Date().toISOString()
      }, null, 2), "utf8");
    }
  } catch (error) {
    result.ok = false;
    result.reason = "browser_workflow_exception";
    result.summary = "网站自动化执行异常。";
    result.error = error instanceof Error ? error.message : String(error);
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
  return result;
}

main()
  .then((result) => {
    if (result.resultPath || process.argv[2]) {
      const config = (() => {
        try {
          return loadConfig(process.argv[2]);
        } catch {
          return {};
        }
      })();
      const resultPath = safeString(config.resultPath);
      if (resultPath) {
        ensureParentDir(resultPath);
        writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
      }
    }
    process.stdout.write(`ARIA_BROWSER_AUTOMATION_RESULT=${JSON.stringify(result)}\n`);
    process.exit(result.ok ? 0 : 1);
  })
  .catch((error) => {
    const payload = {
      ok: false,
      reason: "browser_workflow_fatal",
      summary: "网站自动化脚本启动失败。",
      error: error instanceof Error ? error.message : String(error)
    };
    process.stdout.write(`ARIA_BROWSER_AUTOMATION_RESULT=${JSON.stringify(payload)}\n`);
    process.exit(1);
  });
