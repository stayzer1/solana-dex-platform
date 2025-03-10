import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db";
import routes from "./routes";

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", routes);

// Определим порт
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
