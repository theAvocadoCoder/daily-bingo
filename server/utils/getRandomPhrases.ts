export default function (arr: string[], count: number) {
  const result = [];
  const usedIndices = new Set(); // To avoid duplicates

  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    
    // Only add unique indices
    if (!usedIndices.has(randomIndex)) {
      result.push(arr[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }

  return result;
}