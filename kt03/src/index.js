const express = require('express');
const { config, prisma } = require('./config');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`Server started on http://localhost:${config.port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
