const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connect = require('./db/mongoose_connection')
const app = express();
const authentication = require('./routes/authenticate')
const cors = require('cors');
const profile = require('./routes/profile');
const event = require('./routes/events');
//db connection
connect();

//middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/auth', authentication);
app.use('/profile', profile);
app.use('/event', event);

//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/view', 'index.html'));
});

//port connection
let port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Server running  on port ${port}`);
});