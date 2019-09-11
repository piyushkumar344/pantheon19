const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connect = require('./db/mongoose_connection')
const app = express();
const cors = require('cors');
const controller = require('./routes/controller');
const portalDown = require('./middlewares/portaldown');
//db connection
connect();

//middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/api', portalDown, controller);

//port connection
let port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Server running  on port ${port}`);
});