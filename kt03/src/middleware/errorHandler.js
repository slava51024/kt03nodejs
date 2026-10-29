const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};


const errorHandler = (err, req, res, next) => {

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint failed',
      fields: err.meta && err.meta.target,
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Related record does not exist' });
  }

  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = { notFound, errorHandler };
