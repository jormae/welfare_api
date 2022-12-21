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
    const mysql = "SELECT * FROM tbl_spouse ";
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

router.get("/:memberNationalId", async (req, res) => {
  const memberNationalId = req.params.memberNationalId;
  console.log(memberNationalId);
  try {
    connection.query(
      "SELECT * FROM tbl_spouse WHERE memberNationalId = ?",
      [memberNationalId],
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

router.put("/:memberNationalId", async (req, res) => {
  const memberNationalId = req.params.memberNationalId;
  console.log(memberNationalId);
  const {
    spouseNationalId,
    spouseName,
    houseNo,
    streetName,
    villageName,
    villageNo,
    subDistrict,
    district,
    province,
    postCode,
    contactNo,
    updateAt,
    updateBy,
  } = req.body;
  try {
    connection.query(
      "UPDATE tbl_spouse SET  spouseNationalId = ?, spouseName = ?, houseNo = ?, streetName = ?, villageName = ?, " +
        "villageNo = ?,  subDistrict = ?,  district = ?,  province = ?,  postCode = ?, contactNo = ?, updateAt = ?, updateBy = ? " +
        "WHERE memberNationalId = ?",
      [
        spouseNationalId,
        spouseName,
        houseNo,
        streetName,
        villageName,
        villageNo,
        subDistrict,
        district,
        province,
        postCode,
        contactNo,
        updateAt,
        updateBy,
        memberNationalId,
      ],
      (err, results, fields) => {
        if (err) {
          // console.log("Error while updating a spause in database!", err);
          // return res.status(400).send();
          return res.status(400).json({
            status: "error",
            message: "บันทึกข้อมูลคู่สมรสล้มเหลว กรุณาติดต่อผู้ดูแลระบบ!",
          });
        }
        return res
          .status(200)
          .json({ status: "success", message: "บันทึกข้อมูลคู่สมรสสำเร็จ!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
