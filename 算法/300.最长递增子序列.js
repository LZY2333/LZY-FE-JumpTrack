/*
 * @lc app=leetcode.cn id=300 lang=javascript
 *
 * [300] 最长递增子序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
const lengthOfLIS = (nums) => {
    // dp[i] 以dp[i]结尾 的最长严格递增子序列长度
    // dp[i] = 前i-1中 满足尾数小于当前数 num[j] < num[i] 中的最大值+1
    // 初始化1,且i从1开始,因为dp[0]肯定是1,且后续数很小的话也会是1
    let dp = Array(nums.length).fill(1);
    let result = 1;
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        result = Math.max(result, dp[i]);
    }
    return result;
};
// [ 1, 2, 3, 4, 5, 3, 6, 4, 5 ]
lengthOfLIS([1, 3, 6, 7, 9, 4, 10, 5, 6])
// @lc code=end

