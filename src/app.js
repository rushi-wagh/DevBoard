import express from "express";
import Healthcheck from "./routes/healthCheck.routes.js";
import Auth from "./routes/auth.routes.js"

const app = express()

app.use('/api/v1/health',Healthcheck)
app.use('/api/v1/auth',Auth)
export default app