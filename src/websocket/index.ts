import { Server } from "http";
import { Socket } from "net";
import url from "url";
import { Request, Response } from 'express';
import Ws from 'ws';

const wss = new Ws.Server({ noServer: true });
export const handleUpgrade = (server: Server) => {
  server.on('upgrade', (req: Request, socket: Socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/match') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
        ws.on('message', (message) => {
          ws.send(message)
        })
      })
    }
  })
}
