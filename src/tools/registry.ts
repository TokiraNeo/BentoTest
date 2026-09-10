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
import type { JsonValue } from "@protocol/jsonrpc.js";

export class ToolRegistry {
  private tools: Map<string, ToolSchema>;

  constructor() {
    this.tools = new Map();
  }

  private register(tool: ToolSchema): void {
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

  async invoke(tool: string, args: JsonValue): Promise<ToolCallResult> {
    const toolSchema = this.tools.get(tool);
    if (!toolSchema) {
      return {
        content: [{ type: "text", text: `Tool "${tool}" is not found.` }],
        is_error: true,
      };
    }

    const parsed = toolSchema.arguments.safeParse(args);

    if (!parsed.success) {
      return {
        content: [{ type: "text", text: z.prettifyError(parsed.error) }],
        is_error: true,
      };
    }

    try {
      return await toolSchema.executor(parsed.data);
    } catch (error) {
      return {
        content: [{ type: "text", text: String(error) }],
        is_error: true,
      };
    }
  }
}

export const toolRegistry = new ToolRegistry();
