const express = require('express');
const path = require('path');
const app = express();
var process = require('process')

var port = 5000

app.use(express.static(path.join(__dirname, 'build')));

// START: FOR DEVELOPMENT ONLY
// var cors = require('cors')
// app.use(cors());
// const { createProxyMiddleware } = require('http-proxy-middleware');
// app.use('/api', createProxyMiddleware({ 
//     target: 'http://localhost:8080/',
//     changeOrigin: true, 
//     onProxyRes: function (proxyRes, req, res) {
//        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//     }
// }));
// END: FOR DEVELOPMENT ONLY

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
})
console.info("Serving application in port", port)
app.listen(port);