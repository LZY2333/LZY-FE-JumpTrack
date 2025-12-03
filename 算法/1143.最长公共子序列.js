/*
 * @lc app=leetcode.cn id=1143 lang=javascript
 *
 * [1143] 最长公共子序列
 */

// @lc code=start
/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
var longestCommonSubsequence = function (text1, text2) {
    // dp[i][j] text1中的前i 和 text2中的前j 的公共子序列最长长度
    const [m, n] = [text1.length, text2.length];
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // dp[i - 1][j - 1]:除这两个外的最长长度 + 1:这两个相等
            // 如果不相等, i-1: 丢掉当前i, j-1: 丢掉当前j
            dp[i][j] = text1[i - 1] === text2[j - 1]
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
};
// @lc code=end
