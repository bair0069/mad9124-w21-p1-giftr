import server from 'http' 
import app from './app.js'
// import winston || debug

// DEBUG || WINSTON

// SERVER
const server = http.createServer(app);

// PORT
const port = process.env.PORT || 3030;
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
