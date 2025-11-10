/*
 * @lc app=leetcode.cn id=343 lang=javascript
 *
 * [343] 整数拆分
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 */
var integerBreak = function (n) {
    // 递归问题: f(n) = max(1 * f(n - 1), 2 * f(n - 2), ..., (n - 1) * f(1))。
    // 拆分 i 能得到的最大乘积，i 从 0 到 n
    const dp = Array(n + 1).fill(0);
    dp[2] = 1;
    for (let i = 3; i <= n; i++) {
        // 这里是j<= i/2, 不是<, 不是n/2
        for (let j = 1; j <= i / 2; j++) {
            // j * (i - j)不继续拆右边，j * dp[i - j]继续拆右边
            dp[i] = Math.max( dp[i], j * [i - j], j * dp[i - j] );
        }
    }
    return dp[n]
};
console.log(integerBreak(4));
// @lc code=end
