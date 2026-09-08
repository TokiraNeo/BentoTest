/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface JsonRpcError {
  code: number;
  message: string;
  payload?: JsonValue;
}

export interface JsonRpcRequest<P = JsonValue> {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: P;
}

export interface JsonRpcNotification<P = JsonValue> {
  jsonrpc: "2.0";
  method: string;
  params: P;
}

export interface JsonRpcResponse<R = JsonValue> {
  jsonrpc: "2.0";
  id: string;
  result?: R;
  error?: JsonRpcError;
}
