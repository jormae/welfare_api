const express = require("express");
const connection = require("../config/database-connection");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 14;
const jwt = require("jsonwebtoken");
const secret = "welfare@daruss";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post("/signup", jsonParser, function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  let staffName = req.body.staffName;
  let userTypeId = req.body.userTypeId;
  let userStatusId = req.body.userStatusId;

  try {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      connection.query(
        "INSERT INTO tbl_user (email, password, staffName, userTypeId, userStatusId) VALUES (?, ?, ?, ?, ? )",
        [email, hash, staffName, userTypeId, userStatusId],
        (err, results, fields) => {
          if (err) {
            console.log("Error while signup new user!", err);
            return res.status(400).send();
          }
          console.log(results);

          return res
            .status(200)
            .json({ message: "ลงทะเบียนผู้ใช้งานใหม่เรียบร้อยแล้ว" });
        }
      );
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post("/signin", jsonParser, function (req, res, next) {
  let nationalId = req.body.username;
  let password = req.body.password;

  try {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      connection.query(
        "SELECT * FROM tbl_member m LEFT JOIN tbl_member_role mr ON mr.memberRoleId = m.memberRoleId WHERE nationalId = ? ",
        [nationalId],
        (err, users, fields) => {
          if (err) {
            console.log("Error while getting user info!", err);
            return res.status(400).send();
          }
          if (users.length == 0) {
            res.json({ status: "error", message: "ไม่พบข้อมูลผู้ใช้" });
          }
          //   console.log(users);
          bcrypt.compare(password, users[0].password, function (err, isLogin) {
            if (isLogin) {
              let token = jwt.sign({ nationalId: users[0].nationalId }, secret, {
                expiresIn: "1h",
              });
              //   return res.status(200).json({
              //     status: "success",
              //     message: "Sign in successfully!",
              //     token,
              //   });
              res.json({
                status: "success",
                message: "Sign in successfully!",
                username: users[0].nationalId,
                memberName: users[0].memberName,
                memberRoleId: users[0].memberRoleId,
                memberRoleName: users[0].memberRoleName,
                token,
              });
            } else {
              //   return res.status(401).json({
              //     status: "error",
              //     message: "Sign in failed!",
              //   });
              res.json({ status: "error", message: "Sign in failed!" });
            }
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post("/token", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let decoded = jwt.verify(token, secret);
    res.json({ status: "success", message: "verified", decoded });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

router.get("/", (req, res) => {
  res.json("Hello");
});

module.exports = router;
