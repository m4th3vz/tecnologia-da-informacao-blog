// routes/about.js
const express = require('express');
const router = express.Router();

// Rota principal
router.get('/', (req, res) => {
  res.render('about', { title: 'About' });
});

module.exports = router;
