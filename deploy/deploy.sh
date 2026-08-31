#!/usr/bin/env bash
#
# ============================================================================
#  Xerina Atlas —— 一键部署 / 更新脚本
# ============================================================================
#  作用:
#    将当前分支构建的静态站点打包成 Docker 镜像, 一键部署到 hua (118.89.18.90)
#    的 80 端口。脚本先做前置检查并给出「是否可以一键重新部署」的判断,
#    旧版在线时执行平滑升级(候选容器健康检查通过后再切换), 新容器失败自动回滚。
#
#  说明:
#    - 镜像在服务器 hua 上构建(docker build), 本机只需 node/npm + ssh/scp/rsync,
#      无需本机 docker, 也不依赖本机访问 Docker Hub。
#
#  用法:
#    ./deploy/deploy.sh            一键检查 + 构建 + 部署(交互确认)
#    ./deploy/deploy.sh --check    仅做前置检查, 输出是否可一键部署(不构建不部署)
#    ./deploy/deploy.sh --yes      跳过交互确认, 全程自动
#    ./deploy/deploy.sh --force    前置检查有硬性失败也继续(危险, 慎用)
#    ./deploy/deploy.sh -h         查看帮助
#
#  环境变量覆盖(可选):
#    DEPLOY_HOST     服务器地址, 默认 118.89.18.90
#    DEPLOY_USER     服务器用户, 默认 ubuntu
#    DEPLOY_SSH_KEY  SSH 私钥,    默认 ~/.ssh/xerina_atlas_github_actions
#    DEPLOY_DIR      服务器部署目录, 默认 /opt/xerina-atlas
#    IMAGE_NAME      镜像名,       默认 xerina-atlas
#    CONTAINER_NAME  容器名,       默认 xerina-atlas
#    CANDIDATE_PORT  候选容器端口, 默认 18080
# ============================================================================

set -euo pipefail

# ---------- 配置(可用环境变量覆盖) ----------
DEPLOY_HOST="${DEPLOY_HOST:-118.89.18.90}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/xerina_atlas_github_actions}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/xerina-atlas}"
IMAGE_NAME="${IMAGE_NAME:-xerina-atlas}"
CONTAINER_NAME="${CONTAINER_NAME:-xerina-atlas}"
CANDIDATE_PORT="${CANDIDATE_PORT:-18080}"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

CHECK_ONLY=0
ASSUME_YES=0
FORCE=0

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"   # macOS Docker Desktop CLI 等

# ---------- 输出工具 ----------
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
  GREEN=$'\e[32m'; YELLOW=$'\e[33m'; RED=$'\e[31m'; CYAN=$'\e[36m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
else
  GREEN=''; YELLOW=''; RED=''; CYAN=''; BOLD=''; RESET=''
fi
ok()   { printf '%s[ OK ]%s %s\n' "$GREEN" "$RESET" "$1"; }
warn() { printf '%s[WARN]%s %s\n' "$YELLOW" "$RESET" "$1"; }
fail() { printf '%s[FAIL]%s %s\n' "$RED" "$RESET" "$1"; }
info() { printf '%s[INFO]%s %s\n' "$CYAN" "$RESET" "$1"; }
section() { printf '\n%s== %s ==%s\n' "$BOLD" "$1" "$RESET"; }
die()  { printf '%s[ERROR]%s %s\n' "$RED" "$RESET" "$1" >&2; exit "${2:-1}"; }

usage() { sed -n '2,48p' "$0" | sed 's/^# \{0,1\}//'; exit 0; }

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
    --yes|-y) ASSUME_YES=1 ;;
    --force) FORCE=1 ;;
    -h|--help) usage ;;
    *) die "未知参数: $arg (用 -h 查看帮助)" ;;
  esac
done

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=10)
# 使用仓库内固定的主机指纹, 避免依赖本机 ~/.ssh/known_hosts
if [ -s "$ROOT/deploy/known_hosts" ]; then
  SSH_OPTS+=(-o UserKnownHostsFile="$ROOT/deploy/known_hosts")
fi
[ -n "$DEPLOY_SSH_KEY" ] && SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")

