import express from 'express';
import { promises as fs } from 'fs';
import { createSecureContext } from 'tls';

const { readFile, writeFile } = fs;
const router = express.Router();

//GET
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
  } catch (err) {
    next(err);
  }
});

//POST TOTAL ALUNO
router.post('/total', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grades = data.grades.filter(
      (grade) =>
        grade.student === req.body.student && grade.subject === req.body.subject
    );

    const total = grades.reduce((prev, curr) => {
      return prev + curr.value;
    }, 0);

    res.send({ total });
  } catch (err) {
    next(err);
  }
});

//POST MEDIA
router.post('/media', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const grades = data.grades.filter(
      (grade) =>
        grade.subject === req.body.subject && grade.type === req.body.type
    );

    if (!grades.length) {
      throw new Error('Registros não foram encontrados');
    }

    const total = grades.reduce((prev, curr) => {
      return prev + curr.value;
    }, 0);

    res.send({ media: total / grades.length });
  } catch (err) {
    next(err);
  }
});

//POST TOP 3 NOTAS
router.post('/topTree', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const grades = data.grades.filter(
      (grade) =>
        grade.subject === req.body.subject && grade.type === req.body.type
    );

    if (!grades.length) {
      throw new Error('Registros não foram encontrados');
    }

    const topTree = grades.sort((a, b) => {
      if (a.value < b.value) return 1;
      else if (a.value > b.value) return -1;
      else return 0;
    });

    res.send(topTree.slice(0, 3));
  } catch (err) {
    next(err);
  }
});

// GET ID
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );

    if (grade) {
      res.send(grade);
    } else {
      throw new Error('ID não existente');
    }
  } catch (err) {
    next(err);
  }
});

//POST
router.post('/', async (req, res, next) => {
  try {
    let grades = req.body;

    if (
      !grades.student ||
      !grades.subject ||
      !grades.type ||
      grades.value == null
    ) {
      throw new Error('Os campos são obrigatórios');
    }

    const data = JSON.parse(await readFile(global.fileName));

    grades = {
      id: data.nextId++,
      student: grades.student,
      subject: grades.subject,
      type: grades.type,
      value: grades.value,
      timestamp: new Date(),
    };

    data.grades.push(grades);
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(grades);
  } catch (err) {
    next(err);
  }
});

//PUT
router.put('/', async (req, res, next) => {
  try {
    let grade = req.body;
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex((ind) => ind.id === grade.id);

    if (index === -1) {
      throw new Error('ID não existente');
    }

    if (grade.student) {
      data.grades[index].student = grade.student;
    }

    if (grade.subject) {
      data.grades[index].subject = grade.subject;
    }

    if (grade.type) {
      data.grades[index].type = grade.type;
    }

    if (grade.value) {
      data.grades[index].value = grade.value;
    }

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(data.grades[index]);
  } catch (err) {
    next(err);
  }
});

//DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));

    const index = data.grades.findIndex(
      (ind) => ind.id === parseInt(req.params.id)
    );
    if (index === -1) {
      throw new Error('ID não existente');
    }

    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send({ error: err.message });
});

// EXPORTANDO METODOS
export default router;
