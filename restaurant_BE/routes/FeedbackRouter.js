
const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbackByDishId, updateFeedback, deleteFeedback, hideFeedback, getAllDishes } = require('../controllers/FeedbackController');
const { authenticate, isAdmin} = require('../middlewares/isAuthenticate');

router.post('/add', authenticate, createFeedback);
router.get('/dish/:dish_id', getFeedbackByDishId);
router.put('/update/:id',authenticate, updateFeedback);
router.delete('/delete/:id',authenticate, deleteFeedback);
router.patch("/hide/:id", hideFeedback);
router.get("/allDishes", getAllDishes);

module.exports = router;

