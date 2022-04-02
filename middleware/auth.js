// TODO:

import JWT from "jsonwebtoken";
import config from 'config';

const jwtSecretKey = config.get("jwt.secretKey");
console.log(jwtSecretKey);

function parseToken(headerValue) {
  // check for token if token exists,
  if (headerValue) {
    const [type, token] = headerValue.split(" ");
    // if bearer is equal to "bearer", return token
    if (type.toLowerCase() === "bearer" && token !== undefined) {
      return token;
    }
  }
  // if no token, return undefined
  return undefined;
}

export default function (req, res, next) {
  // if there is no token then user is not logged in send them to login page
  const token = parseToken(req.header("Authorization"));
  if (!token) {
    return res.status(401).send({
      errors: [
        {
          status: 401,
          title: "Not Authorized",
          detail: "You must be logged in to perform this action.",
        },
      ],
    });
  }
  // if there is a token then user is logged in
  try {
    const decoded = JWT.verify(token, jwtSecretKey);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).send({
      errors: [
        {
          status: 401,
          title: "Not Authorized",
          detail: "You must be logged in to perform this action.",
        },
      ],
    });
  }
}
