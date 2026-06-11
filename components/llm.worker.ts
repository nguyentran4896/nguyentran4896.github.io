/**
 * components/llm.worker.ts
 * Web Worker that hosts the WebLLM engine to keep the main thread unblocked.
 * Bundled by Next.js / webpack via new Worker(new URL('./llm.worker.ts', import.meta.url)).
 */

import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm"

// Instantiate the handler — it wires up onmessage internally.
// Per the web-llm docs: const handler = new WebWorkerMLCEngineHandler();
// onmessage = handler.onmessage is then set automatically.
const handler = new WebWorkerMLCEngineHandler()
self.onmessage = (event: MessageEvent) => handler.onmessage(event)
