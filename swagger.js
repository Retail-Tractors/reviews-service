const swaggerAutoGen = require("swagger-autogen")();

const doc = {
  info: {
    version: "1.0.0",
    title: "Retail Tractors reviews-service API",
    description: "API documentation for the Retail Tractors reviews-service.",
  },
    host: "localhost:3001",
    basePath: "/",
  schemes: ["http"],
  consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
    {
      name: "Reviews",
      description: "Endpoints related to reviews management",
    },
  ],
  definitions: {
    review: {
      id: 1,
      equipmentId: 10,
      userId: 5,
      rating: 4,
      comment: "Great equipment, very satisfied with the performance.",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    newReview: {
      equipmentId: 10,
      rating: 5,
      comment: "Excellent condition and worked perfectly for my project.",
    },  
  },
};  

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/routes/reviews.routes.js"];
swaggerAutoGen(outputFile, endpointsFiles, doc);