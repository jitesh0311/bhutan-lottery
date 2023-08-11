const express = require("express");
const mysql = require("mysql");
const cors = require("cors");



const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
  })
);

app.use(express.json());


var currentDate = new Date();

var year = currentDate.getFullYear();
var month = currentDate.getMonth() + 1; // Months are zero-based, so we add 1
var day = currentDate.getDate() ; // Remove this after testing

var formatemonth = month < 10 ? "0" + month : month;
var formateday = day < 10 ? "0" + day : day;

var formattedDate = `${formateday}/${formatemonth}/${year}`;

function getCurrentTime() {
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();

  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  var formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  var currentTime = `${formattedHours}-${formattedMinutes}-${ampm}`;

  return currentTime;
}

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "csv_db 6",
});

app.get("/", (_req, res) => {
  return res.json("From Backend");
});

app.get("/futuredata", async (req, res) => {
  const limitValues = Array.from({ length: 49 }, (_, index) => index + 1); // Add more limit values as needed

  const results = [];

  // Use async/await to ensure sequential execution of queries
  for (const limit of limitValues) {
    const sql = `SELECT * FROM futuredata WHERE Date = '${formattedDate}' LIMIT ${limit}`;

    try {
      const data = await new Promise((resolve, reject) => {
        db.query(sql, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      results.push(data);
    } catch (error) {
      console.error(error);
    }
  }

  return res.json(results);
});

app.post("/update", (req, res) => {
  const formData = req.body;
  

  const updateQuery =
    "UPDATE futuredata SET BhutanGold=?, BhutanDeluxe=? WHERE Date=? AND Time=?";

  const { Date, Time, BhutanGold, BhutanDeluxe } = formData;

  db.query(
    updateQuery,
    [BhutanGold, BhutanDeluxe, Date, Time],
    (error, results) => {
      if (error) {
        console.error("Error updating data:", error);
        res
          .status(500)
          .json({ error: "An error occurred while updating data" });
      } else {
        res.json({ message: "Form data updated successfully" });
      }
    }
  );
});

app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});

app.get("/showAdmin", async (req, res) => {


  const results = [];

  // Use async/await to ensure sequential execution of queries
   {
    const sql = `SELECT * FROM futuredata WHERE Date = '${formattedDate}'`;

    try {
      const data = await new Promise((resolve, reject) => {
        db.query(sql, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      results.push(data);
    } catch (error) {
      console.error(error);
    }
  }

  return res.json(results);
});
