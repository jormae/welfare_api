const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
// const { body, validationResult } = require("express-validator");
const loanInfo = require("../middlewares/loan");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get("/", (req, res) => res.send("it's utils route"));
router.get("/positions", (req, res) => {
  try {
    const mysql =
      "SELECT * FROM tbl_position ORDER BY positionName ";
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

router.get("/member-types", (req, res) => {
  try {
    const mysql =
      "SELECT * FROM tbl_member_type  ORDER BY memberTypeName ";
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

router.get("/member-roles", (req, res) => {
  try {
    const mysql = "SELECT * FROM tbl_member_role ORDER BY memberRoleName ";
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

router.get("/payment-types", (req, res) => {
  try {
    const mysql = "SELECT * FROM tbl_payment_type  ORDER BY paymentTypeName ";
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

router.get("/member-status", (req, res) => {
  try {
    const mysql = "SELECT * FROM tbl_member_status ";
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

router.get("/loan-types", (req, res) => {
  try {
    const mysql =
      "SELECT * FROM tbl_loan_type  ORDER BY loanTypeName, loanAmount  ";
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

router.get("/loan-month-range/:loanId", loanInfo, (req, res, next) => {
  const loanId = req.params.loanId;
  // req.approvedAt
  // const approvedAt = "2023-02-01"
  try {
    const mysql =
      "select "+
      "DATE_FORMAT(m1, '%m/%Y') AS month "+
      
      "from "+
      "( "+
      "select  "+
      "(? - INTERVAL DAYOFMONTH(?)-1 DAY)  "+
      "+INTERVAL m MONTH as m1 "+
      "from "+ 
      "( "+
      "select @rownum:=@rownum+1 as m from "+
      "(select 1 union select 2 union select 3 union select 4) t1, "+
      "(select 1 union select 2 union select 3 union select 4) t2, "+
      "(select 1 union select 2 union select 3 union select 4) t3, "+
      "(select 1 union select 2 union select 3 union select 4) t4, "+
      "(select @rownum:=-1) t0 "+
      ") d1 "+
      ") d2  "+
      "where m1 BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH) "+
      "order by m1";
    connection.query(mysql, [req.approvedAt, req.approvedAt, req.approvedAt, req.approvedAt, req.loanDurationInMonth],(err, results, fields) => {
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
