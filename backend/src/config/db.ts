import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/solana-dex"
        );
        console.log(`MongoDB подключена: ${conn.connection.host}`);
    } catch (error) {
        // Вариант 1: Проверка, является ли error объектом Error
        if (error instanceof Error) {
            console.error(`Ошибка: ${error.message}`);
        } else {
            console.error("Произошла неизвестная ошибка:", error);
        }
        process.exit(1);
    }
};

export default connectDB;
