/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { RequestManager } from "@request/manager.js";
import type {
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcResponse,
} from "@protocol/jsonrpc.js";
import {
  parseHostWelcomeResult,
  parseToolRegisterResult,
} from "@protocol/jsonrpc/results.js";
import type { Responder } from "@routers/schema.js";
import { routerRegistry } from "@routers/registry.js";

export function handleHostWelcome(response: JsonRpcResponse): boolean {
  if (response.error) {
    console.error(
      `Host welcome error: ${response.error.code} - ${response.error.message}`,
    );
    return false;
  }

  if (!response.result) {
    console.error("Host welcome response missing result.");
    return false;
  }

  const result = parseHostWelcomeResult(response.result);

  if (!result) {
    console.error("Failed to parse host_welcome result.");
    return false;
  }

  console.log(
    `Host welcome result - namespace: ${result.namespace}, bento: ${result.bento_version}`,
  );

  return true;
}

export function handleToolRegistered(response: JsonRpcResponse): boolean {
  if (response.error) {
    console.error(
      `Tool registered error: ${response.error.code} - ${response.error.message}`,
    );
    return false;
  }

  if (!response.result) {
    console.error("Tool registered response missing result.");
    return false;
  }

  const result = parseToolRegisterResult(response.result);

  if (!result) {
    console.error("Failed to parse tool_registered result.");
    return false;
  }

  console.log(`Tool Registered result - count: ${result.count}`);

  return true;
}

export async function handleRequest(
  request: JsonRpcRequest,
  responder: Responder,
) {
  await routerRegistry.invoke(request, responder);
}

export function handleNotification(_notification: JsonRpcNotification): void {
  // @TODO: handle notifications from the host if needed in the future
}

export function handleResponse(
  response: JsonRpcResponse,
  manager: RequestManager,
): void {
  const id = response.id;

  manager.response(id, response);
}
