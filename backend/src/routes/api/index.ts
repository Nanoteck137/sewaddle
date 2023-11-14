import { Router } from "express";
import serieRouter from "./serie";

export default Router().use("/serie", serieRouter);
