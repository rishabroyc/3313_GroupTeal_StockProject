const express = require('express');
const net = require('net');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8080;

// Enable CORS and body parsing
app.use(cors());
app.use(bodyParser.text()); // Parse text/plain requests

// Handle all POST requests to the proxy
app.post('/', async (req, res) => {
  try {
    const command = req.body;
    console.log(`Received command: ${command}`);
    
    // Function to create a socket and send command
    const sendToBackend = () => {
      return new Promise((resolve, reject) => {
        // Create a socket client
        const client = new net.Socket();
        let responseData = '';
        
        // Set a timeout
        const timeout = setTimeout(() => {
          client.destroy();
          reject(new Error('Connection timeout'));
        }, 5000);
        
        // Connect to backend
        client.connect(BACKEND_PORT, BACKEND_HOST, () => {
          console.log('Connected to backend server');
          
          // With HTTP headers
          const httpCommand = `GET /${command} HTTP/1.1\r\nHost: localhost\r\n\r\n`;
          client.write(httpCommand);
        });
        
        // Handle data received
        client.on('data', (data) => {
          responseData += data.toString();
          // Close the connection after receiving data
          client.end();
        });
        
        // Handle connection closed
        client.on('close', () => {
          clearTimeout(timeout);
          console.log('Connection closed');
          console.log(`Raw response: ${JSON.stringify(responseData)}`);
          
          // Parse HTTP response - extract the body
          const responseBody = responseData.split('\r\n\r\n')[1] || responseData;
          resolve(responseBody.trim());
        });
        
        // Handle errors
        client.on('error', (err) => {
          clearTimeout(timeout);
          console.error('Socket error:', err);
          reject(err);
        });
      });
    };
    
    // Send command to backend
    const response = await sendToBackend();
    
    // Send response back to client
    res.setHeader('Content-Type', 'text/plain');
    res.send(response || 'ERROR|No response from server');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('ERROR|Error communicating with backend server');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:3001`);
});