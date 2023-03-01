const express = require("express");
const connection = require("../config/database-connection");

const app = express();
app.use(express.json());

const loanInfo = function (req, res, next) {
  
      const loanId = req.params.loanId

        try {
          connection.query(
            "SELECT * "+
            "FROM tbl_loan l "+
            "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId "+
            "WHERE loanId = ? ", [loanId],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res.status(400).send();
              }
              console.log(results)
              req.loanDurationInMonth = results[0].loanDurationInMonth
              req.approvedAt = results[0].approvedAt
              req.loanAmount = results[0].loanAmount
              req.monthlyPayment = results[0].monthlyPayment
              next()
            }
          );
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = loanInfo;