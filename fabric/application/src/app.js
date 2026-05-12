const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'qdatamarket' });
});

app.post('/products', (req, res) => {
  res.status(202).json({
    accepted: true,
    operation: 'RegisterProduct',
    body: req.body
  });
});

app.post('/orders', (req, res) => {
  res.status(202).json({
    accepted: true,
    operation: 'CreateOrder',
    body: req.body
  });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`qdatamarket api listening on ${port}`));
}

module.exports = { app };
