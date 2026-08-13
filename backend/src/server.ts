import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { createServer } from "http";
import { startMqttHealthIngest } from "./infra/mqtt/mqtt.handler";
import { initializeSocket } from "./infra/websocket/socket.server";
import deviceRoutes from "./modules/devices/route";
import patientRoutes from "./modules/patients/routes";
import { ApiError } from "./utils/api-error";


const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(express.json());

app.use("/patients", patientRoutes);
app.use("/devices", deviceRoutes);

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Health Monitoring API running"
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

startMqttHealthIngest();


const PORT = Number(process.env.PORT || 3002);
const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

