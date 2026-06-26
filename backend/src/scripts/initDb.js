require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function run() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQLUSER || process.env.DB_USER || "root";
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "";
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME || "competition_review_wall";

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, "../../sql/schema.sql");
    const seedPath = path.join(__dirname, "../../sql/seed.sql");

    let schemaSql = fs.readFileSync(schemaPath, "utf8");
    let seedSql = fs.readFileSync(seedPath, "utf8");

    // Remove CREATE DATABASE and USE statements for cloud MySQL (DB already exists)
    schemaSql = schemaSql
      .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+\S+[^;]*;\s*/gi, "")
      .replace(/USE\s+\S+;\s*/gi, "");
    seedSql = seedSql.replace(/USE\s+\S+;\s*/gi, "");

    schemaSql = schemaSql.replace(/ALTER\s+TABLE\s+reviews\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+hidden_reason[^;]*;\s*/gi, "");

    await connection.query(schemaSql);

    const [columns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'reviews'
         AND COLUMN_NAME = 'hidden_reason'`
    );

    if (!columns.length) {
      await connection.query("ALTER TABLE reviews ADD COLUMN hidden_reason VARCHAR(255) NULL AFTER status");
    }

    // Ensure appeals table exists for old databases
    const [appealsTable] = await connection.query(
      `SELECT TABLE_NAME
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'appeals'`
    );

    if (!appealsTable.length) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS appeals (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          review_id BIGINT NOT NULL,
          appellant_user_id BIGINT NOT NULL,
          reason TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          admin_reply TEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_appeal_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
          CONSTRAINT fk_appeal_user FOREIGN KEY (appellant_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    }

    await connection.query(seedSql);

    console.log("Database schema and seed data applied successfully.");
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error("Failed to initialize database.");
  console.error(error.message);
  process.exit(1);
});
