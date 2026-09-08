/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getEnv } from "@utility/envUtility.js";

interface HostWebSocketConfig {
  host: string;
  port: number;
}

export const hostWebSocketConfig = {
  get config(): HostWebSocketConfig {
    return {
      host: getEnv("HOST", "127.0.0.1"),
      port: Number(getEnv("PORT", "2483")),
    };
  },
};
