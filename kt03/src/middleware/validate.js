const Joi = require('joi');


const validate = (schema, source = 'body') => (req, res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
    });
  }

  req.valid = req.valid || {};
  req.valid[source] = value;
  next();
};

const idParams = Joi.object({ id: Joi.number().integer().positive().required() });

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

const schemas = {
  idParams,


  userList: Joi.object({ ...pagination }),
  userCreate: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().trim().min(1).required(),
    role: Joi.string().valid('USER', 'ADMIN'),
  }),
  userUpdate: Joi.object({
    email: Joi.string().email(),
    name: Joi.string().trim().min(1),
    role: Joi.string().valid('USER', 'ADMIN'),
  }).min(1),

  // ---- posts ----
  postList: Joi.object({
    ...pagination,
    search: Joi.string().allow(''),
    published: Joi.boolean(),
    authorId: Joi.number().integer().positive(),
  }),
  postCreate: Joi.object({
    title: Joi.string().trim().min(1).required(),
    content: Joi.string().allow('', null),
    published: Joi.boolean(),
    authorId: Joi.number().integer().required(),
    tags: Joi.array().items(Joi.string().trim().min(1)).default([]),
  }),
  postUpdate: Joi.object({
    title: Joi.string().trim().min(1),
    content: Joi.string().allow('', null),
    published: Joi.boolean(),
    authorId: Joi.number().integer(),
    tags: Joi.array().items(Joi.string().trim().min(1)),
  }).min(1),
};

module.exports = { validate, schemas };
