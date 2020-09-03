import { Server } from "http";
import { Socket } from "net";
import url from "url";
import { Request, Response } from 'express';
import Ws from 'ws';
import wsContoller from './routes/index';

const wss = new Ws.Server({ noServer: true });
export const handleUpgrade = (server: Server) => {
  server.on('upgrade', (req: Request, socket: Socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/match') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
        ws.on('message', (message) => {
          wsContoller(message, ws, wss)
        })
        ws.on('close', (code, reason) => {
          console.log(code, reason);
        })
      })
    }
  })
}
