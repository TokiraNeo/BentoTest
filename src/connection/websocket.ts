/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { hostWebSocketConfig } from "@src/config.js";
import WebSocket from "ws";
import { randomUUID } from "crypto";
import type { RequestTask } from "@request/manager.js";
import { RequestManager } from "@request/manager.js";
import type {
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonValue,
} from "@protocol/jsonrpc.js";
import type {
  HostHelloParam,
  HostReadyParam,
  ToolRegisterParam,
} from "@protocol/jsonrpc/params.js";
import {
  HOST_HELLO,
  HOST_NAME,
  HOST_READY,
  JSON_RPC_VERSION,
  PROTOCOL_VERSION,
  TOOLS_REGISTER,
} from "@protocol/methods.js";
import {
  handleHostWelcome,
  handleNotification,
  handleRequest,
  handleResponse,
  handleToolRegistered,
} from "@connection/handlers.js";
import { toolRegistry } from "@tools/registry.js";
import { parseFrame } from "@protocol/dispatch.js";

export class HostWebSocket {
  private requestManager: RequestManager;
  private ws: WebSocket;

  constructor() {
    this.requestManager = new RequestManager();

    const { host, port, token } = hostWebSocketConfig.config;

    this.ws = new WebSocket(`ws://${host}:${port}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    this.ws.on("open", async () => {
      console.log(`Connected to Bento at ws://${host}:${port}`);
      this.onOpen();
    });

    this.ws.on("close", async () => {
      console.log(`Disconnected from Bento at ws://${host}:${port}`);
      this.onClose();
    });

    this.ws.on("error", console.error);

    this.ws.on("message", async (message) => {
      this.onMessage(message);
    });
  }

  private async request<P = JsonValue>(
    method: string,
    params: P,
    timeout: number = 5000,
  ): Promise<JsonRpcResponse> {
    const id = randomUUID();

    const result: Promise<JsonRpcResponse> = new Promise((resolve, reject) => {
      const task: RequestTask = {
        id: id,
        resolve: resolve,
        reject: reject,
      };

      this.requestManager.register(task);
    });

    const request: JsonRpcRequest<P> = {
      jsonrpc: JSON_RPC_VERSION,
      id: id,
      method: method,
      params: params,
    };

    this.ws.send(JSON.stringify(request));

    const timer = setTimeout(() => {
      this.requestManager.cancel(
        id,
        `Request ${id} timed out after ${timeout}ms.`,
      );
    }, timeout);

    return await result.finally(() => clearTimeout(timer));
  }

  private notify<P = JsonValue>(method: string, params: P): void {
    const notification: JsonRpcNotification<P> = {
      jsonrpc: JSON_RPC_VERSION,
      method: method,
      params: params,
    };

    this.ws.send(JSON.stringify(notification));
  }

  private response<P = JsonValue>(response: JsonRpcResponse<P>): void {
    this.ws.send(JSON.stringify(response));
  }

  private async onOpen() {
    // request host_hello
    try {
      const response = await this.request<HostHelloParam>(HOST_HELLO, {
        protocol_version: PROTOCOL_VERSION,
        host_name: HOST_NAME,
      });

      if (!handleHostWelcome(response)) {
        this.ws.close();
        return;
      }
    } catch (error) {
      console.error("Failed to receive host_welcome response:", error);
      this.ws.close();
      return;
    }

    // request tools_register
    try {
      const response = await this.request<ToolRegisterParam>(
        TOOLS_REGISTER,
        {
          tools: toolRegistry.definitions(),
        },
        300000, // 5 minutes timeout for tools_register
      );

      if (!handleToolRegistered(response)) {
        this.ws.close();
        return;
      }
    } catch (error) {
      console.error("Failed to receive tool_register response:", error);
      this.ws.close();
      return;
    }

    // notify host_ready
    this.notify<HostReadyParam>(HOST_READY, {});
  }

  private async onMessage(message: WebSocket.Data) {
    const text = message.toString();

    const frame = parseFrame(text);

    if (frame === undefined) {
      console.error("Failed to parse incoming message.");
      return;
    }

    switch (frame.kind) {
      case "request": {
        await handleRequest(frame.value, this.response.bind(this));
        break;
      }
      case "notification": {
        handleNotification(frame.value);
        break;
      }
      case "response": {
        handleResponse(frame.value, this.requestManager);
        break;
      }
    }
  }

  private async onClose() {
    this.requestManager.cancel_all();
  }
}
