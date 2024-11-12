// @see https://medium.com/@oldwestaction/randomness-is-hard-e085decbcbb2
export const shuffleFisherYates = (array: Array<any>): Array<any> => {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[rand]] = [newArray[rand], newArray[i]];
  }
  return newArray;
};
