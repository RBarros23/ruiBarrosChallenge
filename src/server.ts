import express from "express";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "POI API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
