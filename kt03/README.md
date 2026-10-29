# kt03 — REST API блог-платформы (Express + Prisma)

## Запуск
```bash
npm install
npx prisma migrate dev --name init   # создаёт миграцию и БД (SQLite) + generate
npm start                            # http://localhost:3000
```

## PostgreSQL вместо SQLite
1. В `prisma/schema.prisma` поменяйте `provider = "sqlite"` на `"postgresql"`.
2. В `.env` укажите `DATABASE_URL="postgresql://user:password@localhost:5432/blog?schema=public"`.
3. Удалите `prisma/migrations` (кроме .gitkeep) и снова выполните `npx prisma migrate dev --name init`.

## Эндпоинты
| Метод | URL | Описание |
|---|---|---|
| GET | /api/users?page=&limit= | список с пагинацией |
| GET | /api/users/:id | пользователь с постами (новые сверху) |
| POST | /api/users | создать (email, name, role?) |
| PATCH | /api/users/:id | обновить |
| DELETE | /api/users/:id | удалить (204) |
| GET | /api/posts?search=&published=&authorId=&page=&limit= | список с фильтрами, ответ `{data, meta:{total,page,limit,pages}}` |
| GET | /api/posts/:id | пост с автором и тегами |
| POST | /api/posts | title, content, published, authorId, tags[] (connectOrCreate) |
| PATCH | /api/posts/:id | обновить |
| DELETE | /api/posts/:id | удалить (204) |

## Примеры
```bash
curl -X POST localhost:3000/api/users -H "Content-Type: application/json" -d '{"email":"a@a.ru","name":"Аня"}'
curl -X POST localhost:3000/api/posts -H "Content-Type: application/json" -d '{"title":"Hello","authorId":1,"tags":["js","prisma"],"published":true}'
curl "localhost:3000/api/posts?search=hel&published=true&authorId=1&page=1&limit=5"
```
