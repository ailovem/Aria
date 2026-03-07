#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT_DIR/.runtime/certs"
CERT_FILE="$CERT_DIR/dev-local.crt"
KEY_FILE="$CERT_DIR/dev-local.key"
META_FILE="$CERT_DIR/dev-local.meta"
CONF_FILE="$CERT_DIR/dev-local-openssl.cnf"

mkdir -p "$CERT_DIR"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "$LAN_IP" ]]; then
  LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [[ -z "$LAN_IP" ]]; then
  LAN_IP="127.0.0.1"
fi

NEED_GEN=0
if [[ ! -f "$CERT_FILE" || ! -f "$KEY_FILE" ]]; then
  NEED_GEN=1
elif [[ ! -f "$META_FILE" ]]; then
  NEED_GEN=1
elif ! grep -q "^LAN_IP=${LAN_IP}$" "$META_FILE" 2>/dev/null; then
  NEED_GEN=1
fi

if [[ "$NEED_GEN" -eq 1 ]]; then
  cat > "$CONF_FILE" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = CN
ST = Local
L = Local
O = Aria
OU = LocalDev
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = aria.local
IP.1 = 127.0.0.1
IP.2 = ${LAN_IP}
EOF

  openssl req -x509 -nodes -days 825 \
    -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -config "$CONF_FILE" \
    -extensions v3_req >/dev/null 2>&1

  cat > "$META_FILE" <<EOF
LAN_IP=${LAN_IP}
GENERATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
fi

echo "CERT_FILE=$CERT_FILE"
echo "KEY_FILE=$KEY_FILE"
echo "LAN_IP=$LAN_IP"
