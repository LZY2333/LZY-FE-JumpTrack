/*
 * @lc app=leetcode.cn id=1035 lang=javascript
 *
 * [1035] 不相交的线
 */

// @lc code=start
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var maxUncrossedLines = function (nums1, nums2) {
    // dp[i][j] 前ij项能连最多的线
    const [m, n] = [nums1.length, nums2.length];
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // 相等时必然比去掉一个的情况更大
            dp[i][j] = nums1[i-1] === nums2[j-1]
                ? dp[i - 1][j - 1] + 1
                : Math.max( dp[i - 1][j], dp[i][j - 1])
        }
        // console.log(i,nums1[i-1],dp[i]);
    }
    return dp[m][n]
};
// 3
// console.log(maxUncrossedLines([2,5,1,2,5],[10,5,2,1,5,2]));
// @lc code=end
