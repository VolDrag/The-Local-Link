export const validate = (schema) => (req, res, next) => {
  const payload = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const result = schema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: issues[0]?.message || 'Invalid input',
      errors: issues,
    });
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = { ...req.query, ...result.data.query };
  if (result.data.params) req.params = { ...req.params, ...result.data.params };
  next();
};
