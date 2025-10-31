/*
 * @lc app=leetcode.cn id=1005 lang=javascript
 *
 * [1005] K 次取反后最大化的数组和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var largestSumAfterKNegations = function (nums, k) {
    nums.sort((a, b) => a - b);
    let sum = 0;
    let min = Number.POSITIVE_INFINITY;
    for (let num of nums) {
        if (k > 0 && num < 0) {
            num = -num;
            k--;
        }
        sum += num;
        min = Math.min(min, num);
    }
    return sum - (k % 2 === 1 ? min * 2 : 0);
};
// 11
console.log(largestSumAfterKNegations([-2, 5, 0, 2, -2], 3));
// @lc code=end
