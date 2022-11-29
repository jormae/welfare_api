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
  // res.send("Position page!");
  try {
    connection.query(
      "SELECT * FROM tbl_position p LEFT JOIN tbl_org o ON o.orgId = p.orgId",
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

router.get("/:positionId", async (req, res) => {
  const positionId = req.params.positionId;
  try {
    connection.query(
      "SELECT * FROM tbl_position WHERE positionId = ?",
      [positionId],
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

router.post(
  "/",
  body("positionName", "orgId").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      const positionName = req.body.positionName;
      const orgId = req.body.orgId;
      connection.query(
        "SELECT positionName FROM tbl_position WHERE positionName = ? AND orgId = ?",
        [positionName, orgId],
        (err, res) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (res.length > 0) {
            reject(new Error("Position name is already existed!"));
          }
          resolve(true);
        }
      );
    });
  }),
  async (req, res) => {
    const { positionName, positionStatusId, orgId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      connection.query(
        "INSERT INTO tbl_position(positionName, positionStatusId, orgId) VALUES (?,?,?)",
        [positionName, positionStatusId, orgId],
        (err, results, fields) => {
          if (err) {
            console.log("Error while inserting a position into database!", err);
            return res.status(400).send();
          }
          return res
            .status(201)
            .json({ message: "New position is successfully created!" });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  }
);

router.put("/:positionId", async (req, res) => {
  const positionId = req.params.positionId;
  const positionName = req.body.positionName;
  const positionStatusId = req.body.positionStatusId;
  try {
    connection.query(
      "UPDATE tbl_position SET positionName = ?, positionStatusId = ? WHERE positionId = ?",
      [positionName, positionStatusId, positionId],
      (err, results, fields) => {
        if (err) {
          console.log("Error while updating a position in database!", err);
          return res.status(400).send();
        }
        return res
          .status(200)
          .json({ message: "The position is successfully updated!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.delete("/:positionId", async (req, res) => {
  const positionId = req.params.positionId;
  try {
    connection.query(
      "DELETE FROM tbl_position WHERE positionId = ?",
      [positionId],
      (err, results, fields) => {
        if (err) {
          console.log("Error while deleting a position in database!", err);
          return res.status(400).send();
        }
        return res
          .status(200)
          .json({ message: "The position is successfully deleted!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
