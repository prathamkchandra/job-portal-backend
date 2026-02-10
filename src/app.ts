import express from "express";
import authRouter from "./routes/auth.routes";
import healthRouter from "./routes/health.routes";
import jobsRouter from "./routes/jobs.routes";
import applicationRouter from "./routes/applications.routes"
const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/applications", applicationRouter);


export default app;
