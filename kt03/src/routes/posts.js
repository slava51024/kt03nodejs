const express = require('express');
const { prisma, config } = require('../config');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const include = {
  author: { select: { id: true, email: true, name: true, role: true } },
  tags: true,
};

const tagsConnectOrCreate = (names) =>
  [...new Set(names)].map((name) => ({ where: { name }, create: { name } }));

router.get(
  '/',
  validate(schemas.postList, 'query'),
  wrap(async (req, res) => {
    const { page, limit, search, published, authorId } = req.valid.query;

    const where = {};
    if (search) {
      where.title = config.isPostgres
        ? { contains: search, mode: 'insensitive' }
        : { contains: search };
    }
    if (published !== undefined) where.published = published;
    if (authorId !== undefined) where.authorId = authorId;

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  })
);


router.get(
  '/:id',
  validate(schemas.idParams, 'params'),
  wrap(async (req, res) => {
    const post = await prisma.post.findUnique({
      where: { id: req.valid.params.id },
      include,
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  })
);


router.post(
  '/',
  validate(schemas.postCreate),
  wrap(async (req, res) => {
    const { title, content, published, authorId, tags } = req.valid.body;

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId,
        tags: { connectOrCreate: tagsConnectOrCreate(tags) },
      },
      include,
    });
    res.status(201).json(post);
  })
);


router.patch(
  '/:id',
  validate(schemas.idParams, 'params'),
  validate(schemas.postUpdate),
  wrap(async (req, res) => {
    const { tags, authorId, ...rest } = req.valid.body;
    const data = { ...rest };

    if (authorId !== undefined) {
      const author = await prisma.user.findUnique({ where: { id: authorId } });
      if (!author) return res.status(404).json({ error: 'Author not found' });
      data.authorId = authorId;
    }
    if (tags !== undefined) {
      
      data.tags = { set: [], connectOrCreate: tagsConnectOrCreate(tags) };
    }

    const post = await prisma.post.update({
      where: { id: req.valid.params.id },
      data,
      include,
    });
    res.json(post);
  })
);


router.delete(
  '/:id',
  validate(schemas.idParams, 'params'),
  wrap(async (req, res) => {
    await prisma.post.delete({ where: { id: req.valid.params.id } });
    res.status(204).send();
  })
);

module.exports = router;
