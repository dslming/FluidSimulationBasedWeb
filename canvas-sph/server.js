const express = require("express");
const app = express();
const port = 8088;

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));

app.listen(port, () => console.log(`Listening on port ${port}`));
