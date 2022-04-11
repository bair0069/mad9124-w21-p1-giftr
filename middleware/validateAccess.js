

async function isOwner(personId, userId) {
  const person = await Person.findById(personId);
  const owner = person.owner;
  if (userId === owner.toString()) {
    return true;
  } else {
    return false;
  }
}

async function sharedWith(personId, userId) {
  const person = await Person.findById(personId);
  // console.log(person.sharedWith);
  let isShared = false;
  person.sharedWith.forEach((id) => {
    if (id.toString() == userId) {
      isShared = true;
    }
  });
  return isShared;
}

export default function (res,req,next){
  const person= await Person.findById(req.params.id);
  const owner = person.owner;
  if(userId === owner.toString()){
    next();
  }
  else if (person.sharedWith.includes(userId)){
    next();
  }
  else{
    res.status(403).json({
      error: "You do not have access to this resource"
    });
  }
}