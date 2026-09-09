/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonRpcResponse } from "@protocol/jsonrpc.js";
import type { JsonValue } from "@protocol/jsonrpc.js";

export interface RequestTask {
  id: string;
  resolve: (
    value: JsonRpcResponse<JsonValue> | PromiseLike<JsonRpcResponse<JsonValue>>,
  ) => void;
  reject: (reason?: any) => void;
}

export class RequestManager {
  pendings: Map<string, RequestTask>;

  constructor() {
    this.pendings = new Map();
  }

  register(request: RequestTask) {
    this.pendings.set(request.id, request);
  }

  response(id: string, response: JsonRpcResponse): boolean {
    const task = this.pendings.get(id);

    if (!task) {
      return false;
    }

    task.resolve(response);
    this.pendings.delete(id);

    return true;
  }

  cancel(id: string, reason?: any): boolean {
    const task = this.pendings.get(id);

    if (task) {
      task.reject(reason);
    }

    return this.pendings.delete(id);
  }

  cancel_all() {
    for (const [id, task] of this.pendings) {
      task.reject(`Request ${id} was cancelled.`);
    }
    this.pendings.clear();
  }
}
