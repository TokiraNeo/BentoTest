/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { Responder, Router } from "@routers/schema.js";
import type { JsonRpcRequest } from "@protocol/jsonrpc.js";
import { JSON_RPC_VERSION, TOOL_CALL } from "@protocol/methods.js";
import { parseToolCallParam } from "@protocol/jsonrpc/params.js";
import type { ToolCallResult } from "@protocol/jsonrpc/results.js";
import { toolRegistry } from "@tools/registry.js";

export const routers: { method: string; router: Router }[] = [
  { method: TOOL_CALL, router: handleToolCall },
];

async function handleToolCall(request: JsonRpcRequest, responder: Responder) {
  if (request.method !== TOOL_CALL) {
    console.error(`Invalid method for handleToolCall: ${request.method}`);

    responder<ToolCallResult>({
      jsonrpc: JSON_RPC_VERSION,
      id: request.id,
      error: {
        code: -32601, // Method not found
        message: `Invalid method: ${request.method}`,
      },
    });

    return;
  }

  const params = parseToolCallParam(request.params);

  if (params === undefined) {
    console.error(
      `Invalid params for handleToolCall: ${JSON.stringify(request.params)}`,
    );

    responder<ToolCallResult>({
      jsonrpc: JSON_RPC_VERSION,
      id: request.id,
      error: {
        code: -32602, // Invalid params
        message: "Invalid params.",
      },
    });

    return;
  }

  const result = await toolRegistry.invoke(params.tool_name, params.arguments);

  console.log(
    `tool.call: ${params.tool_name} is_error=${result.is_error ?? false}`,
  );

  responder<ToolCallResult>({
    jsonrpc: JSON_RPC_VERSION,
    id: request.id,
    result: result,
  });
}
