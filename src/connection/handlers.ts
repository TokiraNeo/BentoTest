/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcResponse,
} from "@protocol/jsonrpc.js";
import type { HostHelloParam } from "@protocol/jsonrpc/params.js";
import {
  HOST_HELLO,
  PROTOCOL_VERSION,
  JSON_RPC_VERSION,
} from "@protocol/methods.js";
import { parseFrame } from "@protocol/dispatch.js";
import { randomUUID } from "node:crypto";
import WebSocket from "ws";

export function handleHostHello(ws: WebSocket) {
  let id = randomUUID();

  let request: JsonRpcRequest<HostHelloParam> = {
    jsonrpc: JSON_RPC_VERSION,
    id: id,
    method: HOST_HELLO,
    params: {
      protocol_version: PROTOCOL_VERSION,
      host_name: "BentoTest",
    },
  };

  // todo: register request

  ws.send(JSON.stringify(request));
}

export function handleMessage(ws: WebSocket, message: WebSocket.Data) {}

function handleRequest(ws: WebSocket, request: JsonRpcRequest) {}

function handleNotification(ws: WebSocket, notification: JsonRpcNotification) {}

function handleResponse(ws: WebSocket, response: JsonRpcResponse) {}
