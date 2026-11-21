# DSH 适配器 · dsh-plugin-local-kb

> **骨架（设计与规范）**：[youyang145/local-experience-kb](https://github.com/youyang145/local-experience-kb)
> **参考实现（核心库 + 面板）**：[youyang145/local-experience-kb-mvp](https://github.com/youyang145/local-experience-kb-mvp)
> 本目录是它的 **DeepSeek Harness 宿主适配器**：把库接进 DSH 的工具、系统提示和右下角挂件。

## 它做了什么

| 能力 | 说明 |
|---|---|
| 7 个工具 | `kb_consult` / `kb_deep` / `kb_index` / `kb_read` / `kb_stage` / `kb_record` / `kb_recommend` |
| 每轮索引 | `systemPrompt.section` 注入分区目录与召回规则，压缩不会盖掉 |
| 右下角挂件 | K 按钮 → 可拖动/缩放的面板小窗；待拍板入口 |
| 面板服务 | 懒启动 7788，不随 DSH 启动占端口 |
| MCP | 面板里的开关，`POST /mcp`，六个工具 + 连接编号 + 留痕 |

## 工具边界

| 工具 | 干什么 | 写不写库 |
|---|---|---|
| `kb_consult` | 先判要不要查（闲聊跳过），返回索引摘要 + 命中简介 + 反例警示 | 不写 |
| `kb_index` | 只看分区目录 | 不写 |
| `kb_read` | 按 id 读正文，最多 3 条 | 不写 |
| `kb_stage` | 材料分块放进「待分区」收件箱，最多 5 块 | 只写收件箱 |
| `kb_record` | 套用/复现记账（used / succeeded / occurrences） | 只改计数 |
| `kb_recommend` | 建议转正/推翻，必须带理由 | 只进「待拍板」，人决定 |

## 安装

直接装这个仓库：

```powershell
dsh plugin --profile <你的 profile> add "https://github.com/youyang145/dsh-plugin-local-kb.git" --ignore-workspace-root-check
```

或者本地目录：

```powershell
dsh plugin --profile <你的 profile> add "<仓库>\dsh-plugin" `
  --ignore-workspace-root-check `
  --store-dir "<可写目录>"
```

- `--store-dir` 指向可写目录，否则 pnpm 写默认 store 会报错；
- 装完 `dsh --profile <你的 profile> --dump-config` 里能看到 `id: local-kb`；
- 重启 DSH 生效。

## 配置

`cordis.patch.yml` 只需要一个 `home`（库根目录，含 `index.db`）：

```yaml
- insert:
    - id: local-kb
      name: 'dsh-plugin-local-kb'
      config:
        home: 'D:\kb\local-experience-kb'
        # widget: false   # 可选：不注入右下角挂件，用于排查嵌入冲突
```

## 运行环境（已验证 / 未验证）

| 项 | 要求 / 状态 |
|---|---|
| DSH | `0.2.1-rc.3` **运行实测**；`0.2.2-rc.5` 仅类型核对 |
| Node | 插件 `>=22.13.0`（依赖内置 `node:sqlite`）；DSH `0.2.2` 自带 `>=24.9` |
| 操作系统 | Windows x64 **实测**；Linux / macOS 未验证 |
| 安装方式 | 本地目录安装实测；GitHub 地址安装未验证 |
| 验证日期 | 2026-11-21 |

DSH 官方目前只发布 rc（最新 `0.2.2-rc.5`），没有稳定版。升级后按顺序验证：

1. `dump-config` 出现 `id: local-kb`；
2. 工具列表 6 个；
3. 右下角 K 挂件；
4. 面板能打开；
5. 索引注入有内容。

任一步失败就回退到 `0.2.1-rc.3`。

## 本地验证

```bash
node harness.mjs     # 假 ctx，跑七个工具
```

## 打包

```bash
npm pack             # files 已包含 lib/**、lib/web/**、widget.js
```

`lib/kb` 是核心库的打包副本，随插件发布同步一次；不是第二套维护。

## 限制

- 面板仍是独立进程（7788），懒启动；
- 自动索引只到"目录 + 召回规则"，正文要用 `kb_read` 按需读；
- 主库写入只由人在面板操作，工具没有直接写主库的权限。

## 许可

代码 Apache-2.0；设计文档与手稿在骨架仓库，CC BY 4.0。


