const express = require('express')
const app = express();
var path = require('path');

/* prometheus monitoring */
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'expressjs_app:' });

const histogram = new client.Histogram({
  name: 'expressjs_app:histogram',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'status_code', 'path'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

app.get('/metrics', (request, response) => {
  response.set('Content-Type', client.register.contentType);
  response.send(client.register.metrics());
});

/* user defined API1 */
app.use('/', (request, response) => {
  const end = histogram.startTimer();
  response.sendFile('index.html', {root: path.join(__dirname, '')});
  end({ method: request.method, 'status_code': 200, 'path': '/' });
});

/* user defined API2 */
app.use('/welcome', (request, response) => {
  const end = histogram.startTimer();
  response.send("welcome api");
  end({ method: request.method, 'status_code': 200, 'path': '/welcome' });
});
 
app.listen(8080, () =>
  console.log('Example app listening on port 8080!'),
);