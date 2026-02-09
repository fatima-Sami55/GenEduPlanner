const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

const routeGuards = require('../middleware/routeGuards');

router.post('/next-question', aiController.getNextQuestion);
router.post('/recommend', routeGuards.checkQuestionsCompleted, aiController.getRecommendations);
router.post('/roadmap', aiController.getRoadmap);

module.exports = router;
