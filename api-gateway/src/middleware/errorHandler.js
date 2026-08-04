const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 404,
        error: "Not Found",
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

const globalErrorHandler = (error, req, res, next) => {
    console.error("Gateway Error:", error.message);

    res.status(error.status || 500).json({
        status: error.status || 500,
        error: "Internal Server Error",
        message: error.message || "Something went wrong",
        path: req.originalUrl
    });
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};