/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolDefinition } from "@protocol/tool.js";
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
