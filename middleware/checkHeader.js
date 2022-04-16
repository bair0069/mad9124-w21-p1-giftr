export default function (req, res, next) {
  const api = req.header("x-api-key");
  if (!api || api.toString() !== "maha0134") {
    return res.status(401).send({
      errors: [
        {
          status: 401,
          title: "Not Authorized",
          detail: "You must have an approved api key to perform this action.",
        },
      ],
    });
  } else {
    next();
  }
}
