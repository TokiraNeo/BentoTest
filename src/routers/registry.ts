/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonRpcRequest } from "@protocol/jsonrpc.js";
import type { Router, Responder } from "@routers/schema.js";
import { JSON_RPC_VERSION } from "@protocol/methods.js";

export class RouterRegistry {
  private routers: Map<string, Router>;

  constructor() {
    this.routers = new Map();
  }

  private register(method: string, router: Router) {
    if (this.routers.has(method)) {
      throw new Error(`Router for method "${method}" is already registered.`);
    }
    this.routers.set(method, router);
  }

  register_routers(routers: { method: string; router: Router }[]) {
    for (const { method, router } of routers) {
      try {
        this.register(method, router);
      } catch (error) {
        console.error(
          `Failed to register router for method "${method}": ${error}`,
        );
      }
    }
  }

  async invoke(request: JsonRpcRequest, responder: Responder) {
    const method = request.method;

    const router = this.routers.get(method);
    if (!router) {
      console.error(`Router for method "${method}" is not registered.`);

      responder({
        jsonrpc: JSON_RPC_VERSION,
        id: request.id,
        error: {
          code: -32601,
          message: `Router for method "${method}" is not registered.`,
        },
      });

      return;
    }

    try {
      await router(request, responder);
    } catch (error) {
      console.error(`Router for method "${method}" failed:`, error);
      responder({
        jsonrpc: JSON_RPC_VERSION,
        id: request.id,
        error: {
          code: -32603,
          message: String(error),
        },
      });
    }
  }
}

export const routerRegistry = new RouterRegistry();
