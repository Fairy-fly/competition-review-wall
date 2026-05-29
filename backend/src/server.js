require("dotenv").config();

const app = require("./app");

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Competition Review Wall backend is running on http://localhost:${port}`);
});

