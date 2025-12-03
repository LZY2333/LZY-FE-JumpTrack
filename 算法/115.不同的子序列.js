/*
 * @lc app=leetcode.cn id=115 lang=javascript
 *
 * [115] 不同的子序列
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} t
 * @return {number}
 */

var numDistinct = function (s, t) {
    // dp[i][j]        s[i]中出现了多少次t[j]
    // dp[i - 1][j]    不用当前字符s[i]
    // dp[i - 1][j - 1]用当前字符
    const [m,n] = [s.length,t.length]
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

    // s中找 t长度为0，初始化为1
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]
            } else {
                dp[i][j] = dp[i - 1][j]
            }
        }
    }
    return dp[m][n]
};
console.log(numDistinct('rabbbit', 'rabbit'));
// @lc code=end

