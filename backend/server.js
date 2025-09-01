const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
const productsRoute = require("./routes/products");
const salesRoute = require("./routes/sales");
const loanRoute = require("./routes/loan");
const withdrawRoute = require("./routes/withdraw");
const reportRoute = require("./routes/report");


app.use("/api/report", reportRoute);
app.use("/api/products", productsRoute);
app.use("/api/sales", salesRoute);
app.use("/api/loan", loanRoute);
app.use("/api/withdraw", withdrawRoute);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
