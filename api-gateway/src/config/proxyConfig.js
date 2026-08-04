const { createProxyMiddleware } = require("http-proxy-middleware");

const springBackendUrl =
    process.env.SPRING_BACKEND_URL || "http://localhost:9090";

const genAiServiceUrl =
    process.env.GEN_AI_SERVICE_URL || "http://localhost:8000";

const paymentServiceUrl =
    process.env.PAYMENT_SERVICE_URL || "http://localhost:5050";

const springProxy = createProxyMiddleware({
    target: springBackendUrl,
    changeOrigin: true,

    pathRewrite: (path, req) => {
        return req.originalUrl;
    },

    on: {
        proxyReq: (proxyReq, req) => {
            console.log(
                `${req.method} ${req.originalUrl} -> ${springBackendUrl}${req.originalUrl}`
            );
        },

        error: (error, req, res) => {
            console.error("Proxy Error:", error.message);

            if (!res.headersSent) {
                res.status(502).json({
                    status: 502,
                    error: "Bad Gateway",
                    message: "Spring Boot backend is not available",
                    path: req.originalUrl
                });
            }
        }
    }
});

const aiProxy = createProxyMiddleware({
    target: genAiServiceUrl,
    changeOrigin: true,

    pathRewrite: (path, req) => {
        return "/generate-description";
    },

    on: {
        proxyReq: (proxyReq, req) => {
            console.log(
                `AI Proxy: ${req.method} ${req.originalUrl} -> ${genAiServiceUrl}/generate-description`
            );
        },

        error: (error, req, res) => {
            console.error("AI Proxy Error:", error.message);

            if (!res.headersSent) {
                res.status(503).json({
                    status: 503,
                    error: "Service Unavailable",
                    message: "GenAI Python service is currently unavailable",
                    path: req.originalUrl
                });
            }
        }
    }
});

const aiSearchProxy = createProxyMiddleware({
    target: genAiServiceUrl,
    changeOrigin: true,

    pathRewrite: (path, req) => {
        return "/property-search";
    },

    on: {
        proxyReq: (proxyReq, req) => {
            console.log(
                `AI Search Proxy: ${req.method} ${req.originalUrl} -> ${genAiServiceUrl}/property-search`
            );
        },

        error: (error, req, res) => {
            console.error("AI Search Proxy Error:", error.message);

            if (!res.headersSent) {
                res.status(503).json({
                    status: 503,
                    error: "Service Unavailable",
                    message: "GenAI Python search service is currently unavailable",
                    path: req.originalUrl
                });
            }
        }
    }
});

const paymentProxy = createProxyMiddleware({
    target: paymentServiceUrl,
    changeOrigin: true,

    pathRewrite: (path, req) => {
        return req.originalUrl;
    },

    on: {
        proxyReq: (proxyReq, req) => {
            console.log(
                `Payment Proxy: ${req.method} ${req.originalUrl} -> ${paymentServiceUrl}${req.originalUrl}`
            );
        },

        error: (error, req, res) => {
            console.error("Payment Proxy Error:", error.message);

            if (!res.headersSent) {
                res.status(503).json({
                    status: 503,
                    error: "Service Unavailable",
                    message: "Payment service is currently unavailable",
                    path: req.originalUrl
                });
            }
        }
    }
});

module.exports = {
    springProxy,
    aiProxy,
    aiSearchProxy,
    paymentProxy
};