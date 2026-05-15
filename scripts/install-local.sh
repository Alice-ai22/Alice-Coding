#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="${ALICE_CODING_BIN_DIR:-$HOME/.local/bin}"

mkdir -p "$BIN_DIR"

for server in skills-mcp-server project-ops-mcp-server verification-mcp-server reference-mcp-server; do
  echo "Building mcp/$server"
  (cd "$ROOT_DIR/mcp/$server" && npm install && npm run build)
done

ln -sf "$ROOT_DIR/cli/vibe-cli/bin/vibe" "$BIN_DIR/vibe"
ln -sf "$ROOT_DIR/cli/agent-runner/bin/agent-runner" "$BIN_DIR/agent-runner"

echo "Installed Alice Coding commands:"
echo "  $BIN_DIR/vibe"
echo "  $BIN_DIR/agent-runner"
echo
echo "Make sure $BIN_DIR is on your PATH."
