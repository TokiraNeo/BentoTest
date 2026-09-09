/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { toolSets } from "@tools/toolset/index.js";
import { toolRegistry } from "@tools/registry.js";

for (const set of toolSets) {
  toolRegistry.register_toolset(set);
}
