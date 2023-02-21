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
      "SELECT *, (SELECT SUM(totalShare) FROM tbl_investment i WHERE i.nationalId = m.nationalId) AS totalInvestment " +
      "FROM tbl_member m " +
      "LEFT JOIN tbl_member_role mr ON mr.memberRoleId = m.memberRoleId " +
      "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId " +
      "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = m.paymentTypeId " +
      "LEFT JOIN tbl_position p ON p.positionId = m.positionId " +
      "LEFT JOIN tbl_spouse s ON s.memberNationalId = m.nationalId";
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

router.get("/active", (req, res) => {
  try {
    const mysql =
    "SELECT approvedAt, memberName, positionName, memberTypeName, loanTypeName, loanAmount, loanStatusName, loanDurationInMonth, monthlyPayment, (loanAmount - (if(loanBalance IS NOT NULL, loanBalance, 0))) AS loanBalance "+
    "FROM"+
    "(SELECT l.approvedAt, memberName, positionName, memberTypeName, loanTypeName, loanAmount, loanStatusName, loanDurationInMonth, monthlyPayment, "+
    "(SELECT SUM(paymentAmount) FROM tbl_loan_payment lp WHERE lp.loanId = l.loanId) AS loanBalance "+
    "FROM tbl_loan l "+
    "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
    "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
    "LEFT JOIN tbl_loan_status ls ON ls.loanStatusId = l.loanStatusId "+
    "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId "+
    "LEFT JOIN tbl_position p ON p.positionId = m.positionId "+
    "WHERE l.loanStatusId = 1 ) AS x";
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

router.get("/request", (req, res) => {
  try {
    const mysql =
    "SELECT * " +
    "FROM tbl_loan l " +
    "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
    "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
    "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = m.paymentTypeId " +
    "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId " +
    "LEFT JOIN tbl_loan_status ls ON ls.loanStatusId = l.loanStatusId "+
    "LEFT JOIN tbl_position p ON p.positionId = m.positionId " +
    "WHERE l.loanStatusId = 0 ";
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

router.get("/request/:nationalId", (req, res) => {
  const nationalId = req.params.nationalId;
  try {
    const mysql =
    "SELECT l.*, m.*, lt.*, pt.*, mt.*, p.*, ls.* "+
    ",m1.memberName AS firstReferenceName, m1.contactNo AS firstReferenceContactNo, m2.memberName AS secondReferenceName, m2.contactNo AS secondReferenceContactNo, " +
    "m.memberName AS loanMemberName "+
    "FROM tbl_loan l " +
    "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
    "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
    "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = m.paymentTypeId " +
    "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId " +
    "LEFT JOIN tbl_position p ON p.positionId = m.positionId " +
    "LEFT JOIN tbl_loan_status ls ON ls.loanStatusId = l.loanStatusId "+
    "LEFT JOIN tbl_member m1 ON m1.nationalId = l.firstReferenceId "+
    "LEFT JOIN tbl_member m2 ON m2.nationalId = l.secondReferenceId "+
    "WHERE l.nationalId = ?";
    connection.query(mysql,[nationalId], (err, results, fields) => {
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

router.get("/follow-up", (req, res) => {
  try {
    const mysql =
    "SELECT * " +
    "FROM tbl_loan l " +
    "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
    "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
    "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = m.paymentTypeId " +
    "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId " +
    "LEFT JOIN tbl_position p ON p.positionId = m.positionId " +
    "WHERE loanStatusId = 1 "+
    "AND m.memberStatus = 0";
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

router.get("/members/:nationalId", async (req, res) => {
  const nationalId = req.params.nationalId;
  try {
    connection.query(
      "SELECT *, " +
        "(SELECT SUM(paymentAmount) FROM tbl_loan_payment lp WHERE nationalId = ? AND lp.loanId = l.loanId) AS totalPayment " +
        "FROM tbl_loan l " +
        "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId " +
        "LEFT JOIN tbl_loan_status ls ON ls.loanStatusId = l.loanStatusId " +
        "WHERE nationalId = ?",
      [nationalId, nationalId],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/loan-history/:nationalId/:loanId", async (req, res) => {
  const nationalId = req.params.nationalId;
  const loanId = req.params.loanId;
  try {
    connection.query(
      "SELECT monthNo, loanPaymentMonth, paymentAmount, paymentTypeName, lp.approvedAt, lp.approvedBy, loanStatusName  " +
      "FROM tbl_loan_payment lp  "+
      "LEFT JOIN tbl_loan l ON lp.loanId = l.loanId "+
      "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = lp.paymentTypeId  " +
      "LEFT JOIN tbl_loan_status s ON s.loanStatusId = l.loanStatusId "+
      "WHERE nationalId = ? " +
      "AND l.loanId = ?",
      [nationalId, loanId],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/surety/:nationalId", async (req, res) => {
  const nationalId = req.params.nationalId;
  try {
    connection.query(
      "SELECT approvedAt, memberName, loanTypeName, loanAmount, loanStatusName, loanDurationInMonth, monthlyPayment, (loanAmount - (if(loanBalance IS NOT NULL, loanBalance, 0))) AS loanBalance "+
      "FROM"+
      "(SELECT l.approvedAt, memberName, loanTypeName, loanAmount, loanStatusName, loanDurationInMonth, monthlyPayment, "+
      "(SELECT SUM(paymentAmount) FROM tbl_loan_payment lp WHERE lp.loanId = l.loanId) AS loanBalance "+
      "FROM tbl_loan l "+
      "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
      "LEFT JOIN tbl_loan_status ls ON ls.loanStatusId = l.loanStatusId "+
      "WHERE (firstReferenceId = ? OR secondReferenceId = ?) ) AS x",
      [nationalId, nationalId],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/payment-suggestion/:nationalId", async (req, res) => {
  const nationalId = req.params.nationalId;
  try {
    connection.query(
      // "SELECT lp.loanId, DATE_ADD(loanPaymentMonth, INTERVAL 1 MONTH) AS loanPaymentMonth, monthNo + 1 AS monthNo, paymentAmount, lp.paymentTypeId, l.nationalId, memberName, refId "+  
      // "FROM tbl_loan_payment lp  "+
      // "LEFT JOIN tbl_loan l ON lp.loanId = l.loanId  "+
      // "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId "+
      // "WHERE loanStatusId = 1 "+
      // "AND l.nationalId = ?",
      "SELECT loanId, loanTypeName, memberName, nationalId, refId, paymentTypeId, monthlyPayment, IF(monthNo IS NULL, 0, monthNo) + 1 AS monthNo "+
      "FROM "+
      "(SELECT l.loanId, loanTypeName, memberName, m.nationalId, refId, paymentTypeId, monthlyPayment, "+
      "(SELECT MAX(monthNo) FROM tbl_loan_payment lp WHERE lp.loanId = l.loanId) AS monthNo "+
      " FROM tbl_loan l "+
      "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
      "LEFT JOIN tbl_member m ON m.nationalId = l.nationalId  "+
      "WHERE loanStatusId = 1 "+ 
      "AND l.nationalId = ?"+
      ") AS x",
      [nationalId],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// post
router.post("/",
body("nationalId").custom((value, { req }) => {
  return new Promise((resolve, reject) => {
    const nationalId = req.body.nationalId;
    connection.query(
      "SELECT * FROM tbl_loan WHERE nationalId = ? AND  (loanStatusId IS NULL OR loanStatusId = 1)",
      [nationalId],
      (err, res) => {
        if (err) {
          reject(new Error("Server Error"));
        }
        if (res.length > 0) {
          reject(new Error("ส่งคำร้องขอสวัสดิการซ้ำหรือท่านกำลังกู้เงินสวัสดิการขณะนี้!"));
        }
        resolve(true);
      }
    );
  });
}),
async (req, res) => {
    const { nationalId, loanTypeId, firstReferenceId, secondReferenceId } = req.body;
    const requestedDateTime =  moment().format('YYYY-MM-DD H:i:s');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      connection.query(
        "INSERT INTO tbl_loan(nationalId, loanTypeId, firstReferenceId, secondReferenceId, requestedDateTime) VALUES (?,?,?,?,?)",
        [nationalId, loanTypeId, firstReferenceId, secondReferenceId, requestedDateTime],
        (err, results, fields) => {
          if (err) {
            console.log("Error :: บันทึกข้อมูลการส่งคำร้องขอสวัสดิการล้มเหลว!", err);
            return res.status(400).send();
          }
          return res
            .status(201)
            .json({ status: 'success', message: "บันทึกข้อมูลการส่งคำร้องขอสวัสดิการเรียบร้อยแล้ว!" });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);

router.put("/:loanId", async (req, res) => {
  const loanId = req.params.loanId;
  const { approvedBy, loanStatusId, refId } = req.body;
  const approvedAt =  moment().format('YYYY-MM-DD H:m:s');
  try {
    connection.query(
      "UPDATE tbl_loan SET refId = ?, approvedBy = ?, approvedAt = ?, loanStatusId = ? WHERE loanId = ? ",
      [refId, approvedBy, approvedAt, loanStatusId, loanId],
      (err, results, fields) => {
        if (err) {
          console.log("Error while updating loan approval in database!", err);
          return res.status(400).send();
        }
        return res
          .status(200)
          .json({ status: "success", message: "บันทึกข้อมูลการอนุมัติคำร้องขอสวัสดิการเรียบร้อยแล้ว!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
