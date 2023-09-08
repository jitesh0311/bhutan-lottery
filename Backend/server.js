const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const winston = require("winston");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(morgan("combined"));
winston.add(new winston.transports.File({ filename: "error.log" }));



const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/", (_req, res) => {
  return res.json("From Backend");
});

app.get("/futuredata", async (req, res) => {
  const limitValues = Array.from({ length: 49 }, (_, index) => index + 1);

  try {
    const results = await Promise.all(
      limitValues.map(async (limit) => {
        const sql = `SELECT * FROM futuredata WHERE Date = '${formattedDate}' LIMIT ${limit}`;
        const data = await executeQuery(sql);
        return data;
      })
    );

    return res.json(results);
  } catch (error) {
   console.error("Error updating data:", error);
   winston.error("Error updating data:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching data" });
  }
});

app.post("/update", async (req, res) => {
  const formData = req.body;

  const updateQuery =
    "UPDATE futuredata SET BhutanGold=?, BhutanDeluxe=? WHERE Date=? AND Time=?";

  const { Date, Time, BhutanGold, BhutanDeluxe } = formData;

  try {
    await executeQuery(updateQuery, [BhutanGold, BhutanDeluxe, Date, Time]);
    return res.json({ message: "Form data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating data" });
  }
});

app.get("/showAdmin", async (_req, res) => {
  const sql = `SELECT * FROM futuredata WHERE Date = '${formattedDate}'`;

  try {
    const data = await executeQuery(sql);
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching admin data" });
  }
});

const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;
const day = currentDate.getDate();
const formatemonth = month < 10 ? "0" + month : month;
const formateday = day < 10 ? "0" + day : day;
const formattedDate = `${formateday}/${formatemonth}/${year}`;

app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
