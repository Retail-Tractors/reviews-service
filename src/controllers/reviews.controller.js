const { request } = require("express");
const { publishEmailEvent } = require("../rabbitmq/publisher");
const prisma = require("../config/db"); // Import prisma instance
const logger = require("../utils/logger");
const axios = require("axios");

// Controller to handle review creation
async function createReview(req, res) {
    try {
        const { bookingId, equipmentId, rating, comment } = req.body;
        // Validate input
        if ( !bookingId || !rating) {
            return res.status(400).json({ error: "bookingId, and rating are required." });
        }
        // Check if booking exists and belongs to the user
        const bookingResponse = await axios.get(`http://booking-service:3002/bookings/${bookingId}`, {
            headers: {
                Authorization: req.headers["authorization"]
            }
        });
        const booking = bookingResponse.data;       
        if (booking.userId !== userId) {
            return res.status(403).json({ error: "Booking does not belong to the user." });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ error: "Cannot review a booking that is not completed." });
        }
        // Create review
        const newReview = await prisma.review.create({
            data: {
                userId,
                bookingId,
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

module.exports = {
    createReview
};