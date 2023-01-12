const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

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
      "SELECT * " +
        "FROM tbl_loan l " +
        "LEFT JOIN tbl_loan_payment lp ON lp.loanId = l.loanId " +
        "LEFT JOIN tbl_payment_type pt ON pt.paymentTypeId = lp.paymentTypeId " +
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

// post
router.post(
  "/",
  body("deptName", "orgId").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      const deptName = req.body.deptName;
      const orgId = req.body.orgId;
      connection.query(
        "SELECT deptName FROM tbl_dept WHERE deptName = ? AND orgId = ?",
        [deptName, orgId],
        (err, res) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (res.length > 0) {
            reject(new Error("dept name is already existed!"));
          }
          resolve(true);
        }
      );
    });
  }),
  async (req, res) => {
    const { deptName, deptStatusId, branchId, orgId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      connection.query(
        "INSERT INTO tbl_dept(deptName, deptStatusId, branchId, orgId) VALUES (?,?,?,?)",
        [deptName, deptStatusId, branchId, orgId],
        (err, results, fields) => {
          if (err) {
            console.log("Error while inserting a dept into database!", err);
            return res.status(400).send();
          }
          return res
            .status(201)
            .json({ message: "New dept is successfully created!" });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);

router.put("/:nationalId", async (req, res) => {
  const nationalId = req.params.nationalId;
  const deptId = req.body.deptId;
  const deptName = req.body.deptName;
  const deptStatusId = req.body.deptStatusId;
  const branchId = req.body.branchId;
  const orgId = req.body.orgId;
  try {
    connection.query(
      "UPDATE tbl_member SET deptName = ?, deptStatusId = ?, branchId = ?, orgId = ? WHERE nationalId = ?",
      [deptName, deptStatusId, branchId, orgId, nationalId],
      (err, results, fields) => {
        if (err) {
          console.log("Error while updating a dept in database!", err);
          return res.status(400).send();
        }
        return res
          .status(200)
          .json({ message: "The dept is successfully updated!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
