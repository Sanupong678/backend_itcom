const express = require('express');
const router = express.Router();
const Footer = require('../models/footer');

// GET footer (รวมทุก section)
router.get('/', async (req, res) => {
  let doc = await Footer.findOne();
  if (!doc) {
    doc = await Footer.create({});
  }
  res.json(doc);
});

// PUT footer (update ทุก section)
router.put('/', async (req, res) => {
  let doc = await Footer.findOne();
  if (!doc) {
    doc = await Footer.create({});
  }
  Object.assign(doc, req.body);
  await doc.save();
  res.json({ success: true });
});

// POST /api/footer/sample - generate sample data
router.post('/sample', async (req, res) => {
  const sample = Footer.generateSampleData();
  let doc = await Footer.findOne();
  if (!doc) {
    doc = await Footer.create(sample);
  } else {
    Object.assign(doc, sample);
    await doc.save();
  }
  res.json({ success: true, sample });
});

module.exports = router; 