/*
 * @lc app=leetcode.cn id=309 lang=javascript
 *
 * [309] 买卖股票的最佳时机含冷冻期
 */

// @lc code=start
/**
 * @param {number[]} prices
 * @return {number}
 */
// 每天的状态有 可买入 
var maxProfit = function (prices) {
    const l = prices.length
    const dp = new Array(l).fill(0).map(() => new Array(4).fill(0))
    dp[0][0] = -prices[0] // 持有
    // 0持有 = 前一天是， 持有 或 当天买入(保持不持有) 或 当天买入(冷静期)
    // 1保持不持有(可随时买入) = 前一天是， 保持不持有 或 冷静期
    // 2当天卖出(触发冷静期) = 前一天是， 持有
    // 3冷静期(无法买入) = 前一天是， 当天卖出
    // 23用于精确跟踪 `卖出` 和 `冷静期`
    // 合并13, 无法区分是否可买入(冷静期)
    // 合并23, 无法暂停一天, 3依赖前一天2的数据, 以此实现暂停一天
    for (let i = 1; i < l; i++) {
        dp[i][0] = Math.max(dp[i - 1][0], Math.max(dp[i - 1][1], dp[i - 1][3]) - prices[i])
        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][3])
        dp[i][2] = dp[i - 1][0] + prices[i]
        dp[i][3] = dp[i - 1][2]
    }
    return Math.max(dp[l - 1][1], dp[l - 1][2], dp[l - 1][3])
};
// @lc code=end

