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
router.get("/totalShare", (req, res) => {
  try {
    const mysql = "SELECT SUM(totalShare) AS totalShare FROM tbl_investment";
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

router.get("/totalLoan", (req, res) => {
  try {
    const mysql =
      "SELECT SUM(loanAmount) AS totalLoan " +
      "FROM tbl_loan l " +
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId " +
      "WHERE l.loanStatusId = 1 ";
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

router.get("/totalActiveLoan", (req, res) => {
  try {
    const mysql =
      "SELECT COUNT(*) AS totalActiveLoan " +
      "FROM tbl_loan l " +
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId " +
      "WHERE l.loanStatusId = 1  ";
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

router.get("/totalQueueLoan", (req, res) => {
  try {
    const mysql =
      "SELECT COUNT(*) AS totalQueueLoan " +
      "FROM tbl_loan l " +
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId " +
      "WHERE l.loanRequestStatusId = 0";
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

router.get("/totalFollowUpLoan", (req, res) => {
  try {
    const mysql =
      "SELECT COUNT(*) AS totalFollowUpLoan " +
      "FROM tbl_loan l " +
      "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId"
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId " +
      "WHERE l.loanStatusId = 1 "+
      "AND memberStatusId = 0";
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

router.get("/totalMember", (req, res) => {
  try {
    const mysql =
      "SELECT COUNT(*) AS totalMember FROM tbl_member WHERE memberStatusId = 1";
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

module.exports = router;
