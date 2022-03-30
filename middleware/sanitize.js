

import xss from 'xss';

// define sanitize function
const sanitize = (source) =>{
  return xss(source,{
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  })
};
// define stripTags(payload) function <--- Created this using forEach instead of For loop different than notes.

const stripTags = (payload) => {
  const attributes = Object.assign({}, payload);
  Object.keys(attributes).forEach((key) => {
    if(key instanceof Array){
      key.map((item) => {
        if (typeof item === 'string') {
          return sanitize(element)}
        });
      } else if (key instanceof Object) {
        key = stripTags(key);}
      else { return sanitize(key);
      }
    })
    return attributes;
};


export default function sanitizeBody (req, res, next) {
const {id, _id, ...attributes} = req.body?.data?.attributes;
req.sanitizedBody = stripTags(attributes);

next()
}