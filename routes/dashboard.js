const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => res.send("it's dashboard route"));
router.get("/chart-log/:date", (req, res) => {
    const date = req.params.date+'%';
    console.log(date)
    try {
    const mysql =
      "SELECT COUNT(*) AS totalRecord, action "+
      "FROM tbl_chart_log "+
      "WHERE datetime LIKE ?  "+
      "GROUP BY action "+
      "ORDER BY totalRecord DESC ";
    connection.query(mysql, date, (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/stat/:date", (req, res) => {
    const date = req.params.date+'%';
    const dischargeDate = '2022-04%';
    console.log(date)
    try {
    const mysql =
      "SELECT COUNT(*) AS totalChart, "+
      "SUM(IF(startSummaryDate LIKE ? ,1,0)) AS totalSummary, "+
      "SUM(IF(returnSummaryDate LIKE ? ,1,0)) AS totalReturn, "+
      "SUM(IF(reauditDate LIKE ? ,1,0)) AS totalReaudit "+
      "FROM tbl_chart c "+
      "WHERE dischargeDate LIKE ? ";
    connection.query(mysql, [date, date, date, dischargeDate], (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/doctor-summary/:date", (req, res) => {
    const endDate = req.params.date+'-31';
    const date = req.params.date+'%';
    try {
    const mysql =
      "SELECT COUNT(*) AS totalChart, d.doctorName, "+
      "SUM(IF(reauditDate IS NOT NULL ,1,0)) AS totalReaudit, "+
      "AVG(DATEDIFF(returnSummaryDate, startSummaryDate)) avgSummaryDay, "+
      "SUM(IF(returnSummaryDate IS NOT NULL ,1,0)) AS totalSummary, "+
      "SUM(IF(returnSummaryDate IS NULL ,1,0)) AS totalPendingSummary, "+
      "SUM(IF(returnSummaryDate > ? ,1,0)) AS totalLateSummary "+
      "FROM tbl_chart c "+
      "LEFT JOIN tbl_doctor d ON d.doctorCode = c.doctorCode "+
      "WHERE dischargeDate LIKE ? "+
      "GROUP BY c.doctorCode "+
      "ORDER BY totalChart DESC";
    connection.query(mysql, [endDate,date], (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
    //   console.log(results)
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
