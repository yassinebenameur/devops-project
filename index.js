const express = require('express')
const dotenv = require('dotenv');
dotenv.config();
const app = express()
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({includeMethod: true});

app.use(metricsMiddleware);
// get configurations from .env
const PORT = process.env.PORT || 3000


app.get('/', (req, res) => {
    res.send('Hello World!')
    // saving the time of a connection

})

app.get('/api1', (req, res) => {
    res.send('this is api 1')
    // saving the time of a connection

})

app.get('/api2', (req, res) => {
    res.send('This is api 2')
    // saving the time of a connection

})


app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})