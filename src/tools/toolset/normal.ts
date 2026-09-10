/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolSchema } from "@tools/schema.js";
import * as z from "zod";

const echoArgs = z.object({
  text: z.string(),
});

const echoTool: ToolSchema<typeof echoArgs> = {
  name: "echo",
  description: "Echo the given text back. Used to verify a normal tool.call.",
  risk: "normal",
  tags: ["test"],
  arguments: echoArgs,
  executor: (args) => {
    console.log(`echo: ${args.text}`);
    return {
      content: [{ type: "text", text: args.text }],
    };
  },
};

export const normalTools: ToolSchema[] = [echoTool];
