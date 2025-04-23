import express from "express";
import { config } from "dotenv";
import { PoiService } from "./services/poi.service";
import { PoiController } from "./controllers/poi.controller";
import { createPoiRouter } from "./routes/poi.routes";
import { prisma } from "./utils/prisma/prisma";
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const poiService = new PoiService(prisma);
const poiController = new PoiController(poiService);
const poiRouter = createPoiRouter(poiController);

app.get("/", (req, res) => {
  res.json({ message: "POI API is running" });
});

app.use("/api/poi", poiRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
