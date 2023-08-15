const express = require("express");
const connection = require("../config/database-connection");

const app = express();
app.use(express.json());

const loanRequestDuplicateInfo = function (req, res, next) {
  
      const nationalId = req.body.nationalId
      const loanTypeId = req.body.loanTypeId

        try {
          connection.query(
            "SELECT COUNT(*) AS totalLoan "+ 
            "FROM tbl_loan l  "+
            "LEFT JOIN tbl_loan_type lt ON lt.loanTypeId = l.loanTypeId  "+
            "WHERE closeLoanStatusId <> 3 "+
            "AND loanStatusId <> 2 "+
            "AND nationalId = ? "+
            "AND loanMainTypeId IN (SELECT loanMainTypeId FROM tbl_loan_type WHERE loanTypeId = ?)", [nationalId, loanTypeId],
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res.status(400).send();
              }
              req.totalLoan = results[0].totalLoan
              console.log(req.totalLoan)
              next()
            }
          );
        } catch (err) {
          console.log(err);
          return res.status(500).send();
        } 
    }

module.exports = loanRequestDuplicateInfo;