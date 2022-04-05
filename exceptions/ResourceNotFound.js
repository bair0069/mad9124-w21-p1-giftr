class sendResourceNotFoundException extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, sendResourceNotFoundException);
    this.code = 404; // this will trigger correct handling by our middleware
    this.status = "404";
    this.title = "Resource does not exist";
    this.description = this.message;
  }
}

export default sendResourceNotFoundException;
