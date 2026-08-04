const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const gatewayRoutes = require("./routes/gatewayRoutes");

const {
    notFoundHandler,
    globalErrorHandler
} = require("./middleware/errorHandler");

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

app.use(morgan("dev"));

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "Node API Gateway"
    });
});

app.use(gatewayRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;