import { Pool } from "pg";
import dotenv from "dotenv";

//дефолт, загружаем переменные окружения
dotenv.config();

// создаем пул соединений с базой данных
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// обработка событий подключения
pool.on("connect", () => {
  console.log("Подключение к базе данных PostgreSQL установлено");
});

pool.on("error", (err) => {
  console.error("Ошибка подключения к базе данных:", err);
});

export default pool;
