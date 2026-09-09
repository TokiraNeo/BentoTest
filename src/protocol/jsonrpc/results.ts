/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolCallContent } from "@protocol/tool.js";
import { parseToolCallContent } from "@protocol/tool.js";
import type { JsonValue } from "@protocol/jsonrpc.js";

export interface HostWelcomeResult {
  namespace: string;
  protocol_version: string;
  bento_version: string;
}

export interface ToolRegisterResult {
  count: number;
}

export interface ToolCallResult {
  content: ToolCallContent[];
  is_error?: boolean;
}

export function parseHostWelcomeResult(value: JsonValue): HostWelcomeResult | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  if (
    typeof value.namespace !== "string" ||
    typeof value.protocol_version !== "string" ||
    typeof value.bento_version !== "string"
  ) {
    return undefined;
  }

  return {
    namespace: value.namespace,
    protocol_version: value.protocol_version,
    bento_version: value.bento_version,
  };
}

export function parseToolRegisterResult(value: JsonValue): ToolRegisterResult | undefined {
  if (!isObject(value) || typeof value.count !== "number") {
    return undefined;
  }

  return { count: value.count };
}

export function parseToolCallResult(value: JsonValue): ToolCallResult | undefined {
  if (!isObject(value) || !Array.isArray(value.content)) {
    return undefined;
  }

  const content: ToolCallContent[] = [];
  for (const item of value.content) {
    const block = parseToolCallContent(item);
    if (block === undefined) {
      return undefined;
    }
    content.push(block);
  }

  const result: ToolCallResult = { content };

  if (value.is_error !== undefined) {
    if (typeof value.is_error !== "boolean") {
      return undefined;
    }
    result.is_error = value.is_error;
  }

  return result;
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
