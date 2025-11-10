/*
 * @lc app=leetcode.cn id=518 lang=javascript
 *
 * [518] 零钱兑换 II
 */

// @lc code=start
/**
 * @param {number} amount
 * @param {number[]} coins
 * @return {number}
 */
var change = function (amount, coins) {
    const dp = Array(amount + 1).fill(0)
    dp[0] = 1
    for (let j = 0; j <= amount; j++) { // 1.遍历背包容量
        for (let i = 0; i < coins.length; i++) { // 2.遍历物品
            if (j - coins[i] >= 0) dp[j] += dp[j - coins[i]];
        }
        console.log(j,dp)
    }
    return dp[amount]
};
console.log(change(5, [1,2,5]));
// @lc code=end
