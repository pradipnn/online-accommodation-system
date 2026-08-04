const express = require("express");
const { springProxy, aiProxy, aiSearchProxy, paymentProxy } = require("../config/proxyConfig");

const router = express.Router();

// Forward AI description requests directly to Python GenAI service
router.post("/api/ai/property-description", aiProxy);
router.options("/api/ai/property-description", aiProxy);

// Forward AI natural language property search requests directly to Python GenAI service
router.post("/api/ai/property-search", aiSearchProxy);
router.options("/api/ai/property-search", aiSearchProxy);

// Forward payment requests to ASP.NET Core PaymentService
router.use("/api/payment", paymentProxy);

// Forward backend REST APIs to Spring Boot service
router.use("/api/auth", springProxy);
router.use("/api/users", springProxy);
router.use("/api/properties", springProxy);
router.use("/api/admin", springProxy);
router.use("/api/rooms", springProxy);
router.use("/api/bookings", springProxy);
router.use("/api/reviews", springProxy);
router.use("/api/wishlist", springProxy);

module.exports = router;