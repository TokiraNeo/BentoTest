/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { hostWebSocketConfig } from "@/config.js";
import WebSocket from "ws";
import { randomUUID } from "crypto";
import { RequestManager } from "@request/manager.js";
import type { RequestTask } from "@request/manager.js";
import type {
  JsonRpcError,
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
  HOST_READY,
  JSON_RPC_VERSION,
  PROTOCOL_VERSION,
  TOOLS_REGISTER,
} from "@protocol/methods.js";
import {
  handleHostWelcome,
  handleToolRegistered,
} from "@connection/handlers.js";
import { toolRegistry } from "@tools/registry.js";

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

    const resp = await result.finally(() => clearTimeout(timer));

    return resp;
  }

  private notify<P = JsonValue>(method: string, params: P): void {
    const notification: JsonRpcNotification<P> = {
      jsonrpc: JSON_RPC_VERSION,
      method: method,
      params: params,
    };

    this.ws.send(JSON.stringify(notification));
  }

  private response<P = JsonValue>(id: string, payload: P): void {
    const response: JsonRpcResponse<P> = {
      jsonrpc: JSON_RPC_VERSION,
      id: id,
      result: payload,
    };

    this.ws.send(JSON.stringify(response));
  }

  private response_error(id: string, error: JsonRpcError): void {
    const response: JsonRpcResponse = {
      jsonrpc: JSON_RPC_VERSION,
      id: id,
      error: error,
    };

    this.ws.send(JSON.stringify(response));
  }

  private async onOpen() {
    // request host_hello
    try {
      const response = await this.request<HostHelloParam>(HOST_HELLO, {
        protocol_version: PROTOCOL_VERSION,
        host_name: "BentoTest",
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
        Infinity,
      );

      if (!handleToolRegistered(response)) {
        this.ws.close();
        return;
      }
    } catch (error) {}

    // notify host_ready
    this.notify<HostReadyParam>(HOST_READY, {});
  }

  private async onMessage(message: WebSocket.Data) {}

  private async onClose() {
    this.requestManager.cancel_all();
  }
}
