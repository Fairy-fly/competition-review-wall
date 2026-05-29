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

    await connection.query(schemaSql);
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
