const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller.js');
const { authenticateUserToken } = require("../middlewares/auth");
const { ensureSameUser, requestRole } = require("../middlewares/ensureSameUser");
const { paginationMiddleware } = require("../middlewares/pagination");


router.post('/', authenticateUserToken, reviewController.createReview);

router.get('/', authenticateUserToken, paginationMiddleware, reviewController.getAllReviews);

router.put('/:id', authenticateUserToken, reviewController.updateReview);

router.delete('/:id', authenticateUserToken, requestRole, reviewController.deleteReview);

router.get('/equipment/:equipmentId', paginationMiddleware, reviewController.getReviewsByEquipmentId);

router.get('/equipment/:equipmentId/average', reviewController.getAverageRatingForEquipment);


module.exports = router;