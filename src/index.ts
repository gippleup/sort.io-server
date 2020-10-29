import "reflect-metadata";
import {createConnection} from "typeorm";

import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import router from './route'
import {handleUpgrade} from './websocket';
import cors from 'cors';

createConnection()
  .then(async connection => {})
  .catch(error => console.log(error));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/colormatch/server', router);

const server = app.listen(PORT, () => {
  console.log(chalk`Server started listening on {bold.green http://localhost:${PORT}}`)
  handleUpgrade(server);
})

