# BentoTest

Bento 的假宿主：用 TypeScript 手写 JSON-RPC，连 Hub 的 WebSocket 端口，验证握手 / 注册 / 调用。

协议原型在 `src/protocol/`，字段与 Bento 的 `docs/jsonrpc.md` 对齐。

## 开发

Hub 需要先在 Desktop 里启动引擎（默认 `127.0.0.1:2483`）。

```bash
pnpm install
pnpm env:init
pnpm dev
```

连接地址读 `.env` 的 `HOST` / `PORT` / `TOKEN`（已有的进程环境变量优先）。Hub 配了 token 时，`.env` 里的 `TOKEN` 要一致。
