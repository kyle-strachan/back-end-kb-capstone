export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function validateObjectIdArray(arr, fieldName, minimumArrayLength) {
  if (!Array.isArray(arr)) return `${fieldName} must be an array.`;
  if (arr.length < minimumArrayLength)
    return `${fieldName} must have at least ${minimumArrayLength} value.`;
  const invalid = arr.find((id) => !isValidObjectId(id));
  return invalid ? `${fieldName} contains an invalid ObjectId` : null;
}
