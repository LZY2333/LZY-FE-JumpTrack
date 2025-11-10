/*
 * @lc app=leetcode.cn id=188 lang=javascript
 *
 * [188] 买卖股票的最佳时机 IV
 */

// @lc code=start
/**
 * @param {number} k
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (k, prices) {
    // 题目要求 可以做k次买卖，同一时间只能做一笔
    // 但模拟中其实是同时在做，但如果有多笔，后续会计入前面的收益
    // 其实在每轮i中，后几次的买卖都会立刻在当轮计入前面的收益
    const l = prices.length;
    const status = 2 * k + 1;
    const arr = Array(status).fill(0);
    // 初始化所有买入
    for (let k = 1; k < status; k += 2) arr[k] = -prices[0];
    for (let i = 1; i < l; i++) {
        // 遍历推导状态: 奇数是买入 偶数是卖出
        // 从1开始, 0是用来便于推导的, 不参与状态
        for (let j = 1; j < status; j++) {
            const noOrDo = j % 2 === 1
                ? arr[j - 1] - prices[i] : arr[j - 1] + prices[i];
            arr[j] = Math.max(arr[j], noOrDo);
        }
    }
    return arr[status - 1];
};
// @lc code=end
