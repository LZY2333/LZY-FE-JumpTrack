/*
 * @lc app=leetcode.cn id=977 lang=javascript
 *
 * [977] 有序数组的平方
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortedSquares = function (nums) {
    // 要意识到最大的数在两端
    const result = []
    let l = 0, r = nums.length - 1
    while (l <= r) {
        // Math.sqrt 平方根, Math.pow x次方
        const vl = nums[l] * nums[l];
        const vr = nums[r] * nums[r];
        if (vl > vr) {
            result.unshift(vl);
            l++;
        } else {
            result.unshift(vr);
            r--;
        }
    }
    return result
};
// console.log(sortedSquares([-7, -3, 2, 3, 11]));
// @lc code=end

