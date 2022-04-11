//DEPENDENCIES
import express from "express";
//MODELS
import Person from "../models/Person.js";

/**MIDDLEWARE
 * sanitize removes script tags from the request body
 * auth checks the users token
 * validateId checks if the personId, or gift id is valid.
 * validateAccess checks if the user is the owner of the resource or if the person is shared with the user
 *
 */
import sanitize from "../middleware/sanitize.js";
import auth from "../middleware/auth.js";
import validateId from "../middleware/validateID.js";
import validateAccess from "../middleware/validateAccess.js";

//HELPER FUNCTIONS
import formatResponseData from "../helperFunctions/formatResponseData.js";
import log from "../startup/logger.js";

/**ROUTES
 * router.get() - get all people created by user
 * router.get() - get a person by id
 * router.post() - create a new person
 *
 **** ONLY OWNERS CAN UPDATE AND DELETE PEOPLE**
 * router.patch() - update a person
 * router.put() - replace a person
 * router.delete() - delete a person
 */
const router = express.Router();

router.get("/", auth, async (req, res) => {
  //show only persons that were created by the user
  const people = await Person.find().or([
    { owner: req.user._id },
    { sharedWith: req.user._id },
  ]);
  res
    .status(201)
    .json(people.map((person) => formatResponseData(person, "people")));
});

router.get("/:id", auth, validateId, validateAccess, async (req, res, next) => {
  const personId = req.params.id;
  try {
    const person = await Person.findById(personId);
    res.json(formatResponseData(person, "people"));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.post("/", auth, sanitize, async (req, res, next) => {
  const newPerson = new Person(req.sanitizedBody);
  newPerson.owner = req.user._id;
  try {
    await newPerson.save();
    res.status(201).json(formatResponseData(newPerson, "people"));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.patch(
  "/:id",
  auth,
  sanitize,
  validateId,
  validateAccess,
  async (req, res, next) => {
    const personId = req.params.id;
    try {
      const object = await Person.findByIdAndUpdate(
        personId,
        req.sanitizedBody,
        { new: true, overwrite: false, runValidators: true }
      );
      res.json(formatResponseData(object, "people"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

router.put(
  "/:id",
  auth,
  sanitize,
  validateId,
  validateAccess,
  async (req, res, next) => {
    const personId = req.params.id;
    const userId = req.user._id;
    try {
      const object = await Person.findByIdAndUpdate(
        personId,
        { owner: userId, ...req.sanitizedBody },
        { new: true, overwrite: true, runValidators: true }
      );
      res.json(formatResponseData(object, "people"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

router.delete(
  "/:id",
  auth,
  validateId,
  validateAccess,
  async (req, res, next) => {
    const personId = req.params.id;
    try {
      const person = await Person.findByIdAndRemove(personId);
      res.json(formatResponseData(person, "people"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

export default router;
