/*
 * @lc app=leetcode.cn id=1049 lang=javascript
 *
 * [1049] 最后一块石头的重量 II
 */

// @lc code=start
/**
 * @param {number[]} stones
 * @return {number}
 */
var lastStoneWeightII = function (stones) {
    // 这题本质是找到尽可能接近 sum/2 的组，也即 背包的 value/容量 最大 为 sum/2。
    // dp[j]: 前j项最大价值为dp[j]
    // 总容量j 减去当前j的容量，剩余的容量的价值， 加上当前j的价值；与上一次ap[j]比出最大值
    const sum = stones.reduce((pre, cur) => pre + cur, 0);
    const capacity = Math.floor(sum / 2);
    const m = stones.length;
    const n = capacity;
    // 无物品 dp[0][*] = 0; 无容量 dp[*][0] = 0
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    // 因为会有 i-1,所以上面多造了一行0
    for (let i = 1; i <= m; i++) {
        const w = stones[i - 1];
        for (let j = 0; j <= capacity; j++) {
            // 如果 物品i的重量w > 容量j, 说明放不下, 直接继承(一维写法可直接跳过，自动就继承了)
            if (w > j) dp[i][j] = dp[i - 1][j];
            // 不放: dp[i-1][j]; 放: w + dp[i-1][j-w](意为 i放进去 + 放满剩下的重量)
            else dp[i][j] = Math.max(dp[i - 1][j], w + dp[i - 1][j - w]);
        }
        // console.log(i,w,dp[i]);
    }
    return Math.abs(dp[m][n] * 2 - sum);
};
// 1 2 [ 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ]
// 2 7 [ 0, 0, 2, 2, 2, 2, 2, 7, 7, 9, 9, 9 ]
// 3 4 [ 0, 0, 2, 2, 4, 4, 6, 7, 7, 9, 9, 11 ]
// 4 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 5 8 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 6 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 1
console.log(lastStoneWeightII([2, 7, 4, 1, 8, 1]));
// @lc code=end
