import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MARABU BOOK STUDIO running on port ${PORT}`);
});
