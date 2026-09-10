/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolSchema } from "@tools/schema.js";
import * as z from "zod";

const confirmDangerArgs = z.object({
  reason: z.string(),
});

const confirmDangerTool: ToolSchema<typeof confirmDangerArgs> = {
  name: "confirm_danger",
  description:
    "High-risk test tool that echoes a reason. Used to verify Hub approval.",
  risk: "high",
  tags: ["test", "approval"],
  arguments: confirmDangerArgs,
  executor: (args) => {
    console.log(`confirm_danger: ${args.reason}`);
    return {
      content: [{ type: "text", text: `approved: ${args.reason}` }],
    };
  },
};

export const highTools: ToolSchema[] = [confirmDangerTool];
