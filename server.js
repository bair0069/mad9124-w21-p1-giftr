import http from 'http' 
import app from './app.js'
import log from './startup/logger.js'

// SERVER
const httpServer = http.createServer(app);
// PORT
const port = process.env.PORT || 3030;
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


