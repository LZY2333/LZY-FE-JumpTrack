/*
 * @lc app=leetcode.cn id=392 lang=javascript
 *
 * [392] 判断子序列
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isSubsequence = function (s, t) {
    const [m, n] = [s.length, t.length];
    const dp = Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
        let pre = dp[0]; // 对应 dp[i-1][j-1]
        for(let j = 1; j <= n; j++) {
            const tmp = dp[j];
            dp[j] = s[i - 1] === t[j - 1]
                ? pre + 1
                : dp[j - 1];
            pre = tmp
        }
    }
    return dp[n] === m;
};
// console.log(isSubsequence('abc', 'ahbgdc'));

// @lc code=end




