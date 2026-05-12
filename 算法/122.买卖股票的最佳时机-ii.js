/*
 * @lc app=leetcode.cn id=122 lang=javascript
 *
 * [122] 买卖股票的最佳时机 II
 */

// @lc code=start
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    const l = prices.length;
    const dp = Array(l).fill(0).map(() => [0,0]);
    dp[0][0] = -prices[0]
    for(let i = 1; i < l; i++) {
        // 持有: 前一天持有 前一天不持有
        dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] - prices[i])
        // 不持有: 前一天不持有 前一天持有
        dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] + prices[i])
    }
    return dp[l-1][1]
};
// @lc code=end

