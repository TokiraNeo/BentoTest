/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type {
  JsonRpcError,
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonValue,
} from "@protocol/jsonrpc.js";

export type Frame =
  | { kind: "request"; value: JsonRpcRequest }
  | { kind: "response"; value: JsonRpcResponse }
  | { kind: "notification"; value: JsonRpcNotification };

export function parseFrame(text: string): Frame | undefined {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return undefined;
  }

  if (!isObject(raw)) {
    return undefined;
  }

  const hasId = Object.hasOwn(raw, "id");
  const hasMethod = Object.hasOwn(raw, "method");



  return undefined;
}



function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
