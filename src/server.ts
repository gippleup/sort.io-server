import express from 'express';
import chalk from 'chalk';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('헬로 월드 다시')
})

app.listen(PORT, () => {
  console.log(chalk`Server started listening on {bold.green http://localhost:${PORT}}`)
})