/*
 * ---- BentoTest ----
 * Copyright (C) 2026-present TokiraNeo <TokiraNeo@outlook.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { JsonRpcResponse } from "@/protocol/jsonrpc.js";

export interface RequestTask {
  id: string;
  responder: Promise<JsonRpcResponse>;
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

    task.responder = Promise.resolve(response);
    this.pendings.delete(id);

    return true;
  }

  cancel(id: string): boolean {
    return this.pendings.delete(id);
  }
}
