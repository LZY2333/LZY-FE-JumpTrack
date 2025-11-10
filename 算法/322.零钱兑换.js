/*
 * @lc app=leetcode.cn id=322 lang=javascript
 *
 * [322] 零钱兑换
 */

// @lc code=start
/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function (coins, amount) {
    // 背包容量amount，元素coins，最少元素满足amount
    // 这题内外循环都行
    const dp = Array(amount + 1).fill(Infinity);
    // `j-coins[i]=0`剩余容量0，要补的钱数也0
    dp[0] = 0;
    for (let i = 0; i < coins.length; i++) {
        for (let j = coins[i]; j <= amount; j++) {
            dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);
        }
        // console.log(i,coins[i],dp)
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
};
// 0 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 1 2 [ 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5,  6  ]
// 2 5 [ 0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2,  3  ]
// 3
// console.log(coinChange([1,2,5], 11));
// @lc code=end
