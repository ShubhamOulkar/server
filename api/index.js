const express = require("express");
const route = require("./routes");
const morgan = require("morgan");
const port = process.env.PORT || 3050;
const app = express();
const { connectMongo } = require("./db");
app.use(morgan("tiny"));
app.use(express.json());
app.use(route);

connectMongo();

app.listen(port, () =>
  console.log(`server is running on http://localhost:${port}`)
);
