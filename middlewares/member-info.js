const express = require("express");
const connection = require("../config/database-connection");

const app = express();
app.use(express.json());

const memberInfo = function (req, res, next) {

      const nationalId = req.params.nationalId
      console.log(nationalId)

        try {
          connection.query(
            "SELECT * "+
            "FROM tbl_member m "+
            "LEFT JOIN tbl_member_type mt ON mt.memberTypeId = m.memberTypeId "+
            "WHERE m.nationalId = ? ", [nationalId],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res.status(400).send();
              }
              console.log(results)
              req.memberTypeId = results[0].memberTypeId
            //   req.approvedAt = results[0].approvedAt
            //   req.memberAmount = results[0].memberAmount
            //   req.monthlyPayment = results[0].monthlyPayment
              next()
            }
          );
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = memberInfo;