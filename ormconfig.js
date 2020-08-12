const dotenv = require('dotenv')
dotenv.config({
  path: './.env'
})

const {DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_ENV} = process.env;

module.exports = {
  "type": "mysql",
  "host": DB_HOST,
  "port": DB_PORT,
  "username": DB_USER,
  "password": DB_PASS,
  "database": DB_ENV,
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/entity/**/*.ts"
  ],
  "migrations": [
    "src/migration/**/*.ts"
  ],
  "subscribers": [
    "src/subscriber/**/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/entity",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
}