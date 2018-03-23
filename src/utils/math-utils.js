export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement(list) {
  if (!list) {
    return;
  }
  if (list.length === 0) {
    return;
  }
  return list[getRandomInt(0, list.length - 1)];
}
