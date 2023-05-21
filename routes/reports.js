const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Bangkok");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => {
  try {
    const mysql =
      "SELECT * "+
      "FROM tbl_allowance a "+
      "LEFT JOIN tbl_allowance_type at ON at.allowanceTypeId = a.allowanceTypeId "+
      "ORDER BY allowanceDateTime DESC";
    connection.query(mysql, (err, results, fields) => {
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

router.get("/monthly/welfare/paid/:date", (req, res) => {
  const date = req.params.date + '%'
  console.log(date)
  try {
    const mysql =
      "SELECT * "+
      "FROM tbl_loan_payment lp "+
      "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = lp.paymentTypeId "+
      "LEFT JOIN tbl_loan l ON l.loanId = lp.loanId "+
      "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
      "WHERE createdAt LIKE ?";
    connection.query(mysql, [date], (err, results, fields) => {
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

router.get("/monthly/welfare/pending-payment/:date", (req, res) => {
    const date = req.params.date + '%'
    console.log(date)
    try {
      const mysql =
        "SELECT * "+
        "FROM tbl_loan_payment lp "+
        "WHERE createdAt LIKE ?";
      connection.query(mysql, [date], (err, results, fields) => {
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

router.get("/monthly/welfare/followup-payment/:date", (req, res) => {
    const date = req.params.date + '%'
    console.log(date)
    try {
      const mysql =
        "SELECT * "+
        "FROM tbl_loan_payment lp "+
        "WHERE createdAt LIKE ?";
      connection.query(mysql, [date], (err, results, fields) => {
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

router.get("/monthly/welfare/sum-payment/:date", (req, res) => {
    const date = req.params.date + '%'
    console.log(date)
    try {
      const mysql =
        "SELECT SUM(paymentAmount) AS TOTAL_PAID, 0 AS TOTAL_PENDING_PAYMENT, 0 AS TOTAL_FOLLOWUP_PAYMENT, 0 AS TOTAL_PROFIT "+
        "FROM tbl_loan_payment lp "+
        "WHERE lp.loanPaymentMonth LIKE ?";
      connection.query(mysql, [date, date, date], (err, results, fields) => {
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

router.get("/yearly/welfare/summary/:year", (req, res) => {
    const year = req.params.year + '%'
    console.log('year = '+year)
    try {
      const mysql =
        "SELECT SUM(paymentAmount) AS TOTAL_PAYMENT, SUBSTR(loanPaymentMonth, 1, 7) AS loanPaymentMonth "+
        "FROM tbl_loan_payment "+
        "WHERE loanPaymentMonth LIKE ? "+
        "GROUP BY loanPaymentMonth";
      connection.query(mysql, [year], (err, results, fields) => {
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
module.exports = router;
