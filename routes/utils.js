const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const loanInfo = require("../middlewares/loan-info");
const memberInfo = require("../middlewares/member-info");

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

router.get("/loan-types/:nationalId", memberInfo, async (req, res, next) => {
  const nationalId = req.params.nationalId;
  console.log(req.memberTypeId)
  try {
    const mysql =
      "SELECT * FROM tbl_loan_type WHERE FIND_IN_SET(?, memberTypeIds) ORDER BY loanTypeName, loanAmount  ";
    connection.query(mysql, req.memberTypeId, (err, results, fields) => {
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

router.get("/loan-month-range/:loanId", loanInfo, (req, res) => {
  const loanId = req.params.loanId;
  console.log(req.startLoanDate)
  console.log(req.endLoanDate)
  // req.approvedAt
  // const approvedAt = "2023-02-01"
  try {
    const mysql =
      "select "+
      "DATE_FORMAT(m1, '%m/%Y') AS month "+
      
      "from "+
      "( "+
      "select  "+
      "(? - INTERVAL DAYOFMONTH(?) - 30 DAY)  "+
      "+INTERVAL m MONTH as m1 "+
      "from "+ 
      "( "+
      "select @rownum:=@rownum+1 as m from "+
      "(select 1 union select 2 union select 3 union select 4) t1, "+
      "(select 1 union select 2 union select 3 union select 4) t2, "+
      "(select 1 union select 2 union select 3 union select 4) t3, "+
      "(select 1 union select 2 union select 3 union select 4) t4, "+
      "(select @rownum:=1) t0 "+
      ") d1 "+
      ") d2  "+
      "where m1 BETWEEN ? AND DATE_ADD(?, INTERVAL ? MONTH) "+
      "order by m1";
    connection.query(mysql, [req.startLoanDate, req.startLoanDate, req.startLoanDate, req.startLoanDate, req.loanDurationInMonth],(err, results, fields) => {
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

router.get("/document", (req, res) => {
  try {
    const mysql =
      "SELECT * FROM tbl_document ORDER BY documentId ";
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

router.put("/other-loans/:nationalId", async (req, res) => {
  const otherLoans  = req.body.otherLoans.toString();
  const nationalId = req.params.nationalId
  // const strOtherLoans = otherLoans.toString();

  console.log('nationalId = '+nationalId)
  console.log('otherLoans = '+otherLoans)
  // console.log('strOtherLoans = '+strOtherLoans)

  try {
    connection.query(
      "UPDATE tbl_member SET otherLoans = ? WHERE nationalId = ? ",
      [otherLoans, nationalId],
      (err, results, fields) => {
        if (err) {
          console.log("Error while updating a member in database!", err);
          return res.status(400).send({status:'error', message: "Error while updating a member in database!" });
        }
        return res
          .status(200)
          .json({status:'success', message: "บันทึกข้อมูลรายการหนี้อื่นๆสำเร็จ!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }

});

module.exports = router;
