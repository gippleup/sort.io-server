import "reflect-metadata";
import {createConnection} from "typeorm";

import express, {Request, Response} from 'express';
import chalk from 'chalk';
import router from './route'
import {handleUpgrade} from './websocket'

createConnection()
  .then(async connection => {})
  .catch(error => console.log(error));

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', router)

const server = app.listen(PORT, () => {
  console.log(chalk`Server started listening on {bold.green http://localhost:${PORT}}`)
  handleUpgrade(server);
})

