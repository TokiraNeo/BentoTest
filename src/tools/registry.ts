/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as z from "zod";
import type { ToolSchema } from "@tools/schema.js";
import type { ToolCallResult } from "@protocol/jsonrpc/results.js";
import type { ToolDefinition } from "@protocol/tool.js";
import { covertSchemaToDefinition } from "@tools/schema.js";

export class ToolRegistry {
  private tools: Map<string, ToolSchema>;

  constructor() {
    this.tools = new Map();
  }

  register(tool: ToolSchema): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  register_toolset(set: ToolSchema[]): void {
    for (const tool of set) {
      try {
        this.register(tool);
      } catch (error) {
        console.error(`Failed to register tool "${tool.name}": ${error}`);
      }
    }
  }

  definitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(covertSchemaToDefinition);
  }

  async invoke(
    tool: string,
    args: z.infer<z.ZodObject<any>>,
  ): Promise<ToolCallResult> {
    const toolSchema = this.tools.get(tool);
    if (!toolSchema) {
      throw new Error(`Tool with name "${tool}" is not registered.`);
    }
    return await toolSchema.executor(args);
  }
}

export const toolRegistry = new ToolRegistry();
