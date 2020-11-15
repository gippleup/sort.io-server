import generateMap from "../../../algo/generateMap";

function generateMultiMap(difficulty: 1 | 2 | 3 | 4 | 5) {
  let blockStackCount, colorCount, maxScore;
  switch(difficulty) {
    case 1: {
      blockStackCount = 6;
      colorCount = 4;
      maxScore = 5;
      break;
    }
    case 2: {
      blockStackCount = 8;
      colorCount = 7;
      maxScore = 7;
      break;
    }
    case 3: {
      blockStackCount = 12;
      colorCount = 8;
      maxScore = 11;
      break;
    }
    case 4: {
      blockStackCount = 16;
      colorCount = 15;
      maxScore = 15;
      break;
    }
    case 5: {
      blockStackCount = 21;
      colorCount = 17;
      maxScore = 20;
      break;
    }
    default: {
      blockStackCount = 6;
      colorCount = 4;
      maxScore = 5;
    }
  }

  const option = {
    blockStackCount,
    colorCount,
    maxScore,
    stackLengthMax: 7,
    stackLengthMin: 5,
    shuffleCount: 100,
  }

  const { question } = generateMap(option)

  return {
    desc: {...option, difficulty},
    question,
  }
}

export default generateMultiMap;