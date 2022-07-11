var express = require('express'),
  app = express(),
  port = process.env.PORT,
  bodyParser = require('body-parser');
const helmet = require('helmet')
var hpp = require('hpp');
app.use(helmet())
app.use(hpp());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var routes = require('./api/routes/dashCoinRoute');
routes(app);
app.use(function (req, res) {
  res.status(404).send({ resource: req.originalUrl + ' not found' })
});
app.listen(port);
console.log('RESTful API server started on: ' + port);


