import express from "express";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import auth from "../middleware/auth.js";
import log from "../startup/logger.js";
import validateId from "../middleware/validateID.js";
import validateAccess from "../middleware/validateAccess.js";


const router = express.Router();

router.get("/", auth, async (req, res) => {
  //show only persons that were created by the user
  const people = await Person.find().or([
    { owner: req.user._id },
    { sharedWith: req.user._id },
  ]);
  res.status(201).json(people.map((person) => formatResponseData(person,'people')));
});

router.get("/:id", auth, validateId, async (req, res, next) => {
  const personId = req.params.id;
  try {
      const person = await Person.findById(personId,'people');
      person.depopulate("gifts");
      res.json(formatResponseData(person,'people'));
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
    res.status(201).json(formatResponseData(newPerson,'people'));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.patch("/:id", auth, sanitize,validateId,validateAccess, async (req, res, next) => {
  const personId = req.params.id;
  try {
        const object = await Person.findByIdAndUpdate(
          personId,
          req.sanitizedBody,
          { new: true, overwrite: false, runValidators: true }
        );
        res.json(formatResponseData(object,'people'));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.put("/:id", auth, sanitize,validateId,validateAccess, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  try {
        const object = await Person.findByIdAndUpdate(
          personId,
          { owner: userId, ...req.sanitizedBody },
          { new: true, overwrite: true, runValidators: true }
        );
        res.json(formatResponseData(object,'people'));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.delete("/:id", auth,validateId,validateAccess, async (req, res, next) => {
  const personId = req.params.id;
  try {
        const person = await Person.findByIdAndRemove(personId);
        res.json(formatResponseData(person,'people'));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

export default router;
