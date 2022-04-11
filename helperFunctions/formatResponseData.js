import mongoose from "mongoose";
/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object | Object[]} payload An array or instance object from that collection
 * @returns
 */

function format(resource, type) {
  const { _id, ...attributes } = resource.toJSON ? resource.toJSON() : resource;
  return { type, id: _id, attributes };
}

export default function formatResponseData(payload, type) {
  if (payload instanceof Array) {
    return { data: payload.map((resource) => format(resource, type)) };
  } else {
    return { data: format(payload, type) };
  }
}
