/*
 * @lc app=leetcode.cn id=123 lang=javascript
 *
 * [123] 买卖股票的最佳时机 III
 */

// @lc code=start
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    const l = prices.length;
    const dp = Array(l).fill(0).map(() => [0,0,0,0]);
    // 第一次持有
    dp[0][0] = -prices[0]; 
    // 第二次持有(第一次当天买当天卖,再第二次持有)
    dp[0][2] = -prices[0];  

    for (let i = 1; i < l; i++) {
        // 第一次持有
        dp[i][0] = Math.max(dp[i-1][0], -prices[i]);
        // 第一次不持有
        dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] + prices[i]);
        // 第二次持有（依赖第一次不持有）
        dp[i][2] = Math.max(dp[i-1][2], dp[i-1][1] - prices[i]);
        // 第二次不持有（依赖第二次买入）
        dp[i][3] = Math.max(dp[i-1][3], dp[i-1][2] + prices[i]);
    }

    return dp[l-1][3];
};
// dp[0][2] 不能初始化为0 
// 不然第一轮循环 dp[i][2] = Math.max(0, dp[i-1][1] - prices[i])

// maxProfit([2,1,4,5,2,9,7])
// @lc code=end

