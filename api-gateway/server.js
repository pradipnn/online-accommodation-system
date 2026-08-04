require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    console.log("==================================");
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log("==================================");
});

server.on("error", (error) => {
    console.error("Server startup error:", error.message);
});