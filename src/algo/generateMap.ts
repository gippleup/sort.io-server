import BlockStack from './BlockStack';

const randomIndexFromArray = (array: any[]): number => {
  const randomValidIndex = Math.floor(Math.random() * array.length);
  return randomValidIndex;
}

const pickRandomFromArray = (array: any[]) => {
  return array[randomIndexFromArray(array)];
}

const extractRandomFromArray = (array: any[]) => {
  const randomIndex = randomIndexFromArray(array);
  const pickedEle = array[randomIndex];
  const front = array.slice(0, randomIndex);
  const latter = array.slice(randomIndex + 1, array.length);
  const extractedArray = front.concat(latter)
  return {
    pickedEle,
    extractedArray,
  };
}

const generateBlockStackShell = (stackCount: number, max: number, min: number) => {
  if (max > 8) {
    throw new Error('max should not exceed 6');
  }

  if (min < 2) {
    throw new Error('min should be larger than 1');
  }

  const result = [];
  for (let i = 0; i < stackCount; i += 1) {
    const numBetweenMinMax = min + Math.round(Math.random() * (max - min))
    result.push(Array(numBetweenMinMax).fill(-1));
  }
  
  return result;
}

const generateSeed = (blockStackMap: number[][], maxScore: number, colorCount: number) => {
  let colors: number[] = [];
  for (let i = 0; i < colorCount; i += 1) {
    colors.push(i);
  }

  const stackShell = blockStackMap;
  let pickedColorCopy = colors.slice(0);
  let stackShellIndexArray = stackShell.map((_, index) => index);
  for (let i = 0; i < colorCount; i += 1) {
    const {pickedEle: randomShellIndex, extractedArray: nextStackShellIndexArray} = extractRandomFromArray(stackShellIndexArray);
    const {pickedEle: randomColor, extractedArray: nextPickedColorCopy} = extractRandomFromArray(pickedColorCopy);
    stackShellIndexArray = nextStackShellIndexArray;
    pickedColorCopy = nextPickedColorCopy;
    stackShell[randomShellIndex].fill(randomColor);
  }

  for (let i = 0; i < maxScore - colorCount; i += 1) {
    const {pickedEle: randomShellIndex, extractedArray: nextStackShellIndexArray} = extractRandomFromArray(stackShellIndexArray);
    const randomColor = pickRandomFromArray(colors);
    stackShellIndexArray = nextStackShellIndexArray;
    stackShell[randomShellIndex].fill(randomColor);
  }

  const mappedToBlockStack = stackShell.map((stackShape) => {
    const filteredShape = stackShape.filter((el) => el !== -1);
    return new BlockStack({
      initialBlockState: filteredShape,
      limit: stackShape.length,
    })
  });

  return mappedToBlockStack
};

const moveBlockFromTo = (stackMap: BlockStack[], fromIndex: number, toIndex: number) => {
  const fromStack = stackMap[fromIndex];
  const toStack = stackMap[toIndex];

  if (!fromStack.isEmpty && !toStack.isFull) {
    const lastEleInFromStack = fromStack.undock() as number;
    toStack.dock(lastEleInFromStack);
  }

  return stackMap;
}

const shuffleStacks = (stackMap: BlockStack[], shuffleCount: number) => {
  for (let i = 0; i < shuffleCount; i += 1) {
    const stackHasAnyBlock = stackMap.filter((stack) => !stack.isEmpty);
    const stackHasAnySpace = stackMap.filter((stack) => !stack.isFull);
    const randomStackFromNotEmpties: BlockStack = pickRandomFromArray(stackHasAnyBlock);
    const randomStackFromNotFulls: BlockStack = pickRandomFromArray(stackHasAnySpace);
    if (randomStackFromNotEmpties !== randomStackFromNotFulls) {
      const lastEleInFromStack = randomStackFromNotEmpties.undock() as number;
      randomStackFromNotFulls.dock(lastEleInFromStack)
    }
  }
  return stackMap;
}

export type MapOption = {
  blockStackCount: number;
  stackLengthMax: number;
  stackLengthMin: number;
  maxScore: number;
  colorCount: number;
  shuffleCount?: number;
}

const generateMap = (mapOption: MapOption) => {
  const {blockStackCount, stackLengthMax, stackLengthMin, maxScore, colorCount, shuffleCount} = mapOption;
  const blockStackShell = generateBlockStackShell(blockStackCount, stackLengthMax, stackLengthMin);

  if (blockStackCount - 1 < maxScore) {
    throw new Error('INVALID INPUT')
  }
  
  if (maxScore < colorCount) {
    throw new Error('colorCount should be smaller than maxScore')
  }

  const seed = generateSeed(blockStackShell, maxScore, colorCount);
  const answer = seed.map((blockStack) => {
    const space = Array(blockStack.limit - blockStack.stack.length).fill(-1);
    return blockStack.stack.slice(0).concat(space);
  });

  const shuffled = shuffleStacks(seed, shuffleCount || 1000);
  const question = shuffled.map((blockStack) => {
    const mappedStack = blockStack.stack;
    const space = Array(blockStack.limit - blockStack.stack.length).fill(-1);
    return mappedStack.concat(space);
  });

  const map = {question, answer};
  return map
}

export default generateMap;
