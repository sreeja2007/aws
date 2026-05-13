const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => res.json({ status: "ok", message: "Node.js app running!" }));
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
