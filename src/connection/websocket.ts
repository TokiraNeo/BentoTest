/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { hostWebSocketConfig } from "@/config.js";
import WebSocket from "ws";
import { handleMessage } from "@connection/handlers.js";
import { randomUUID } from "crypto";
import { RequestManager } from "@request/manager.js";
import type { RequestTask } from "@request/manager.js";
import type { JsonRpcRequest, JsonRpcResponse } from "@/protocol/jsonrpc.js";
import type { HostHelloParam } from "@/protocol/jsonrpc/params.js";
import {
  HOST_HELLO,
  JSON_RPC_VERSION,
  PROTOCOL_VERSION,
} from "@/protocol/methods.js";

export class HostWebSocket {
  private requestManager: RequestManager;
  private ws: WebSocket;

  constructor() {
    this.requestManager = new RequestManager();

    const { host, port } = hostWebSocketConfig.config;

    this.ws = new WebSocket(`ws://${host}:${port}`);

    this.ws.on("open", () => {
      console.log(`Connected to Bento at ws://${host}:${port}`);
    });

    this.ws.on("close", () => {
      console.log(`Disconnected from Bento at ws://${host}:${port}`);
    });

    this.ws.on("error", console.error);

    this.ws.on("message", (message) => {
      handleMessage(this.ws, message);
    });
  }

  start() {
    const id = randomUUID();

    const task: RequestTask = {
      id: id,
      responder: new Promise((resolve, reject) => {}),
    };

    this.requestManager.register(task);

    const request: JsonRpcRequest<HostHelloParam> = {
      jsonrpc: JSON_RPC_VERSION,
      id: id,
      method: HOST_HELLO,
      params: {
        protocol_version: PROTOCOL_VERSION,
        host_name: "BentoTest",
      },
    };

    this.ws.send(JSON.stringify(request));

    // @todo: wait for response with a timeout
  }
}
