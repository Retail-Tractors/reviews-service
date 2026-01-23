const { request } = require("express");
//const { publishEmailEvent } = require("../rabbitmq/publisher");
const prisma = require("../config/db"); // Import prisma instance
const logger = require("../utils/logger");
const axios = require("axios");
const e = require("express");

// Controller to handle review creation
async function createReview(req, res) {
    try {
        const { bookingId, equipmentId, rating, comment, name } = req.body;
        // Validate input        
        if ( !bookingId || !rating || !equipmentId ) {
            return res.status(400).json({ error: "bookingId, and rating are required." });
        }
        if (rating<1 || rating>5) {
            return res.status(400).json({error: "Rating must be between 1 and 5."});
        }

        logger.info(`Creating review for booking ID: ${bookingId} by user ID: ${req.user.sub}`);
        let reviewName = name ? name : req.user.name
        // Check if booking exists and belongs to the user
        logger.info(`Fetching booking details for booking ID: ${bookingId}`);
        const bookingResponse = await axios.get(`http://booking-service:3002/bookings/${bookingId}`, {
            headers: {
                Authorization: req.headers["authorization"]
            }
        });
        const booking = bookingResponse.data;       
        if (booking.userId !== req.user.sub) {
            logger.warn(`User ID: ${req.user.sub} attempted to review booking ID: ${bookingId} which does not belong to them.`);
            return res.status(403).json({ error: "Booking does not belong to the user." });
        }
        if (booking.status !== 'COMPLETED') {
            logger.warn(`Booking ID: ${bookingId} is not completed. Current status: ${booking.status}`);
            return res.status(400).json({ error: "Cannot review a booking that is not completed." });
        }
        // Create review
        logger.info(`Creating review record in the database for booking ID: ${bookingId}`);
        const newReview = await prisma.review.create({
            data: {
                reviewName,
                bookingId,
                equipmentId,
                rating,
                comment
            }
        });
        // Publish email event
        // await publishEmailEvent({
        //     to: booking.userEmail,
        //     subject: "Thank you for your review!",
        //     body: `Dear User,\n\nThank you for reviewing your booking with ID: ${bookingId}.\n\nBest regards,\nRetail Tractors Team`
        // });
        logger.info(`Review created with ID: ${newReview.id}`);
        return res.status(201).json(newReview);
    } catch (error) {
        logger.error("Error creating review:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function getAllReviews(req, res) {
    logger.info(`Query parameters received: ${JSON.stringify(req.query)}`);
    const { page, limit, offset } = req.pagination;
    const { equipmentId, rating } = req.query;
    const filters = {};

    if (equipmentId) {
        filters.equipmentId = equipmentId;
    }

    if (rating) {
        if (rating<1 || rating>5) {
            return res.status(400).json({error: "Rating must be between 1 and 5."});
        }
        filters.rating = Number(rating);
    }
    try {
        logger.info(`Fetching reviews with filters: ${JSON.stringify(filters)}, page: ${page}, limit: ${limit}, offset: ${offset}`);
        const reviews = await prisma.review.findMany({
            where: filters,
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const totalReviews = await prisma.review.count({ where: filters }); 

        const totalPages = Math.ceil(totalReviews / limit);

        if (page > totalPages && totalPages !== 0) {
        logger.warn("Page number exceeds total pages.");
        return res
            .status(400)
            .json({ error: "Page number exceeds total pages." });
        }
        logger.info(`Total reviews found: ${totalReviews}`);
        return res.status(200).json({
            page,
            limit,
            totalReviews,
            totalPages,
            reviews
        });
    } catch (error) {
        logger.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function updateReview(req, res) {
    try {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;
        logger.info(`Updating review ID: ${reviewId} by user ID: ${req.user.sub}`);

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });
        if (!existingReview) {
            logger.warn(`Review ID: ${reviewId} not found.`);
            return res.status(404).json({ error: "Review not found." });
        }
        const booking = await axios.get(`http://booking-service:3002/bookings/${existingReview.bookingId}`, {
            headers: {
                Authorization: req.headers["authorization"]
            }
        }).then(response => response.data);

        if (booking.userId !== req.user.sub) {
            logger.warn(`User ID: ${req.user.sub} attempted to update review ID: ${reviewId} which does not belong to them.`);
            return res.status(403).json({ error: "Cannot update a review that does not belong to you." });
        }
        
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: rating !== undefined ? rating : existingReview.rating,
                comment: comment !== undefined ? comment : existingReview.comment
            }
        });
        logger.info(`Review ID: ${reviewId} updated successfully.`);
        return res.status(200).json(updatedReview);
    } catch (error) {
        logger.error("Error updating review:", error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function deleteReview(req, res) {
    try {
        const reviewId = req.params.id;
        logger.info(`Deleting review ID: ${reviewId} by user ID: ${req.user.sub}`);
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        }); 
        if (!existingReview) {
            logger.warn(`Review ID: ${reviewId} not found.`);
            return res.status(404).json({ error: "Review not found." });
        }
        const booking = await axios.get(`http://booking-service:3002/bookings/${existingReview.bookingId}`, {
            headers: {
                Authorization: req.headers["authorization"]
            }
        }).then(response => response.data);

        if (booking.userId !== req.user.sub && req.user.role !== "ADMIN") {
            logger.warn(`User ID: ${req.user.sub} attempted to delete review ID: ${reviewId} which does not belong to them.`);
            return res.status(403).json({ error: "Cannot delete a review that does not belong to you." });
        }
        await prisma.review.delete({
            where: { id: reviewId }
        });
        logger.info(`Review ID: ${reviewId} deleted successfully.`);
        return res.status(200).json({ message: "Review deleted successfully." });
    } catch (error) {
        logger.error("Error deleting review:", error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function getReviewsByEquipmentId(req, res) {
    try {
        const equipmentId = parseInt(req.params.equipmentId);
        
        if (isNaN(equipmentId)) {
             return res.status(400).json({ error: "Invalid equipment ID." });
        }

        const { page, limit, offset } = req.pagination;
        
        logger.info(`Fetching reviews for equipment ID: ${equipmentId}, page: ${page}, limit: ${limit}, offset: ${offset}`);
        
        const reviews = await prisma.review.findMany({
            where: { equipmentId: equipmentId },
            skip: offset,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        
        const totalReviews = await prisma.review.count({ where: { equipmentId: equipmentId } });
        const totalPages = Math.ceil(totalReviews / limit);

        if (page > totalPages && totalPages !== 0) {
            logger.warn("Page number exceeds total pages.");
            return res.status(400).json({ error: "Page number exceeds total pages." });
        }   

        logger.info(`Total reviews found for equipment ID ${equipmentId}: ${totalReviews}`);
        
        return res.status(200).json({
            page,
            limit,
            totalReviews,
            totalPages,
            reviews
        });
    } catch (error) {
        logger.error("Error fetching reviews by equipment ID:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function getAverageRatingForEquipment(req, res) {
    try {
        const equipmentId = parseInt(req.params.equipmentId);

        if (isNaN(equipmentId)) {
             return res.status(400).json({ error: "Invalid equipment ID." });
        }

        logger.info(`Calculating average rating for equipment ID: ${equipmentId}`);
        
        const result = await prisma.review.aggregate({
            where: { equipmentId: equipmentId },
            _avg: { rating: true }
        });

        const rawRating = result._avg.rating;
        const averageRating = rawRating !== null ? rawRating : 0; 

        logger.info(`Average rating for equipment ID ${equipmentId} is ${averageRating}`);
        
        return res.status(200).json({ 
            equipmentId, 
            averageRating: averageRating 
        });

    } catch (error) {
        logger.error("Error calculating average rating:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    createReview,
    getAllReviews,
    updateReview,
    deleteReview,
    getReviewsByEquipmentId,
    getAverageRatingForEquipment
};