"use strict";
const express = require('express');
const app = express();
const port = 3000;
const config = require('../config.json');
app.get('/', (req, res) => {
    res.json(config);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map