/*
 * @lc app=leetcode.cn id=474 lang=javascript
 *
 * [474] 一和零
 */

// @lc code=start
/**
 * @param {string[]} strs
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var findMaxForm = function (strings, m, n) {
    // 【两个维度的容量】 的计算过程需要记录
    // dp[m][n] 满足m n的最大子集长度，初始为0
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (const str of strings) {
        let zero = (one = 0);
        for (let c of str) {
            if (c === '0') zero++;
            else one++;
        }
        // 倒序: 这题本质是以前的一维滚动数组，要复上一轮str数据，每轮刷整个二维数组
        for (let i = m; i >= zero; i--) {
            for (let j = n; j >= one; j--) {
                // 不放 放
                dp[i][j] = Math.max( dp[i][j], dp[i - zero][j - one] + 1 );
            }
        }
    }
    return dp[m][n]
};
// @lc code=end
