import os from "node:os";

function parseBattery(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return {
      available: false,
      level: -1,
      charging: false,
      raw: ""
    };
  }
  const levelMatch = text.match(/(\d+)%/);
  const charging = text.includes("AC Power") || text.includes("charged");
  return {
    available: true,
    level: levelMatch ? Number(levelMatch[1]) : -1,
    charging,
    raw: text
  };
}

function parseDisk(raw) {
  const lines = String(raw || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return {
      mount: "/",
      usage: "unknown",
      available: "unknown",
      raw: String(raw || "")
    };
  }
  const cols = lines[1].split(/\s+/);
  return {
    filesystem: cols[0] || "",
    usage: cols[4] || "",
    available: cols[3] || "",
    mount: cols[5] || "/",
    raw: lines[1]
  };
}

export const adapter = {
  id: "hardware",
  name: "Hardware Inspector",
  capabilities: [
    {
      id: "desktop.hardware_probe",
      platform: "desktop",
      name: "桌面硬件巡检",
      risk: "medium"
    },
    {
      id: "mobile.hardware_probe",
      platform: "mobile",
      name: "手机硬件状态读取",
      risk: "medium"
    }
  ],
  actions: {
    "hardware.snapshot": async ({ runCommand }) => {
      const batteryCmd = await runCommand("pmset", ["-g", "batt"], {
        ignoreError: true
      });
      const diskCmd = await runCommand("df", ["-h", "/"], {
        ignoreError: true
      });

      const cpus = os.cpus() || [];
      const memTotalGb = Number((os.totalmem() / (1024 ** 3)).toFixed(2));
      const memFreeGb = Number((os.freemem() / (1024 ** 3)).toFixed(2));
      const loadAvg = os.loadavg().map((item) => Number(item.toFixed(2)));
      const battery = parseBattery(batteryCmd.stdout || batteryCmd.stderr || "");
      const disk = parseDisk(diskCmd.stdout || "");

      const snapshot = {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptimeSeconds: Math.floor(os.uptime()),
        cpu: {
          cores: cpus.length,
          model: cpus[0]?.model || "unknown"
        },
        memory: {
          totalGb: memTotalGb,
          freeGb: memFreeGb,
          usedGb: Number((memTotalGb - memFreeGb).toFixed(2))
        },
        loadAvg,
        battery,
        disk
      };

      return {
        ok: true,
        summary: `硬件巡检完成：CPU ${snapshot.cpu.cores} 核，内存 ${snapshot.memory.usedGb}/${snapshot.memory.totalGb} GB，电量 ${battery.level}%。`,
        metrics: {
          cpuCores: snapshot.cpu.cores,
          memoryUsedGb: snapshot.memory.usedGb,
          memoryTotalGb: snapshot.memory.totalGb,
          batteryLevel: battery.level
        },
        snapshot
      };
    }
  }
};
