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
var maxProfit = function (prices) {
    let noDo = 0
    let toDo = -prices[0]
    for(let i = 1; i < prices.length; i++) {
        noDo = Math.max(noDo, toDo + prices[i])
        toDo = Math.max(toDo, noDo - prices[i])
    }
    return noDo
};
// @lc code=end

