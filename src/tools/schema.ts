/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolCallResult } from "@protocol/jsonrpc/results.js";
import type { ToolDefinition, ToolRisk } from "@protocol/tool.js";
import * as z from "zod";

export interface ToolSchema {
  name: string;
  description: string;
  arguments: z.ZodObject<any>;
  risk?: ToolRisk;
  tags?: string[];
  executor: (
    args: z.infer<z.ZodObject<any>>,
  ) => ToolCallResult | Promise<ToolCallResult>;
}

export function covertSchemaToDefinition(schema: ToolSchema): ToolDefinition {
  const input_schema = z.toJSONSchema(schema.arguments, {
    io: "input",
    target: "draft-07",
  });

  return {
    name: schema.name,
    description: schema.description,
    input_schema: input_schema as ToolDefinition["input_schema"],
    risk: schema.risk,
    tags: schema.tags,
  };
}
