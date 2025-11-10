/*
 * @lc app=leetcode.cn id=746 lang=javascript
 *
 * [746] 使用最小花费爬楼梯
 */

// @lc code=start
/**
 * @param {number[]} cost
 * @return {number}
 */
var uniquePaths = function(m, n) {
    const dp = new Array(n+1).fill(1)
    // 从下标11 到 37
    for(let i = 2; i <= m; i++) {
        for(let j = 2; j <= n; j++) {
            dp[j] = dp[j] + dp[j-1]
        }
    }
    return dp[n]
};
// @lc code=end

