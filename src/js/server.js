const http = require('http');
const fs = require('fs');
const path = require('path');

// Serve the HTML page
http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('client\\index.html', (err, content) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }
  // Add more conditions for other pages or assets (CSS, images)
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});