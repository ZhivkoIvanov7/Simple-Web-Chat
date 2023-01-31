const express = require('express');
const config = require('./config');

const app = express();



app.use(express.static("src/public"));

app.listen(config.PORT, () => console.log(`Server is running on port ${config.PORT}...`))