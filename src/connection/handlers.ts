/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonRpcResponse } from "@protocol/jsonrpc.js";
import {
  parseHostWelcomeResult,
  parseToolRegisterResult,
} from "@protocol/jsonrpc/results.js";

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
