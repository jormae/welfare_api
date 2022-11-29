const express = require("express");
const connection = require("../config/database-connection");

const app = express();
app.use(express.json());

const academicYearInfo = function (req, res, next) {
      const orgId = req.body.orgId
        try {
          connection.query(
            "SELECT * "+
            "FROM tbl_academic_year "+
            "WHERE academicYearStatusId = 1 "+
            "AND orgId = ? ", [orgId],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res.status(400).send();
              }
              req.academicYear = results[0].academicYear
              req.semester = results[0].semester
              next()
            }
          );
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = academicYearInfo;