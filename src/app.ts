import express from "express";
import authRouter from "./routes/auth.routes";
import healthRouter from "./routes/health.routes";
const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

export default app;
