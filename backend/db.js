// db.js — MySQL database module using mysql2/promise
'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'ivolunteer_db';

let pool = null;

/* ─── Initialize MySQL Database and Tables ─── */
async function initDb() {
  // 1. Connect without selecting database to ensure database exists
  const initialConnection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await initialConnection.end();

  // 2. Create connection pool with the database selected
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  // 3. Create tables if they do not exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone         VARCHAR(50)  DEFAULT '',
      city          VARCHAR(100) DEFAULT '',
      bio           TEXT,
      is_volunteer  TINYINT(1)   DEFAULT 0,
      joined_date   VARCHAR(50)  NOT NULL,
      created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteer_profiles (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL UNIQUE,
      volunteer_id    VARCHAR(50) NOT NULL,
      status          VARCHAR(50) DEFAULT 'Active Volunteer',
      hours           DOUBLE      DEFAULT 0,
      drives          INT         DEFAULT 0,
      availability    VARCHAR(50) DEFAULT 'weekends',
      interests       JSON,
      skills          JSON,
      badges          JSON,
      upcoming_drives JSON,
      joined_date     VARCHAR(50) NOT NULL,
      CONSTRAINT fk_user_volunteer FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      user_id        INT NOT NULL,
      donation_ref   VARCHAR(100) NOT NULL UNIQUE,
      type           VARCHAR(50)  NOT NULL,
      description    TEXT         NOT NULL,
      quantity       VARCHAR(100) NOT NULL,
      pickup_address TEXT         NOT NULL,
      ngo_id         INT          NULL,
      ngo_name       VARCHAR(255) DEFAULT '',
      status         VARCHAR(50)  DEFAULT 'requested',
      date           VARCHAR(50)  NOT NULL,
      last_updated   VARCHAR(50)  NOT NULL,
      CONSTRAINT fk_user_donation FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  return pool;
}

/* ─── Query Helper: returns array of rows ─── */
async function query(sql, params = []) {
  if (!pool) throw new Error('Database pool not initialized. Call initDb() first.');
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/* ─── Get Helper: returns single row or null ─── */
async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/* ─── Run Helper: returns { lastInsertRowid, affectedRows } ─── */
async function run(sql, params = []) {
  if (!pool) throw new Error('Database pool not initialized. Call initDb() first.');
  const [result] = await pool.execute(sql, params);
  return {
    lastInsertRowid: result.insertId,
    affectedRows: result.affectedRows
  };
}

module.exports = { initDb, query, get, run };
