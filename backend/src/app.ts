import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.route";
import { issueRouter } from "./routes/issue.route";
import { authorityRouter } from "./routes/authority.route";
import { dataRouter } from "./routes/data.route";
import { imagekitRouter } from "./routes/imagekit.route";
import { ApiError } from "./utils/ApiError";

const app = express();


// Add these middleware before your routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                "https://mkqzgr6r-3000.inc1.devtunnels.ms",
                "http://localhost:5173",
                "http://localhost:5174", // In case you change ports
                "http://127.0.0.1:3000", // Alternative localhost
                // "https://jan-seva-nine.vercel.app",
                process.env.CLIENT_URL,
                process.env.CORS_ORIGIN,
            ].filter(Boolean);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"), false);
        },
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        preflightContinue: false,
        optionsSuccessStatus: 200,
    })
);

// API health check route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Jan Seva API" });
});

app.use("/auth", authRouter);
app.use("/issues", issueRouter);
app.use("/authority", authorityRouter);
app.use("/data", dataRouter);
app.use("/imagekit", imagekitRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null,
            errors: err.errors,
        });
    }

    return res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : "Internal Server Error",
        data: null,
    });
});

export { app };

