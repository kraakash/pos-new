const inputStrings = [
  "nums = [2,7,11,15], target = 9",
  "nums=[3,2,4],target=6",
  "lists = [[1,4,5],[1,3,4],[2,6]]",
  's = ["h","e","l","l","o"]'
];

for (const inputString of inputStrings) {
  const regex = /(?:^|,)\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/g;
  const variableNames = [];
  let match;
  while ((match = regex.exec(inputString)) !== null) {
    variableNames.push(match[1]);
  }
  console.log(inputString, "=>", variableNames);
}