# ---------- 前置检查(本机) ----------
preflight_local() {
  section "前置检查 · 本机"
  local ver ok=1

  if ! command -v git >/dev/null 2>&1; then fail "git 未安装"; ok=0; else
    ok "git: $(git --version | awk '{print $3}')"
  fi

  # node: 通过 nvm 定位(本机 node 常由 nvm 管理, 非登录 shell 拿不到)
  if ! command -v node >/dev/null 2>&1 && [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 || true
    nvm use default >/dev/null 2>&1 || nvm use node >/dev/null 2>&1 || true
  fi
  if ! command -v node >/dev/null 2>&1; then fail "node 未找到 (检查 nvm / NVM_DIR)"; ok=0; else
    ver="$(node --version)"; ok "node: $ver"
    if [ -z "$(command -v npm)" ]; then fail "npm 未找到"; ok=0; else
      ok "npm: $(npm --version)"
    fi
    node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
    if [ "${node_major:-0}" -lt 20 ]; then warn "node 版本偏旧 ($ver), 建议 >= 20"; fi
  fi

  if ! command -v ssh >/dev/null 2>&1 || ! command -v scp >/dev/null 2>&1 \
     || ! command -v rsync >/dev/null 2>&1; then
    fail "需要 ssh / scp / rsync (macOS 自带)"
    ok=0
  else
    ok "ssh/scp/rsync: $(rsync --version | head -1 | awk '{print $3}')"
  fi

  # docker 仅作提示: 镜像在服务器上构建, 本机 docker 非必需
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    info "本机 docker: v$(docker version --format '{{.Server.Version}}' 2>/dev/null) (本脚本不依赖本机 docker)"
  fi

  if [ ! -d "$ROOT/node_modules" ]; then
    warn "node_modules 不存在, 部署前将执行 npm ci"
  fi

  local dirty
  dirty="$(git -C "$ROOT" status --porcelain 2>/dev/null | grep -v '^??' | head -5 || true)"
  if [ -n "$dirty" ]; then
    warn "工作区有未提交改动 —— 部署的是『当前工作区』内容, 而非某次提交"
  fi
  info "分支: $(git -C "$ROOT" branch --show-current) @ $(git -C "$ROOT" rev-parse --short HEAD)"

  local disk_mb
  disk_mb="$(df -Pm "$ROOT" | awk 'NR==2{print $4}')"
  if [ "${disk_mb:-0}" -lt 2048 ]; then warn "本机磁盘剩余 ${disk_mb}MB < 2GB, 构建空间可能不足"; fi

  if [ -n "$DEPLOY_SSH_KEY" ] && [ ! -f "$DEPLOY_SSH_KEY" ]; then
    fail "SSH 私钥不存在: $DEPLOY_SSH_KEY (可用 DEPLOY_SSH_KEY 指定)"
    ok=0
  elif [ -n "$DEPLOY_SSH_KEY" ] && ! ssh-keygen -y -f "$DEPLOY_SSH_KEY" >/dev/null 2>&1; then
    fail "SSH 私钥无效: $DEPLOY_SSH_KEY"
    ok=0
  else
    ok "SSH 私钥: $DEPLOY_SSH_KEY"
  fi

  return $((1 - ok))
}

# ---------- 前置检查(远端 hua) ----------
# 输出 KEY=VALUE 供本机解析; 任何单项失败都不中断, 由决策阶段统一判断
preflight_remote() {
  section "前置检查 · 远端 hua ($DEPLOY_HOST)"
  local out
  out="$(ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
        DEPLOY_DIR="$DEPLOY_DIR" CONTAINER_NAME="$CONTAINER_NAME" bash -s <<'REMOTE'
set -euo pipefail
sock_has() { { ss -tln 2>/dev/null || netstat -tln 2>/dev/null; } | grep -qE "$1" && echo yes || echo no; }
docker_ver="$(docker version --format '{{.Server.Version}}' 2>/dev/null || true)"
port80="$(sock_has ':80([[:space:]]|$)')"
candidate_busy="$(sock_has ':18080([[:space:]]|$)')"
[ -w "$DEPLOY_DIR" ] && dir_ok=yes || dir_ok=no
disk_mb="$(df -Pm / | awk 'NR==2{print $4}')"
current_tag="$(docker inspect --format '{{index .Config.Image}}' "$CONTAINER_NAME" 2>/dev/null || true)"
printf 'DOCKER_VERSION=%s\nPORT80=%s\nCURRENT_TAG=%s\nCANDIDATE_BUSY=%s\nDIR_WRITABLE=%s\nDISK_FREE_MB=%s\n' \
  "$docker_ver" "$port80" "$current_tag" "$candidate_busy" "$dir_ok" "$disk_mb"
REMOTE
)" || { fail "SSH 连接 $DEPLOY_HOST 失败 (检查 DEPLOY_SSH_KEY / 网络)"; return 1; }

  remote_docker_ver="$(printf '%s\n' "$out" | sed -n 's/^DOCKER_VERSION=//p')"
  remote_port80="$(printf '%s\n' "$out" | sed -n 's/^PORT80=//p')"
  current_tag="$(printf '%s\n' "$out" | sed -n 's/^CURRENT_TAG=//p')"
  remote_candidate_busy="$(printf '%s\n' "$out" | sed -n 's/^CANDIDATE_BUSY=//p')"
  remote_dir_ok="$(printf '%s\n' "$out" | sed -n 's/^DIR_WRITABLE=//p')"
  remote_disk_mb="$(printf '%s\n' "$out" | sed -n 's/^DISK_FREE_MB=//p')"

  ok "SSH 连通: $DEPLOY_USER@$DEPLOY_HOST"
  if [ -n "$remote_docker_ver" ]; then
    ok "远端 docker: v$remote_docker_ver"
  else
    fail "远端 docker 不可用"
  fi
  if [ "$remote_port80" = yes ]; then
    ok "80 端口在线 (旧版运行中): ${current_tag:-<未知镜像>}"
  else
    warn "80 端口未监听 —— 首次部署, 无旧版可回滚"
  fi
  if [ "$remote_candidate_busy" = no ]; then
    ok "候选端口 $CANDIDATE_PORT 空闲"
  else
    fail "候选端口 $CANDIDATE_PORT 被占用, 无法做平滑升级"
  fi
  if [ "$remote_dir_ok" = yes ]; then
    ok "部署目录可写: $DEPLOY_DIR"
  else
    fail "部署目录不可写: $DEPLOY_DIR"
  fi
  if [ "${remote_disk_mb:-0}" -lt 2048 ]; then
    warn "远端磁盘剩余 ${remote_disk_mb:-0}MB < 2GB"
  else
    ok "远端磁盘剩余 ${remote_disk_mb}MB"
  fi
  return 0
}

