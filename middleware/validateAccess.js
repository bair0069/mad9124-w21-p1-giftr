import Person from "../models/Person.js";

export default async function (req, res, next) {
  const userId = req.user._id;
  const person = await Person.findById(req.params.id);
  const owner = person.owner;
  if (userId === owner.toString()) {
    next();
  } else if (person.sharedWith.includes(userId)) {
    next();
  } else {
    res.status(403).send({
      errors: [
        {
          status: 403,
          title: "Forbidden",
          detail: "You are not authorized to perform this action.",
        },
      ],
    });
  }
}