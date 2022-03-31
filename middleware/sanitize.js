

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
    let attributes = {...payload}
    for (let key in attributes) {
      attributes[key] = xss(attributes[key], {
        whiteList: [],
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      })
    }
    return attributes
  };


export default async function (req, res, next) {

const {id, _id, ...attributes} = req.body?.data?.attributes;
req.sanitizedBody =  await stripTags(attributes);
console.log(req.sanitizedBody)
next()
}