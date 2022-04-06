import Person from "../models/Person.js";
import Gift from "../models/Gift.js";

// checks for ownership

export default async function (req, res, next) {
  //*TO BE DELETED
  //we already know the user from req.user
  // const user = await User.findById(req.user._id);
  // const userId  = user._id;
  const person = await Person.findById(req.params.id);
  const owner = person.owner;
  const userId = req.user._id;

  if (userId === owner.toString()) {
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
