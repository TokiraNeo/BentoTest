/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolDefinition } from "@protocol/tool.js";
import { parseToolDefinition } from "@protocol/tool.js";
import type { JsonValue } from "@protocol/jsonrpc.js";

export interface HostHelloParam {
  protocol_version: string;
  host_name: string;
}

export type HostReadyParam = Record<string, never>;

export interface ToolRegisterParam {
  tools: ToolDefinition[];
}

export interface ToolCallParam {
  tool_name: string;
  arguments: JsonValue;
}

export function parseHostHelloParam(value: JsonValue): HostHelloParam | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  if (typeof value.protocol_version !== "string" || typeof value.host_name !== "string") {
    return undefined;
  }

  return {
    protocol_version: value.protocol_version,
    host_name: value.host_name,
  };
}

export function parseHostReadyParam(value: JsonValue): HostReadyParam | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  return {};
}

export function parseToolRegisterParam(value: JsonValue): ToolRegisterParam | undefined {
  if (!isObject(value) || !Array.isArray(value.tools)) {
    return undefined;
  }

  const tools: ToolDefinition[] = [];
  for (const item of value.tools) {
    const tool = parseToolDefinition(item);
    if (tool === undefined) {
      return undefined;
    }
    tools.push(tool);
  }

  return { tools };
}

export function parseToolCallParam(value: JsonValue): ToolCallParam | undefined {
  if (!isObject(value) || typeof value.tool_name !== "string") {
    return undefined;
  }

  return {
    tool_name: value.tool_name,
    arguments: value.arguments === undefined ? null : value.arguments,
  };
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
