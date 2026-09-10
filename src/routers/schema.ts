/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonRpcRequest, JsonRpcResponse } from "@protocol/jsonrpc.js";

export type Responder = <P>(response: JsonRpcResponse<P>) => void;

export type Router = (
  request: JsonRpcRequest,
  responder: Responder,
) => void | Promise<void>;
