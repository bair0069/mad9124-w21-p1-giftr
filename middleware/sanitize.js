// import xss from "xss";

// // define sanitize function
// const sanitize = (source) => {
//   return xss(source, {
//     whiteList: [],
//     stripIgnoreTag: true,
//     stripIgnoreTagBody: ["script"],
//   });
// };
// // define stripTags(payload) function <--- Created this using forEach instead of For loop different than notes.

// const stripTags = (payload) => {
//   let attributes = { ...payload };
//   for (let key in attributes) {
//     attributes[key] = xss(attributes[key], {
//       whiteList: [],
//       stripIgnoreTag: true,
//       stripIgnoreTagBody: ["script"],
//     });
//   }
//   return attributes;
// };

// export default async function (req, res, next) {
//   //discard the properties id, createdAt and updatedAt, if provided in the req body
//   const { id, _id, createdAt, updatedAt, ...attributes } =
//     req.body?.data?.attributes;
//   req.sanitizedBody = await stripTags(attributes);
//   next();
// }

//changed to incorporate the use of sanitize, as per notes
import xss from "xss";
const sanitize = (sourceString) => {
  return xss(sourceString, {
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
};

const stripTags = (payload) => {
  const attributes = Object.assign({}, payload); // { ...payload }

  for (let key in attributes) {
    if (attributes[key] instanceof Array) {
      attributes[key] = attributes[key].map((element) => {
        if (typeof element === "string") {
          return sanitize(element);
        } else {
          return stripTags(element);
        }
      });
    } else if (attributes[key] instanceof Object) {
      attributes[key] = stripTags(attributes[key]);
    } else {
      attributes[key] = sanitize(attributes[key]);
    }
  }

  return attributes;
};

export default function sanitizeBodyMiddleware(req, res, next) {
  const { id, _id, ...attributes } = req.body?.data?.attributes;
  req.sanitizedBody = stripTags(attributes);

  next();
}
