const express = require('express');
const { prisma } = require('../config');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


router.get(
  '/',
  validate(schemas.userList, 'query'),
  wrap(async (req, res) => {
    const { page, limit } = req.valid.query;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.user.count(),
    ]);
    res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  })
);

router.get(
  '/:id',
  validate(schemas.idParams, 'params'),
  wrap(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.valid.params.id },
      include: { posts: { orderBy: { createdAt: 'desc' } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  })
);


router.post(
  '/',
  validate(schemas.userCreate),
  wrap(async (req, res) => {
    const user = await prisma.user.create({ data: req.valid.body });
    res.status(201).json(user);
  })
);


router.patch(
  '/:id',
  validate(schemas.idParams, 'params'),
  validate(schemas.userUpdate),
  wrap(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.valid.params.id },
      data: req.valid.body,
    });
    res.json(user);
  })
);


router.delete(
  '/:id',
  validate(schemas.idParams, 'params'),
  wrap(async (req, res) => {
    await prisma.user.delete({ where: { id: req.valid.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
