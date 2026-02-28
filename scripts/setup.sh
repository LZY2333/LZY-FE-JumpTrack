#!/bin/bash
# macOS / Linux 环境初始化
# 用法: bash scripts/setup.sh

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "📁 仓库路径: $REPO_DIR"

# Claude：整个 .claude 目录软链到 repo
if [ -L ~/.claude ]; then
  rm ~/.claude
elif [ -d ~/.claude ]; then
  echo "⚠️  ~/.claude 是真实目录，请手动将内容移入 $REPO_DIR/.claude 后再运行"
  exit 1
fi
ln -s "$REPO_DIR/.claude" ~/.claude
echo "✅ Claude 软链完成 (~/.claude -> repo/.claude)"

# repo/.claude/skills 软链到 repo/skills
ln -sf ../skills "$REPO_DIR/.claude/skills"
echo "✅ repo/.claude/skills 软链完成"

# Codex
mkdir -p ~/.codex
ln -sf "$REPO_DIR/skills" ~/.codex/skills
echo "✅ Codex 软链完成"

echo "🎉 setup 完成"
