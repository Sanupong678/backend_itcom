const express = require('express');
const router = express.Router();
const whyContentController = require('../controllers/whyContentController');

router.get('/', whyContentController.getWhyContent);
router.put('/', whyContentController.updateWhyContent);
router.post('/feature', whyContentController.addFeature);
router.delete('/feature/:index', whyContentController.deleteFeature);

module.exports = router; 