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
import { JSON_RPC_VERSION } from "@protocol/methods.js";

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

  if (hasId && hasMethod) {
    const request = parseRequest(raw);
    return request === undefined ? undefined : { kind: "request", value: request };
  }

  if (!hasId && hasMethod) {
    const notification = parseNotification(raw);
    return notification === undefined
      ? undefined
      : { kind: "notification", value: notification };
  }

  if (hasId && !hasMethod) {
    const response = parseResponse(raw);
    return response === undefined ? undefined : { kind: "response", value: response };
  }

  return undefined;
}

function parseRequest(raw: Record<string, unknown>): JsonRpcRequest | undefined {
  if (!hasOnlyKeys(raw, ["jsonrpc", "id", "method", "params"])) {
    return undefined;
  }

  if (raw.jsonrpc !== JSON_RPC_VERSION || typeof raw.id !== "string" || typeof raw.method !== "string") {
    return undefined;
  }

  const params = parseParams(raw.params);
  if (params === undefined) {
    return undefined;
  }

  return {
    jsonrpc: JSON_RPC_VERSION,
    id: raw.id,
    method: raw.method,
    params,
  };
}

function parseNotification(raw: Record<string, unknown>): JsonRpcNotification | undefined {
  if (!hasOnlyKeys(raw, ["jsonrpc", "method", "params"])) {
    return undefined;
  }

  if (raw.jsonrpc !== JSON_RPC_VERSION || typeof raw.method !== "string") {
    return undefined;
  }

  const params = parseParams(raw.params);
  if (params === undefined) {
    return undefined;
  }

  return {
    jsonrpc: JSON_RPC_VERSION,
    method: raw.method,
    params,
  };
}

function parseResponse(raw: Record<string, unknown>): JsonRpcResponse | undefined {
  if (raw.jsonrpc !== JSON_RPC_VERSION || typeof raw.id !== "string") {
    return undefined;
  }

  const response: JsonRpcResponse = {
    jsonrpc: JSON_RPC_VERSION,
    id: raw.id,
  };

  if (Object.hasOwn(raw, "result")) {
    if (!isJsonValue(raw.result)) {
      return undefined;
    }
    response.result = raw.result;
  }

  if (Object.hasOwn(raw, "error")) {
    const error = parseJsonRpcError(raw.error);
    if (error === undefined) {
      return undefined;
    }
    response.error = error;
  }

  return response;
}

function parseJsonRpcError(value: unknown): JsonRpcError | undefined {
  if (!isObject(value) || typeof value.code !== "number" || typeof value.message !== "string") {
    return undefined;
  }

  const error: JsonRpcError = {
    code: value.code,
    message: value.message,
  };

  if (Object.hasOwn(value, "payload")) {
    if (!isJsonValue(value.payload)) {
      return undefined;
    }
    error.payload = value.payload;
  }

  return error;
}

function parseParams(value: unknown): JsonValue | undefined {
  if (value === undefined) {
    return null;
  }

  return isJsonValue(value) ? value : undefined;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (isObject(value)) {
    return Object.values(value).every(isJsonValue);
  }

  return false;
}
