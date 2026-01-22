const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller.js');
const { authenticateUserToken, authenticateBookingToken } = require("../middlewares/auth");
const { ensureSameUser, ensureUserIsAdmin } = require("../middlewares/ensureSameUser");
const { paginationMiddleware } = require("../middlewares/pagination");
const { route } = require('../app.js');


router.post('/', authenticateUserToken, reviewController.createReview);

router.get('/', authenticateUserToken, paginationMiddleware, reviewController.getAllReviews);

router.put('/:id', authenticateUserToken, ensureSameUser, reviewController.updateReview);

router.delete('/:id', authenticateUserToken, ensureSameUser, reviewController.deleteReview);

router.get('/equipment/:equipmentId', authenticateUserToken, paginationMiddleware, reviewController.getReviewsByEquipmentId);

router.get('/equipment/:equipmentId/average', authenticateUserToken, reviewController.getAverageRatingForEquipment);


module.exports = router;