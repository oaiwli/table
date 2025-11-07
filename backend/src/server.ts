import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database";
import { Scan, Product, PaginatedResponse } from "./types";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const createTables = async (): Promise<void> => {
  try {
    // создаем таблицу продуктов, если она не существует
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // создаем таблицу сканирований, если она не существует
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(15) NOT NULL,
        status VARCHAR(10) CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL
      )
    `);

    console.log("Таблицы успешно созданы или уже существуют");

    // очищаем старые данные и вставляем новые
    await clearExistingData();
    await insertSampleData();
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
  }
};

// функция для очистки существующих данных
const clearExistingData = async (): Promise<void> => {
  try {
    await pool.query("DELETE FROM scans");
    await pool.query("DELETE FROM products");
    // сбрасываем последовательности ID
    await pool.query("ALTER SEQUENCE products_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE scans_id_seq RESTART WITH 1");
    console.log("Старые данные очищены");
  } catch (err) {
    console.error("Ошибка при очистке данных:", err);
  }
};

const insertSampleData = async (): Promise<void> => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM scans");
    if (parseInt(result.rows[0].count) === 0) {
      // вставляем тестовые продукты (всего 16)
      const productsResult = await pool.query(`
        INSERT INTO products (name) VALUES 
        ('хачапури с сыром'),
        ('хлеб'),
        ('батон'),
        ('123123'),
        ('палпи'),
        ('кокакола'),
        ('пепси'),
        ('23456'),
        ('сок вкусный'),
        ('сок невкусный'),
        ('вода'),
        ('сникерс'),
        ('марс'),
        ('чипсы'),
        ('орешки'),
        ('молоко')
        RETURNING id
      `);

      const productIds = productsResult.rows.map((row) => row.id);

      // вставляем тестовые сканирования (16 строк)
      await pool.query(
        `
        INSERT INTO scans (ip, status, product_id) VALUES 
  ('192.167.1.1', 'active', $1),
  ('192.167.1.2', 'inactive', $1),
  ('192.167.1.3', 'active', $2),
  ('192.168.1.1', 'active', $3),
  ('192.168.1.2', 'active', $4),
  ('192.168.1.3', 'inactive', $5),
  ('192.168.1.4', 'inactive', $6),
  ('192.168.1.5', 'inactive', $7),
  ('192.168.1.6', 'inactive', $8),
  ('192.168.2.1', 'active', $9),
  ('192.168.2.2', 'inactive', $10),
  ('192.168.2.3', 'active', $11),
  ('192.168.2.4', 'inactive', $12),
  ('192.168.2.5', 'active', $13),
  ('192.168.3.1', 'inactive', $14),
  ('192.168.3.2', 'active', $15),
  ('192.168.3.3', 'inactive', $16)
      `,
        productIds
      );

      console.log("Тестовые данные успешно добавлены");
    }
  } catch (err) {
    console.error("Ошибка при вставке тестовых данных:", err);
  }
};

// получить список сканирований с пагинацией и фильтрацией
app.get("/api/scans", async (req, res) => {
  const { page = "1", pageSize = "10", ip, status } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);

  let query = `
    SELECT s.*, p.name as product_name 
    FROM scans s 
    LEFT JOIN products p ON s.product_id = p.id 
    WHERE 1=1
  `;
  let countQuery = `
    SELECT COUNT(*) 
    FROM scans s 
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 0;

  // фильтрация по IP
  if (ip) {
    paramCount++;
    query += ` AND s.ip ILIKE $${paramCount}`;
    countQuery += ` AND ip ILIKE $${paramCount}`;
    params.push(`%${ip}%`);
  }

  // фильтрация по статусу
  if (status) {
    paramCount++;
    query += ` AND s.status = $${paramCount}`;
    countQuery += ` AND status = $${paramCount}`;
    params.push(status);
  }

  // плюс пагинация
  query += ` ORDER BY s.created_at DESC LIMIT $${paramCount + 1} OFFSET $${
    paramCount + 2
  }`;
  params.push(parseInt(pageSize as string), offset);

  try {
    // выполняем оба запроса параллельно
    const [result, countResult] = await Promise.all([
      pool.query<Scan>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, paramCount)),
    ]);

    const response: PaginatedResponse<Scan> = {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    };

    res.json(response);
  } catch (err) {
    console.error("Ошибка при получении сканирований:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// получить одно сканирование по ID
app.get("/api/scans/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Scan>(
      `
      SELECT s.*, p.name as product_name 
      FROM scans s 
      LEFT JOIN products p ON s.product_id = p.id 
      WHERE s.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Сканирование не найдено" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при получении сканирования:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// удалить 1 сканирование + связанный продукт
app.delete("/api/scans/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const scanResult = await pool.query(
      "SELECT product_id FROM scans WHERE id = $1",
      [id]
    );

    if (scanResult.rows.length === 0) {
      return res.status(404).json({ error: "Сканирование не найдено" });
    }

    const productId = scanResult.rows[0].product_id;

    await pool.query("DELETE FROM scans WHERE id = $1", [id]);

    if (productId) {
      await pool.query("DELETE FROM products WHERE id = $1", [productId]);
    }

    res.json({
      success: true,
      message: "Сканирование и связанный продукт удалены",
    });
  } catch (err) {
    console.error("Ошибка при удалении сканирования:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// удалить несколько сканирований + их продукты
app.delete("/api/scans", async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Массив IDs обязателен" });
  }

  try {
    const scansResult = await pool.query(
      "SELECT DISTINCT product_id FROM scans WHERE id = ANY($1)",
      [ids]
    );

    const productIds = scansResult.rows
      .map((r) => r.product_id)
      .filter(Boolean);

    const deleteScans = await pool.query(
      "DELETE FROM scans WHERE id = ANY($1) RETURNING *",
      [ids]
    );

    if (productIds.length > 0) {
      await pool.query("DELETE FROM products WHERE id = ANY($1)", [productIds]);
    }

    res.json({
      success: true,
      message: "Сканирования и связанные продукты удалены",
      deletedScans: deleteScans.rows.length,
      deletedProducts: productIds.length,
    });
  } catch (err) {
    console.error("Ошибка при массовом удалении сканирований:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// получить все продукты
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query<Product>(
      "SELECT * FROM products ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении продуктов:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

const startServer = async (): Promise<void> => {
  await createTables();

  app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });
};

startServer();
