// 0) Stub do BroadcastChannel para o MSW
// @ts-ignore
global.BroadcastChannel = class {
  constructor() {}
  postMessage() {}
  close() {}
};

// 1) Polyfill de TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
;(global as any).TextEncoder = TextEncoder;
;(global as any).TextDecoder = TextDecoder;

// 2) Polyfill de Streams (Node 18+)
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
;(global as any).ReadableStream = ReadableStream;
;(global as any).WritableStream = WritableStream;
;(global as any).TransformStream = TransformStream;

global.ResizeObserver = class {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// 3) matchers do jest-dom
require('@testing-library/jest-dom');

// 4) fetch polyfill
require('whatwg-fetch');

// 5) Mock Service Worker (Node)
const { server } = require('./src/mocks/node');

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
