import "reflect-metadata";
import {createConnection} from "typeorm";

import express from 'express';
import chalk from 'chalk';
import router from './route'

createConnection().then(async connection => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use('/', router)

  app.listen(PORT, () => {
    console.log(chalk`Server started listening on {bold.green http://localhost:${PORT}}`)
  })

}).catch(error => console.log(error));
