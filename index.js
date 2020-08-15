import express from 'express';
import { promises as fs } from 'fs';
import gradesRouter from './routes/grades.js';

global.fileName = 'grades.json';
const { readFile, writeFile } = fs;

const app = express();
app.use(express.json());
app.use('/grades', gradesRouter);

app.listen(8080, async () => {
  try {
    await readFile(global.fileName);
    console.log('API STARTED');
  } catch (error) {
    const initialJson = {
      nextId: 1,
      grades: [],
    };
    await writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        logger.info('API Started e global.fileName created');
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
