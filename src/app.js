import express from "express";
import Healthcheck from "./routes/healthCheck.routes.js";
const app = express()

app.use('/api/v1/health',Healthcheck)

export default app