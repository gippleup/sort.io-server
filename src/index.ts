import "reflect-metadata";
import {createConnection} from "typeorm";

import express, {Request, Response} from 'express';
import chalk from 'chalk';
import router from './route'
import { Socket } from "net";
import url from 'url';
import Ws from 'ws';

createConnection()
  .then(async connection => {})
  .catch(error => console.log(error));

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', router)

const server = app.listen(PORT, () => {
  console.log(chalk`Server started listening on {bold.green http://localhost:${PORT}}`)
  const wss1 = new Ws.Server({ noServer: true })
  const wss2 = new Ws.Server({ noServer: true })
  server.on('upgrade', (req: Request, socket: Socket, head) => {
    console.log(req)
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/foo') {
      wss1.handleUpgrade(req, socket, head, (ws) => {
        wss1.emit('connection', ws, req);
      })
    } else if (pathname === '/bar') {
      wss2.handleUpgrade(req, socket, head, (ws) => {
        wss2.emit('connection', ws, req);
      })
    } else {
      socket.destroy();
    }
  })
})