# ---------- 决策: 是否可以一键部署 ----------
decision() {
  section "决策 · 是否可以一键重新部署"
  local warns=0

  # 汇总硬性失败项
  local problems=()
  if [ -n "$remote_docker_ver" ]; then :; else problems+=("远端 docker 不可用"); fi
  if [ "$remote_candidate_busy" = yes ]; then problems+=("候选端口 $CANDIDATE_PORT 被占用"); fi
  if [ "$remote_dir_ok" != yes ]; then problems+=("远端部署目录不可写"); fi

  if [ "$1" != 0 ]; then problems+=("本机前置检查未通过"); fi
  if [ "${remote_disk_mb:-0}" -lt 2048 ]; then warn "远端磁盘不足, 建议清理后重试"; warns=$((warns+1)); fi
  if [ "$remote_port80" != yes ]; then warn "无旧版在线: 将执行首次部署(无回滚保障)"; warns=$((warns+1)); fi

  if [ "${#problems[@]}" -gt 0 ]; then
    for p in "${problems[@]}"; do fail "不可一键部署: $p"; done
  fi

  printf '\n'
  if [ "${#problems[@]}" -gt 0 ]; then
    if [ "$FORCE" = 1 ]; then
      warn "存在 ${#problems[@]} 项硬性失败, 但已指定 --force, 强制继续"
      return 0
    fi
    die "结论: ❌ 不可一键部署 (${#problems[@]} 项硬性失败) —— 修复后重试, 或确认风险后用 --force 强推"
  fi

  if [ "$warns" -gt 0 ]; then warn "存在 $warns 项提醒(不阻断部署)"; fi
  ok "结论: ✅ 可以一键部署"
  [ "$remote_port80" = yes ] && info "升级路径: ${current_tag:-<无旧版>} → $IMAGE_NAME:$SHA"
  return 0
}

# ---------- 构建静态站点(本机) ----------
build_site() {
  section "构建静态站点 (npm run build)"
  (cd "$ROOT" && npm run build)
  ok "站点构建完成: docs/.vitepress/dist"
}

