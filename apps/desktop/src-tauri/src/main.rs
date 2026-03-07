#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{
  env,
  fs,
  io::{Read, Write},
  net::{SocketAddr, TcpStream},
  path::{Path, PathBuf},
  process::Command,
  thread,
  time::Duration
};

const DEFAULT_API_HOST: &str = "127.0.0.1";
const DEFAULT_API_PORT: u16 = 8787;
const DEFAULT_HEALTH_PATH: &str = "/health";

fn env_flag(name: &str, default_value: bool) -> bool {
  match env::var(name) {
    Ok(value) => {
      let normalized = value.trim().to_ascii_lowercase();
      if ["1", "true", "yes", "on", "enabled"].contains(&normalized.as_str()) {
        true
      } else if ["0", "false", "no", "off", "disabled"].contains(&normalized.as_str()) {
        false
      } else {
        default_value
      }
    }
    Err(_) => default_value
  }
}

fn resolve_api_port() -> u16 {
  match env::var("ARIA_API_PORT") {
    Ok(raw) => raw.trim().parse::<u16>().ok().filter(|port| *port > 0).unwrap_or(DEFAULT_API_PORT),
    Err(_) => DEFAULT_API_PORT
  }
}

fn path_exists(path: &Path) -> bool {
  fs::metadata(path).is_ok()
}

fn sanitize_path_from_env(value: &str) -> Option<PathBuf> {
  let path = PathBuf::from(value.trim());
  if path.as_os_str().is_empty() {
    return None;
  }
  if path_exists(&path) {
    return Some(path);
  }
  None
}

fn resolve_compose_file() -> Option<PathBuf> {
  if let Ok(raw) = env::var("ARIA_DOCKER_COMPOSE_FILE") {
    if let Some(path) = sanitize_path_from_env(&raw) {
      return Some(path);
    }
  }

  if let Ok(root_raw) = env::var("ARIA_ROOT_DIR") {
    let root = PathBuf::from(root_raw.trim());
    if !root.as_os_str().is_empty() {
      let candidate = root.join("deploy").join("docker-compose.api.yml");
      if path_exists(&candidate) {
        return Some(candidate);
      }
    }
  }

  let mut seeds: Vec<PathBuf> = Vec::new();
  if let Ok(cwd) = env::current_dir() {
    seeds.push(cwd);
  }
  if let Ok(executable) = env::current_exe() {
    if let Some(parent) = executable.parent() {
      seeds.push(parent.to_path_buf());
    }
  }

  for seed in seeds {
    for ancestor in seed.ancestors() {
      let candidate = ancestor.join("deploy").join("docker-compose.api.yml");
      if path_exists(&candidate) {
        return Some(candidate);
      }
    }
  }

  None
}

fn command_ok(mut command: Command) -> bool {
  match command.output() {
    Ok(output) => output.status.success(),
    Err(_) => false
  }
}

fn wait_for_local_health(host: &str, port: u16, path: &str, retries: usize, interval_ms: u64) -> bool {
  let addr = format!("{host}:{port}");
  let socket_addr: SocketAddr = match addr.parse() {
    Ok(parsed) => parsed,
    Err(_) => return false
  };

  for _ in 0..retries {
    if let Ok(mut stream) = TcpStream::connect_timeout(&socket_addr, Duration::from_millis(800)) {
      let _ = stream.set_read_timeout(Some(Duration::from_millis(1200)));
      let _ = stream.set_write_timeout(Some(Duration::from_millis(1200)));
      let request = format!(
        "GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: aria-desktop-bootstrap\r\n\r\n"
      );
      if stream.write_all(request.as_bytes()).is_ok() {
        let mut response = String::new();
        if stream.read_to_string(&mut response).is_ok()
          && (response.starts_with("HTTP/1.1 200") || response.starts_with("HTTP/1.0 200"))
        {
          return true;
        }
      }
    }
    thread::sleep(Duration::from_millis(interval_ms.max(120)));
  }
  false
}

fn auto_boot_docker_api_runtime() {
  let default_auto_boot = true;
  if !env_flag("ARIA_DESKTOP_AUTO_BOOT_DOCKER_API", default_auto_boot) {
    println!("[aria-desktop] docker api auto-boot disabled by ARIA_DESKTOP_AUTO_BOOT_DOCKER_API");
    return;
  }

  let compose_file = match resolve_compose_file() {
    Some(path) => path,
    None => {
      println!(
        "[aria-desktop] docker compose file not found (set ARIA_DOCKER_COMPOSE_FILE or ARIA_ROOT_DIR to override)"
      );
      return;
    }
  };

  if !command_ok({
    let mut command = Command::new("docker");
    command.arg("--version");
    command
  }) {
    println!("[aria-desktop] docker is unavailable, skip auto-boot");
    return;
  }

  if !command_ok({
    let mut command = Command::new("docker");
    command.arg("compose").arg("version");
    command
  }) {
    println!("[aria-desktop] docker compose is unavailable, skip auto-boot");
    return;
  }

  let compose_parent = compose_file.parent().map(|path| path.to_path_buf());
  let skip_build = env_flag("ARIA_DOCKER_COMPOSE_SKIP_BUILD", false);

  let mut compose_command = Command::new("docker");
  compose_command
    .arg("compose")
    .arg("-f")
    .arg(&compose_file)
    .arg("up")
    .arg("-d");
  if !skip_build {
    compose_command.arg("--build");
  }
  if let Some(parent) = compose_parent {
    compose_command.current_dir(parent);
  }

  match compose_command.output() {
    Ok(output) => {
      let stdout_text = String::from_utf8_lossy(&output.stdout).trim().to_string();
      let stderr_text = String::from_utf8_lossy(&output.stderr).trim().to_string();
      if output.status.success() {
        if !stdout_text.is_empty() {
          println!("[aria-desktop] docker compose up:\n{stdout_text}");
        }
        if !stderr_text.is_empty() {
          println!("[aria-desktop] docker compose stderr:\n{stderr_text}");
        }
      } else {
        println!(
          "[aria-desktop] docker compose failed (code: {:?})",
          output.status.code()
        );
        if !stdout_text.is_empty() {
          println!("[aria-desktop] docker compose stdout:\n{stdout_text}");
        }
        if !stderr_text.is_empty() {
          println!("[aria-desktop] docker compose stderr:\n{stderr_text}");
        }
        return;
      }
    }
    Err(error) => {
      println!("[aria-desktop] docker compose execution failed: {error}");
      return;
    }
  }

  let health_host = env::var("ARIA_API_HOST")
    .ok()
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty())
    .map(|host| match host.as_str() {
      "0.0.0.0" | "::" | "[::]" => DEFAULT_API_HOST.to_string(),
      _ => host
    })
    .unwrap_or_else(|| DEFAULT_API_HOST.to_string());
  let health_port = resolve_api_port();
  let health_ready = wait_for_local_health(&health_host, health_port, DEFAULT_HEALTH_PATH, 40, 350);
  if health_ready {
    println!("[aria-desktop] local API is ready at http://{health_host}:{health_port}");
  } else {
    println!(
      "[aria-desktop] local API health check timeout at http://{health_host}:{health_port}{DEFAULT_HEALTH_PATH}"
    );
  }
}

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
      thread::spawn(auto_boot_docker_api_runtime);
      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
