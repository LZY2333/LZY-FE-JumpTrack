/*
 * @lc app=leetcode.cn id=198 lang=javascript
 *
 * [198] 打家劫舍
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    // dp[i] 前i项 偷与不偷 能获取的钱的大值
    // dp[0] 只有1个房屋自然 = nums[0], dp[1] 自然是max两个房屋
    const dp = [nums[0], Math.max(nums[0], nums[1])];
    for (let i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
    }
    return dp[nums.length - 1];
};
// 12
// console.log(rob([2,7,9,3,1]));
// @lc code=end
