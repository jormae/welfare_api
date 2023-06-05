const express = require("express");
const connection = require("../config/database-connection");

const app = express();
app.use(express.json());

const loanFeeInfo = function (req, res, next) {
  
      const loanTypeId = req.body.loanTypeId

        try {
          connection.query(
            "SELECT * "+
            "FROM tbl_loan_type "+
            "WHERE loanTypeId = ? ", [loanTypeId],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res.status(400).send();
              }
              console.log(results)
              req.loanFee = results[0].loanFee
              next()
            }
          );
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = loanFeeInfo;