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
