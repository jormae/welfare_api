const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");
// const authRouter = require("./routes/auth");
// const dashboardRouter = require("./routes/dashboard");
const membersRouter = require("./routes/members");
const spousesRouter = require("./routes/spouses");
const investmentsRouter = require("./routes/investments");
const loansRouter = require("./routes/loans");
const dividendsRouter = require("./routes/dividends");
const utilsRouter = require("./routes/utils");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Welcome to my js api."));
// app.use("/auth", authRouter);
app.use("/members", membersRouter);
app.use("/spouses", spousesRouter);
app.use("/investments", investmentsRouter);
app.use("/loans", loansRouter);
app.use("/dividends", dividendsRouter);
app.use("/utils", utilsRouter);

app.listen(3030, () => console.log("Server is running on port 3030"));
