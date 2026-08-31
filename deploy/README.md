# 一键部署 / 更新脚本

`deploy/deploy.sh` 将当前分支构建的静态站点打包成 Docker 镜像, 一键部署到
服务器 **hua** (`118.89.18.90`) 的 **80 端口**。脚本会先做前置检查并给出
「**是否可以一键重新部署**」的明确结论, 再执行平滑升级; 新版本健康检查失败时
自动回滚到旧版。

## 环境要求(本机)

| 依赖 | 说明 |
| --- | --- |
| node >= 20 (npm) | 由 nvm 管理亦可, 脚本会自动 source `~/.nvm/nvm.sh` |
| ssh / scp / rsync | macOS 自带 |
| SSH 私钥 | 默认 `~/.ssh/xerina_atlas_github_actions`, 已授权 hua 的 `ubuntu` 用户 |

服务器 hua 只需有 docker 与可写的部署目录 (`/opt/xerina-atlas`), 无需 node。
**镜像在服务器上构建**(基础镜像 `nginx:1.30.4-alpine` 由服务器从 Docker Hub 拉取),
本机不依赖 docker, 也不依赖本机访问 Docker Hub。

## 用法

```bash
./deploy/deploy.sh --check    # 仅检查, 输出是否可以一键部署(不构建不部署)
./deploy/deploy.sh            # 一键: 检查 → 构建 → 传输 → 平滑升级 → 公网验证
./deploy/deploy.sh --yes      # 跳过交互确认
./deploy/deploy.sh --force    # 前置检查有硬性失败也继续(危险, 慎用)
```

## 脚本做了什么

1. **前置检查(本机)**: node / npm / docker 守护进程、SSH 私钥有效性、磁盘空间,
   并提醒未提交改动(部署的是当前工作区内容)。
2. **前置检查(远端)**: SSH 连通性、远端 docker、80 端口旧版在线情况(用于判断
   是"升级"还是"首次部署")、候选端口 18080 是否空闲、部署目录是否可写、
   远端磁盘空间。
3. **决策**: 汇总硬性失败项(❌)与提醒项(⚠️), 输出「✅ 可以一键部署」或
   「❌ 不可一键部署 + 原因」; 若新版本与线上版本相同则提示"已是最新"直接退出。
4. **构建**: `npm run build` 生成 `docs/.vitepress/dist`; 随后把 `Dockerfile` +
   `deploy/nginx.conf` + `docs/.vitepress/dist` 通过 rsync 上传到
   `hua:/opt/xerina-atlas/build-<sha>/`, 在服务器上 `docker build` 打包为
   `xerina-atlas:<git-sha>`(基于 `nginx:1.30.4-alpine`, 内置站点配置
   `deploy/nginx.conf`, 含 `/healthz` 健康检查)。
5. **平滑升级**(远端): 先启动候选容器监听 `127.0.0.1:18080` 并健康检查;
   通过后才切换生产容器到 `:80`(带 `--restart unless-stopped`), 再健康检查;
   **新版本失败自动回滚旧版**, 旧版未受影响。部署结果记录在
   `/opt/xerina-atlas/.deployed-version`。
6. **公网验证**: `curl http://118.89.18.90/healthz` 与首页, 200 才判定成功。
7. **清理**: 保留当前与上一版镜像, 删除更早镜像与服务器上的构建目录。

## 可配置环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DEPLOY_HOST` | `118.89.18.90` | 服务器地址 |
| `DEPLOY_USER` | `ubuntu` | SSH 用户 |
| `DEPLOY_SSH_KEY` | `~/.ssh/xerina_atlas_github_actions` | SSH 私钥 |
| `DEPLOY_DIR` | `/opt/xerina-atlas` | 远端部署目录 |
| `IMAGE_NAME` | `xerina-atlas` | 镜像名 |
| `CONTAINER_NAME` | `xerina-atlas` | 容器名 |
| `CANDIDATE_PORT` | `18080` | 候选容器监听端口 |

```bash
DEPLOY_SSH_KEY=~/.ssh/other_key ./deploy/deploy.sh --yes
```

## 与 CI/CD 的关系

本脚本与 `.github/workflows/ci-cd.yml` 使用相同的部署逻辑与远端脚本, 可在
GitHub Actions 不可用(或不想等 CI)时, 在本地一键完成同样的部署。SSH 私钥
`xerina_atlas_github_actions` 同时被 CI 的 `DEPLOY_SSH_KEY` secret 与本脚本使用。
