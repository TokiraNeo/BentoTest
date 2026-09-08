# BentoTest

Bento 的假宿主：用 TypeScript 手写 JSON-RPC，连 Hub 的 WebSocket 端口，验证握手 / 注册 / 调用。

协议原型在 `src/protocol/`，字段与 Bento 的 `crates/protocol/docs/jsonrpc.md` 对齐。

## 开发

```bash
pnpm install
pnpm dev
```
