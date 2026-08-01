import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { startMqttHealthIngest } from "./infra/mqtt/mqtt.handler";
import deviceRoutes from "./modules/devices/route";
import patientRoutes from "./modules/patients/routes";
import { ApiError } from "./utils/api-error";


const app = express();

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


const PORT = Number(process.env.PORT || 3000);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

