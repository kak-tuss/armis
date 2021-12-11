const express = require('express');
const open = require('open');

const PORT = 3000;
const PUBLIC_FOLDER = 'public';
const URL = `http://localhost:${PORT}`;

const app = express();

app.use(express.static(PUBLIC_FOLDER));
app.listen(PORT, function () {
    console.log(`App is available at ${URL}`);
});
open(URL);