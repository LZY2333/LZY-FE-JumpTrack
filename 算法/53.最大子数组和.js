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
    const n = nums.length;
    const dp = new Array(n);
    dp[0] = nums[0];
    let result = nums[0];
    for (let i = 1; i < n; i++) {
        dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
        result = Math.max(result, dp[i]);
    }
    return result;
};

// 6
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
// @lc code=end
