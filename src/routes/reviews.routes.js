const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller.js');
const { authenticateUserToken } = require("../middlewares/auth");
const { ensureSameUser, requestRole } = require("../middlewares/ensureSameUser");
const { paginationMiddleware } = require("../middlewares/pagination");


router.post('/',
    /*
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to create a new review for equipment.'
    #swagger.parameters['NewReview'] = {
        in: 'body',
        description: 'Review information.',
        required: true,
        schema: { $ref: '#/definitions/NewReview' }
    }
    #swagger.responses[201] = { 
        description: 'Review created successfully.',
        schema: { $ref: '#/definitions/Review' }
    }   
    #swagger.responses[400] = {
        description: 'Bad Request. Invalid input data.',
        schema: { error: "Error message detailing the issue." }
    }
    #swagger.responses[401] = {
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }
    }
    #swagger.responses[403] = {
        description: 'Forbidden. User not allowed to create review for this booking.',  
        schema: { error: "Booking does not belong to the user." }
    }
    #swagger.responses[500] = { 
        description: 'Internal Server Error.',
        schema: { error: "Internal Server Error" }
    }   
    */
    authenticateUserToken, reviewController.createReview);

router.get('/', 
    /*
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to retrieve all reviews with pagination.'
    #swagger.parameters['page'] = { 
        in: 'query',    
        description: 'Page number for pagination.',
        required: false,
        type: 'integer',
        default: 1
    }
    #swagger.parameters['limit'] = { 
        in: 'query',    
        description: 'Number of items per page.',
        required: false,
        type: 'integer',
        default: 10
    }
    #swagger.responses[200] = {
        description: 'A list of reviews.',
        schema: { 
            type: 'object', 
            properties: {
                reviews: {
                    type: 'array',
                    items: { $ref: '#/definitions/Review' }
                },
                total: {
                    type: 'integer'
                }
            }   
        }
    }
    #swagger.responses[401] = { 
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }    
    }
    #swagger.responses[500] = { 
        description: 'Internal Server Error.',  
        schema: { error: "Internal Server Error" }
    }
    */
    authenticateUserToken, paginationMiddleware, reviewController.getAllReviews);

router.put('/:id', 
    /*
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to update an existing review by its ID.'
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the review to update.',
        required: true,
        type: 'integer'
    }
    #swagger.parameters['UpdatedReview'] = {
        in: 'body',
        description: 'Updated review information.', 
        required: true,
        schema: { $ref: '#/definitions/UpdatedReview' }
    }
    #swagger.responses[200] = {
        description: 'Review updated successfully.',
        schema: { $ref: '#/definitions/Review' }
    }
    #swagger.responses[400] = {
        description: 'Bad Request. Invalid input data.',    
        schema: { error: "Error message detailing the issue." }
    }
    #swagger.responses[401] = {
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }
    }
    #swagger.responses[403] = {
        description: 'Forbidden. User not allowed to update this review.',
        schema: { error: "User not authorized to update this review." }
    }
    #swagger.responses[404] = {
        description: 'Not Found. Review with the specified ID does not exist.',
        schema: { error: "Review not found." }
    }
    #swagger.responses[500] = { 
        description: 'Internal Server Error.',
        schema: { error: "Internal Server Error" }
    }   
    */
    authenticateUserToken, reviewController.updateReview);

router.delete('/:id',
    /*
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to delete a review by its ID. Admin only.'
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the review to delete.',
        required: true,
        type: 'integer'
    }
    #swagger.responses[200] = { 
        description: 'Review deleted successfully.',
        schema: { message: "Review deleted successfully." }
    }
    #swagger.responses[401] = {
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }
    }
    #swagger.responses[403] = { 
        description: 'Forbidden. User is not an admin.',
        schema: { error: "Admin privileges required." }
    }
    #swagger.responses[404] = {
        description: 'Not Found. Review with the specified ID does not exist.', 
        schema: { error: "Review not found." }
    }
    #swagger.responses[500] = {
        description: 'Internal Server Error.',
        schema: { error: "Internal Server Error" }
    }   
    */
    authenticateUserToken, requestRole, reviewController.deleteReview);

router.get('/equipment/:equipmentId', 
    /*  
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to retrieve reviews for a specific equipment with pagination.'
    #swagger.parameters['equipmentId'] = {
        in: 'path', 
        description: 'ID of the equipment to retrieve reviews for.',
        required: true,
        type: 'integer'
    }
    #swagger.parameters['page'] = { 
        in: 'query',    
        description: 'Page number for pagination.', 
        required: false,
        type: 'integer',
        default: 1
    }
    #swagger.parameters['limit'] = { 
        in: 'query',    
        description: 'Number of items per page.',   
        required: false,
        type: 'integer',
        default: 5
    }
    #swagger.responses[200] = {
        description: 'A list of reviews for the specified equipment.',
        schema: { 
            type: 'object',
            properties: {
                reviews: {
                    type: 'array',
                    items: { $ref: '#/definitions/Review' }
                },
                total: {
                    type: 'integer'
                }
            }
        }
    }
    #swagger.responses[401] = { 
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }    
    }   
    #swagger.responses[500] = {
        description: 'Internal Server Error.',
        schema: { error: "Internal Server Error" }
    }
    */
    paginationMiddleware, reviewController.getReviewsByEquipmentId);

router.get('/equipment/:equipmentId/average', 
    /*
    #swagger.tags = ['Reviews']
    #swagger.description = 'Endpoint to retrieve the average rating for a specific equipment.'
    #swagger.parameters['equipmentId'] = {
        in: 'path',
        description: 'ID of the equipment to retrieve the average rating for.',
        required: true,
        type: 'integer'
    }
    #swagger.responses[200] = {
        description: 'Average rating for the specified equipment.',
        schema: { 
            type: 'object',
            properties: {
                averageRating: {
                    type: 'number'
                }
            }   
        }
    }
    #swagger.responses[401] = {
        description: 'Unauthorized. User token missing or invalid.',
        schema: { error: "User token missing." }    
    }   
    #swagger.responses[500] = {
        description: 'Internal Server Error.',
        schema: { error: "Internal Server Error" }
    }
    */
    reviewController.getAverageRatingForEquipment);


module.exports = router;