# ---------- 上传构建上下文 + 服务器上构建镜像 ----------
ship_and_build() {
  section "上传构建上下文到 $DEPLOY_HOST 并在服务器构建镜像"
  local remote_ctx="$DEPLOY_DIR/build-$SHA"

  ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "rm -rf '$remote_ctx' && mkdir -p '$remote_ctx'"
  info "rsync 构建上下文 (dist + Dockerfile + nginx.conf) ..."
  # 在仓库根目录下以相对路径 + --relative 同步, 保持 Dockerfile 期望的目录结构
  (
    cd "$ROOT"
    rsync -az --delete \
      -e "ssh ${SSH_OPTS[*]}" \
      --relative \
      Dockerfile \
      deploy/nginx.conf \
      docs/.vitepress/dist \
      "$DEPLOY_USER@$DEPLOY_HOST:$remote_ctx/"
  )
  ok "构建上下文已上传: $remote_ctx"

  info "服务器 docker build: $IMAGE_NAME:$SHA (基础镜像已缓存, 无需本机访问 Docker Hub)"
  ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
    "docker build --tag '$IMAGE_NAME:$SHA' '$remote_ctx'" >&2
  ok "镜像构建完成(服务器): $IMAGE_NAME:$SHA"
}

# ---------- 远端部署(含健康检查与回滚) ----------
remote_deploy() {
  section "远端部署 ($DEPLOY_HOST)"
  local remote_out
  remote_out="$(ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
    bash -s -- "$SHA" "$DEPLOY_DIR" "$IMAGE_NAME" "$CONTAINER_NAME" "$CANDIDATE_PORT" <<'REMOTE'
set -euo pipefail
sha="$1"; deploy_dir="$2"; image_name="$3"; container_name="$4"; candidate_port="$5"
image="$image_name:$sha"
candidate="${container_name}-candidate"

# 记录旧版镜像(供回滚与报告)
old_tag="$(docker inspect --format '{{index .Config.Image}}' "$container_name" 2>/dev/null || true)"
if [ -n "$old_tag" ] && ! docker image inspect "$old_tag" >/dev/null 2>&1; then old_tag=""; fi
if [ -n "$old_tag" ]; then
  echo "OLD_TAG=$old_tag"
fi

echo "[1/4] 启动候选容器 ($image, 127.0.0.1:${candidate_port}) ..."
docker rm -f "$candidate" >/dev/null 2>&1 || true
docker run -d --name "$candidate" -p "127.0.0.1:${candidate_port}:80" "$image" >/dev/null

echo "[2/4] 候选容器健康检查 ..."
candidate_ready=false
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${candidate_port}/healthz" >/dev/null 2>&1 \
     && curl -fsS "http://127.0.0.1:${candidate_port}/" >/dev/null 2>&1; then
    candidate_ready=true; break
  fi
  sleep 1
done
if [ "$candidate_ready" != true ]; then
  echo "候选容器未通过健康检查:" >&2
  docker logs "$candidate" >&2 || true
  docker rm -f "$candidate" >/dev/null 2>&1 || true
  echo "RESULT=CANDIDATE_FAILED"
  exit 1
fi

echo "[3/4] 切换生产容器 (:80) ..."
docker rm -f "$container_name" >/dev/null 2>&1 || true
sleep 1
docker run -d --name "$container_name" --restart unless-stopped -p 80:80 "$image" >/dev/null

production_ready=false
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1/healthz" >/dev/null 2>&1 \
     && curl -fsS "http://127.0.0.1/" >/dev/null 2>&1; then
    production_ready=true; break
  fi
  sleep 1
done
docker rm -f "$candidate" >/dev/null 2>&1 || true

if [ "$production_ready" != true ]; then
  echo "新版本未通过健康检查, 回滚到 $old_tag ..." >&2
  docker logs "$container_name" >&2 || true
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  if [ -n "$old_tag" ]; then
    sleep 1
    docker run -d --name "$container_name" --restart unless-stopped -p 80:80 "$old_tag" >/dev/null
    for i in $(seq 1 20); do
      curl -fsS "http://127.0.0.1/healthz" >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  echo "RESULT=PRODUCTION_FAILED"
  exit 1
fi

echo "[4/4] 清理 (旧镜像保留当前与上一版, 删除构建目录) ..."
current_sha="$(docker inspect --format '{{.Image}}' "$container_name")"
mapfile -t imgs < <(docker image ls --format '{{.Repository}}:{{.Tag}}\t{{.ID}}' | grep "^${image_name}:" || true)
for entry in "${imgs[@]}"; do
  tag="${entry%%$'\t'*}"; id="${entry##*$'\t'}"
  [ "$tag" = "$image" ] && continue
  [ "$id" = "$current_sha" ] && continue
  [ -n "$old_tag" ] && [ "$tag" = "$old_tag" ] && continue
  docker image rm "$tag" >/dev/null 2>&1 || true
done
docker image prune -f >/dev/null 2>&1 || true
rm -rf "$deploy_dir/build-$sha"

printf '%s %s %s\n' "$(date -u +%FT%TZ)" "$sha" "${old_tag:-none}" > "$deploy_dir/.deployed-version"
echo "RESULT=OK"
echo "OLD_TAG=${old_tag:-none}"
REMOTE
)" || true

  echo "$remote_out" | grep -E '^\[[0-9]/4\]' || true
  if printf '%s\n' "$remote_out" | grep -q 'RESULT=OK'; then
    old_tag_actual="$(printf '%s\n' "$remote_out" | sed -n 's/^OLD_TAG=//p' | tail -1)"
    [ -n "$old_tag_actual" ] && old_tag="$old_tag_actual"
    ok "远端部署成功"
    return 0
  fi
  if printf '%s\n' "$remote_out" | grep -q 'RESULT=CANDIDATE_FAILED'; then
    die "候选容器健康检查失败, 已放弃部署, 旧版未受影响"
  fi
  if printf '%s\n' "$remote_out" | grep -q 'RESULT=PRODUCTION_FAILED'; then
    die "新版本健康检查失败, 已回滚到旧版: ${old_tag:-<无>}"
  fi
  die "远端部署失败, 请查看上方日志"
}

