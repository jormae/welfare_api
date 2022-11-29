const express = require("express");
const moment = require("moment-timezone");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
moment.tz.setDefault("Asia/Bangkok");

router.get("/", (req, res) => {
  console.log("stat route");
});

router.get("/new-chart", (req, res) => {
  const today = moment().format("YYYY-MM-DD") + "%";
  try {
    const mysql =
      "SELECT DATE_FORMAT(insertedAt,'%Y-%m-%d') AS date, " +
      "SUM(IF(wardCode = '04',1,0)) AS 'lr', " +
      "SUM(IF(wardCode = '14',1,0)) AS 'prelr', " +
      "SUM(IF(wardCode = '16',1,0)) AS 'ipd1', " +
      "SUM(IF(wardCode = '17',1,0)) AS 'ipd2' " +
      "FROM tbl_chart  " +
      "WHERE insertedAt LIKE ? ";
    connection.query(mysql, [today], (err, result, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/return-chart", (req, res) => {
  const today = moment().format("YYYY-MM-DD") + "%";
  try {
    const mysql =
      "SELECT DATE_FORMAT(insertedAt,'%Y-%m-%d') AS date, " +
      "SUM(IF(wardCode = '04',1,0)) AS 'lr', " +
      "SUM(IF(wardCode = '14',1,0)) AS 'prelr', " +
      "SUM(IF(wardCode = '16',1,0)) AS 'ipd1', " +
      "SUM(IF(wardCode = '17',1,0)) AS 'ipd2' " +
      "FROM tbl_chart  " +
      "WHERE returnSummaryDate LIKE ? ";
    connection.query(mysql, [today], (err, result, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      console.log(result);
      res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
