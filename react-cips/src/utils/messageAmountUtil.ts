/** 比较报文金额范围，保留完整十进制精度；非法金额返回 NaN */
export const compareMessageAmounts = (left: string, right: string): number => {
  const amountPattern = /^[+-]?\d+(?:\.\d+)?$/;
  if (!amountPattern.test(left) || !amountPattern.test(right)) return NaN;

  const [leftInteger, leftFraction = ''] = left.split('.');
  const [rightInteger, rightFraction = ''] = right.split('.');
  const scale = Math.max(leftFraction.length, rightFraction.length);
  const leftValue = BigInt(leftInteger + leftFraction.padEnd(scale, '0'));
  const rightValue = BigInt(rightInteger + rightFraction.padEnd(scale, '0'));
  if (leftValue === rightValue) return 0;
  return leftValue < rightValue ? -1 : 1;
};
