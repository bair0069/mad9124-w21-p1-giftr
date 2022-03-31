import http from 'http' 
import app from './app.js'
import log from './startup/logger.js'

// DEBUG || WINSTON

// SERVER
const httpServer = http.createServer(app);
// PORT
const port = process.env.PORT || 3030;
httpServer.listen(port, () => {
  log.info(`Listening on port ${port}`);
});


