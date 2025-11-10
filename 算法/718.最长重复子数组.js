/*
 * @lc app=leetcode.cn id=718 lang=javascript
 *
 * [718] 最长重复子数组
 */

// @lc code=start
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findLength = function(nums1, nums2) {
    // dp[i][j] 表示 nums1 前 i 个元素和 nums2 前 j 个元素的公共的、长度最长的子数组的长度
    // 递推公式需要用到i-1，所以要初始化0位置，并从1位置开始
    const [m, n] = [nums1.length, nums2.length];
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    let res = 0;
    for (let i = 1; i <= m; i++) {
        // 每放入一个nums1[i],遍历nums2[j],找有没有跟自己相等的,有就是当前dp+1
        for (let j = 1; j <= n; j++) {
            if (nums1[i - 1] === nums2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            res = dp[i][j] > res ? dp[i][j] : res;
        }
    }
    return res;
};
// @lc code=endsdfsdfsdfsdfsdfsdfsdsdfsdssss
