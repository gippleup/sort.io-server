import mysql from 'mysql';
import dotenv from 'dotenv';
import * as typeorm from 'typeorm';
import chalk from 'chalk';

const config = dotenv.config();
if (config.error) {
  throw config.error;
}

const {DB_HOST, DB_USER, DB_PASS, DB_ENV, DB_PORT} = process.env;
typeorm.createConnection({
  type: 'mysql',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASS,
  database: DB_ENV,
})

const typeormInstance = typeorm.getConnection('default');
typeormInstance.connect()
  .then(() => console.log(chalk.greenBright('typeORM connected')))
  .catch((reason) => console.log(chalk.red(reason)))


const mysqlInstance = mysql.createConnection({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASS,
  database: DB_ENV,
});
mysqlInstance.connect();


const db = {
  mysql: mysqlInstance,
  orm: typeormInstance,
}

export default db;
