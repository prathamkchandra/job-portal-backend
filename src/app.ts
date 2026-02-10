import express from "express";
import authRouter from "./routes/auth.routes";
import healthRouter from "./routes/health.routes";
import jobsRouter from "./routes/jobs.routes";
const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);

export default app;
