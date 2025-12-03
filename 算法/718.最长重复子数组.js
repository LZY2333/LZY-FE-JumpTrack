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
const findLength = (nums1, nums2) => {
    const [m, n] = [nums1.length, nums2.length];
    const dp = Array(n + 1).fill(0)
    let res = 0;
    // 由于每次都只需要用到i-1层，可使用滚动数组
    // 由于需要用到前面的值，需要内层倒序
    for(let i = 1; i <= m; i++) {
        for(let j = n; j > 0; j--) {
            dp[j] = nums1[i-1] === nums2[j-1] ? dp[j-1]+1 : 0
            res = Math.max(res, dp[j])
        }
    }
    return res
};
// @lc code=end

