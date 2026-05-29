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
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, "../../sql/schema.sql");
    const seedPath = path.join(__dirname, "../../sql/seed.sql");

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const seedSql = fs.readFileSync(seedPath, "utf8");

    await connection.query(schemaSql);
    await connection.changeUser({ database });
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