# ---------- 公网验证 ----------
verify_public() {
  section "公网验证"
  local code health
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://$DEPLOY_HOST/healthz" || echo 000)"
  health="$(curl -s --max-time 10 "http://$DEPLOY_HOST/healthz" || true)"
  if [ "$code" = 200 ]; then
    ok "http://$DEPLOY_HOST/healthz -> $code ($health)"
  else
    die "公网健康检查失败: HTTP $code"
  fi
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://$DEPLOY_HOST/" || echo 000)"
  if [ "$code" = 200 ]; then
    ok "http://$DEPLOY_HOST/ -> HTTP 200"
  else
    die "公网首页访问失败: HTTP $code"
  fi
}

# ============================================================================
#  主流程
# ============================================================================
START_TS="$(date +%s)"
info "Xerina Atlas 一键部署脚本"
info "目标: $DEPLOY_USER@$DEPLOY_HOST:80 (部署目录 $DEPLOY_DIR)"
info "来源: $(git -C "$ROOT" branch --show-current) @ $(git -C "$ROOT" rev-parse --short HEAD)"

SHA="$(git -C "$ROOT" rev-parse HEAD)"

local_ok=0
preflight_local || local_ok=1
preflight_remote || local_ok=1

# 已是最新判断
if [ -n "${current_tag:-}" ] && [ "$current_tag" = "$IMAGE_NAME:$SHA" ]; then
  info "当前运行版本已是 $current_tag, 无需更新"
  exit 0
fi

decision "$local_ok"

if [ "$CHECK_ONLY" = 1 ]; then
  info "仅检查模式(--check), 未执行构建与部署"
  exit 0
fi

if [ "$ASSUME_YES" != 1 ]; then
  printf '\n是否继续一键部署? (y/N) '
  read -r ans || true
  case "$ans" in y|Y|yes|YES) : ;; *) die "已取消" ;; esac
fi

if [ "$local_ok" != 0 ] && [ "$FORCE" != 1 ]; then
  die "本机前置检查未通过, 已中止"
fi

build_site
ship_and_build
remote_deploy
verify_public

section "部署完成"
END_TS="$(date +%s)"
info "服务器   : $DEPLOY_HOST (hua, 80 端口)"
info "旧版本   : ${old_tag:-<首次部署>}"
info "新版本   : $IMAGE_NAME:$SHA"
info "访问地址 : http://$DEPLOY_HOST/"
info "健康检查 : http://$DEPLOY_HOST/healthz"
ok "一键部署完成, 总耗时 $((END_TS - START_TS))s"
