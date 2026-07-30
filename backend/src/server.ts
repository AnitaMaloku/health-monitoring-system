import express, { NextFunction, Request, Response } from "express";



const app = express();

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Health Monitoring API running"
    });
});



const PORT = Number(process.env.PORT || 3000);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
