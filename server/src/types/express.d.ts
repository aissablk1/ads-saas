import { IncomingMessage } from 'http';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      rawBody?: Buffer;
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}