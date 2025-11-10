/*
 * @lc app=leetcode.cn id=674 lang=javascript
 *
 * [674] 最长连续递增序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var findLengthOfLCIS = function (nums) {
    const dp = Array(nums.length).fill(1);
    let result = 1;
    for (let i = 1; i < nums.length; i++) {
        dp[i] = nums[i] > nums[i - 1] ? dp[i - 1] + 1 : 1;
        result = Math.max(result, dp[i]);
    }
    return result;
};
// @lc code=end
