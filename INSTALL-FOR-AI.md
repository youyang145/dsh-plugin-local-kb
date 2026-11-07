# 让别人的 AI 装这个插件

这份是给"另一个 AI"看的：你把下面这段丢给它，它照着做就行。

## 一段可以直接转发的话

> 请在 Windows 上帮我安装一个 DeepSeek Harness 插件：
> 仓库 `https://github.com/youyang145/dsh-plugin-local-kb`
> 步骤：
> 1. 确认 `dsh --version` 能跑；
> 2. 找到当前 profile 名（启动器设置里的 `profileName`，或问用户）；
> 3. 执行 `dsh plugin --profile <profile> add "https://github.com/youyang145/dsh-plugin-local-kb.git" --ignore-workspace-root-check`；
> 4. 如果 pnpm 报 store 不可写，加 `--store-dir <可写目录>` 重跑；
> 5. 装完检查 profile 的 `package.json`：`dependencies` 和 `dsh.profile.bundles` 里都要有 `dsh-plugin-local-kb`，缺 `bundles` 就手动补上；
> 6. 完全退出 DSH 再启动；
> 7. 验证：`dsh --profile <profile> --dump-config` 里出现 `id: local-kb`，页面右下角出现 K 按钮。

## 手工步骤（人看）

### 1. 前置

- Windows；
- DSH 已安装（启动器能起来）；
- Node 22+；
- 一个能写的 pnpm store 目录。

### 2. 找 profile

两种办法：

- 看启动器设置：`%APPDATA%\dsh-launcher\settings.json` 里的 `profileName`；
- 或者列目录：`%APPDATA%\dsh-launcher\dsh-packs\<pack>\profiles\<profile>`。

### 3. 安装

```powershell
dsh plugin --profile <你的 profile> add "https://github.com/youyang145/dsh-plugin-local-kb.git" `
  --ignore-workspace-root-check `
  --store-dir "F:\一个可写目录\pnpm-store"
```

`--store-dir` 不是必须，但如果报 `EPERM` 或 store 相关错误，加上它。

### 4. 检查两处

profile 的 `package.json`：

```json
{
  "dependencies": { "dsh-plugin-local-kb": "..." },
  "dsh": { "profile": { "bundles": [ "...", "dsh-plugin-local-kb" ] } }
}
```

`bundles` 决定启动时加载谁，缺了插件不会生效。

### 5. 重启并验证

- 完全退出 DSH（托盘也要退），再启动；
- `dsh --profile <profile> --dump-config` 里应出现 `id: local-kb`；
- 页面右下角出现 K 按钮；
- 让 AI 调一次 `kb_consult`，能返回分区目录。

## 常见错误

| 现象 | 原因 | 处理 |
|---|---|---|
| `EPERM rename lightningcss...` | DSH 正在运行，文件被占用 | 完全退出 DSH 再装 |
| `Unexpected token` 启动失败 | profile 的 package.json 带 BOM | 用无 BOM UTF-8 重写（见骨架文档《备份与恢复》同款注意） |
| pnpm store 报错 | 默认 store 不可写 | 加 `--store-dir` |
| 装完没反应 | `bundles` 里没有插件 | 手动补 `dsh-plugin-local-kb` 后重启 |
| K 按钮不出现 | 页面没注入 | 确认重启过、不是只刷新页面 |

## 卸载

1. 从 profile 的 `package.json` 里删掉 `dependencies` 和 `bundles` 中的 `dsh-plugin-local-kb`；
2. 删掉 `node_modules/dsh-plugin-local-kb`；
3. 重启 DSH。

## 提醒

这是 MVP：接口和字段还会变，升级前先备份知识库（面板 → 设置 → 数据与备份）。
出问题可以提 Issue，作者高三、周末才有空，回得慢。
