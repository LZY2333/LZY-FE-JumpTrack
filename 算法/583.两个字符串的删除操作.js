/*
 * @lc app=leetcode.cn id=583 lang=javascript
 *
 * [583] 两个字符串的删除操作
 */

// @lc code=start
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {
    // 相同子序列长度
    const [m,n] = [word1.length,word2.length]
    const dp = Array(m+1).fill(0).map(() => Array(n+1).fill(0))
    for(let i = 0; i < m+1; i++) dp[i][0] = 1
    for(let j = 0; i < n+1; j++) dp[0][j] = 1
    for(let i = 1; i < m; i++) {
        for(let j = 1; j < n; j++) {
            if(word1[i-1] === word2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = 
            }
        }
    }
};
// @lc code=end

