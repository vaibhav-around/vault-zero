// Fix for isomorphic-ws in Next.js browser environment
const ws = typeof window !== 'undefined' ? window.WebSocket : null;
export default ws;
export { ws as WebSocket };
