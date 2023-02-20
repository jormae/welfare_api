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
  body("spouseNationalId").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      const spouseNationalId = req.body.spouseNationalId;
      connection.query(
        "SELECT spouseNationalId FROM tbl_spouse WHERE spouseNationalId = ?",
        [spouseNationalId],
        (err, res) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (res.length > 0) {
            reject(new Error("เลขทีบัตรประชาชนคู่สมรสซ้ำ กรุณาลองใหม่อีกครั้ง!"));
          }
          resolve(true);
        }
      );
    });
  }),
  async (req, res) => {
    const { 
      spouseNationalId,
        spouseName,
        spouseOccupation,
        spouseIncome,
        spouseHouseNo,
        spouseStreetName,
        spouseVillageName,
        spouseVillageNo,
        spouseSubDistrict,
        spouseDistrict,
        spouseProvince,
        spousePostCode,
        spouseContactNo,
        memberNationalId
     } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      connection.query(
        "INSERT INTO tbl_spouse(spouseNationalId, spouseName, spouseOccupation, spouseIncome, spouseHouseNo, "+
          "spouseStreetName, spouseVillageName, spouseVillageNo, spouseSubDistrict, spouseDistrict, "+
          "spouseProvince, spousePostCode, spouseContactNo, memberNationalId) "+
          "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,)",
        [
          spouseNationalId,
          spouseName,
          spouseOccupation,
          spouseIncome,
          spouseHouseNo,
          spouseStreetName,
          spouseVillageName,
          spouseVillageNo,
          spouseSubDistrict,
          spouseDistrict,
          spouseProvince,
          spousePostCode,
          spouseContactNo,
          memberNationalId
        ],
        (err, results, fields) => {
          if (err) {
            console.log("Error while inserting a dept into database!", err);
            return res.status(400).send();
          }
          return res
            .status(201)
            .json({ status: "success", message: "บันทึกการเพิ่มข้อมูลคู่สมรสเรียบร้อยแล้ว!" });
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
    spouseOccupation,
    spouseIncome,
    spouseHouseNo,
    spouseStreetName,
    spouseVillageName,
    spouseVillageNo,
    spouseSubDistrict,
    spouseDistrict,
    spouseProvince,
    spousePostCode,
    spouseContactNo,
    updateAt,
    updateBy,
  } = req.body;
  try {
    connection.query(
      "UPDATE tbl_spouse SET  spouseNationalId = ?, spouseName = ?, spouseOccupation = ?, spouseIncome = ?, spouseHouseNo = ?, spouseStreetName = ?, spouseVillageName = ?, " +
        "spouseVillageNo = ?,  spouseSubDistrict = ?,  spouseDistrict = ?,  spouseProvince = ?,  spousePostCode = ?, spouseContactNo = ?, updateAt = ?, updateBy = ? " +
        "WHERE memberNationalId = ?",
      [
        spouseNationalId,
        spouseName,
        spouseOccupation,
        spouseIncome,
        spouseHouseNo,
        spouseStreetName,
        spouseVillageName,
        spouseVillageNo,
        spouseSubDistrict,
        spouseDistrict,
        spouseProvince,
        spousePostCode,
        spouseContactNo,
        updateAt,
        updateBy,
        memberNationalId,
      ],
      (err, results, fields) => {
        if (err) {
          // console.log("Error while updating a spouse in database!", err);
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
