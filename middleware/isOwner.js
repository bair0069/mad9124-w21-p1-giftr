//TODO:

import Person from '../models/Person.js';
import User from '../models/User.js';

//export default async function (req, res, next) { // define user check for ownership}

export default async function (req, res, next) {
  const user = await User.findById(req.user._id);
  const userId  = user._id;
  const person = await Person.findById(req.params.id);
  const owner = person.owner;
  console.log(userId)
  console.log(owner)

  if (userId.equals(owner)) {
  next ();
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