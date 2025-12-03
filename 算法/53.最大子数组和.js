/*
 * @lc app=leetcode.cn id=53 lang=javascript
 *
 * [53] 最大子数组和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
const maxSubArray = (nums) => {
    let sum = 0, result = -Infinity;
    for (let i = 0; i < nums.length; i++) {
        sum = Math.max(sum + nums[i], nums[i]);
        result = Math.max(result, sum);
    }
    return result;
};

// 6
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
// @lc code=end
