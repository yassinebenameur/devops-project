const express = require('express')
const dotenv = require('dotenv');
const functions = require("./util/functions");

dotenv.config();
const app = express()

const promClient = require('prom-client');
const promBundle = require('express-prom-bundle');

const bundle = promBundle({
    buckets: [0.1, 0.4, 0.7],
    includeMethod: true,
    includePath: true,
    // customLabels: {year: null},
    // transformLabels: labels => Object.assign(labels, {year: new Date().getFullYear()}),
    metricsPath: '/metrics',
    promClient: {
        collectDefaultMetrics: {}
    },
    urlValueParser: {
        minHexLength: 5,
        extraMasks: [
            "^[0-9]+\\.[0-9]+\\.[0-9]+$" // replace dot-separated dates with #val
        ]
    },
    normalizePath: [
        ['^/foo', '/example'] // replace /foo with /example
    ]
});

app.use(bundle);
// native prom-client metric (no prefix)
const c1 = new promClient.Counter({name: 'c1', help: 'c1 help'});
c1.inc(10);

// app.use(metricsMiddleware);
// get configurations from .env
const PORT = process.env.PORT || 3000


app.get('/', (req, res) => {
    res.send('Hello World! V2')
    // saving the time of a connection

})

app.get('/prime/list/:n', (req, res) => {
    let result = functions.listPrimes(req.params.n);
    res.json({
        'max': req.params.n,
        'found': result.length,
        'result': result
    })

})

app.get('/prime/:n', (req, res) => {

    let result = functions.isPrime(req.params.n);
    res.json({
        'number': req.params.n,
        'result': result
    })

})

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})