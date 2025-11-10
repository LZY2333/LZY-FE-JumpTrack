/*
 * @lc app=leetcode.cn id=279 lang=javascript
 *
 * [279] 完全平方数
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 */
var numSquares = function (n) {
    // dp[j] 和为j的[平方数]最少个数
    const dp = Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i * i <= n; i++) {
        for (let j = i * i; j <= n; j++) {
            // 不选 选
            dp[j] = Math.min(dp[j], dp[j - i * i] + 1);
        }
    }
    return dp[n]
};
// @lc code=end
