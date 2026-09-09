/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonValue } from "@protocol/jsonrpc.js";

export type ToolRisk = "normal" | "high";

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: { [key: string]: JsonValue };
  risk?: ToolRisk;
  tags?: string[];
}

export interface ToolCallContent {
  type: "text";
  text: string;
}

export function parseToolDefinition(value: JsonValue): ToolDefinition | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  if (typeof value.name !== "string" || typeof value.description !== "string") {
    return undefined;
  }

  if (!isObject(value.input_schema)) {
    return undefined;
  }

  const tool: ToolDefinition = {
    name: value.name,
    description: value.description,
    input_schema: value.input_schema,
  };

  if (value.risk !== undefined) {
    if (value.risk !== "normal" && value.risk !== "high") {
      return undefined;
    }
    tool.risk = value.risk;
  }

  if (value.tags !== undefined) {
    if (!Array.isArray(value.tags)) {
      return undefined;
    }

    const tags: string[] = [];
    for (const tag of value.tags) {
      if (typeof tag !== "string") {
        return undefined;
      }
      tags.push(tag);
    }
    tool.tags = tags;
  }

  return tool;
}

export function parseToolCallContent(value: JsonValue): ToolCallContent | undefined {
  if (!isObject(value) || value.type !== "text" || typeof value.text !== "string") {
    return undefined;
  }

  return { type: "text", text: value.text };
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
