const defaultOrderCb = (left: any, right: any) => {
  if (left < right) {
    return true;
  } else {
    return false;
  }
}

function mergeSort(unsortedArray: any[], orderCb: typeof defaultOrderCb): any[] {
  if (unsortedArray.length <= 1) {
    return unsortedArray;
  }

  const middle = Math.floor(unsortedArray.length / 2);

  const left = unsortedArray.slice(0, middle);
  const right = unsortedArray.slice(middle);

  return merge(
    mergeSort(left, orderCb), mergeSort(right, orderCb), orderCb
  );
}

function merge(
  left: any[],
  right: any[],
  orderCb = defaultOrderCb
) {
  let resultArray = [], leftIndex = 0, rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (orderCb(left[leftIndex], right[rightIndex])) {
      resultArray.push(left[leftIndex]);
      leftIndex++;
    } else {
      resultArray.push(right[rightIndex]);
      rightIndex++;
    }
  }

  return resultArray
    .concat(left.slice(leftIndex))
    .concat(right.slice(rightIndex));
}

export default mergeSort;