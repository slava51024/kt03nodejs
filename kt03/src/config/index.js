require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,

  isPostgres: databaseUrl.startsWith('postgres'),
};

const prisma = new PrismaClient();

module.exports = { config, prisma };
