/*
 * @lc app=leetcode.cn id=121 lang=javascript
 *
 * [121] 买卖股票的最佳时机
 */

// @lc code=start
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
    const l = prices.length;
    // 只能买卖一次，假设昨天是卖出的状态，那今天再买入就只有-prices[i],
    const dp = Array(l).fill(0).map(() => Array(2).fill(0));
    dp[0] = [0, -prices[0]];
    for (let i = 1; i < prices.length; i++) {
        // 今天不持有: 昨天不持有 今天卖出
        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] + prices[i]);
        // 今天持有: 昨天持有 今天买入
        dp[i][1] = Math.max(dp[i - 1][1], -prices[i]);
    }
    return dp[l - 1][0];
};
// [[0, -7], [0, -1], [4, -1], [4, -1], [5, -1], [5, -1]]
console.log(maxProfit([7, 1, 5, 3, 6, 4]));
// @lc code=end
