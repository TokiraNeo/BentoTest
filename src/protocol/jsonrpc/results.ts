/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ToolCallContent } from "@protocol/tool.js";

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
