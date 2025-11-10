/*
 * @lc app=leetcode.cn id=213 lang=javascript
 *
 * [213] 打家劫舍 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
    if(nums.length === 1) return nums[0]
    const robRange = (s,e) => {
        const dp = Array(nums.length).fill(0)
        dp[s] = nums[s]
        dp[s+1] = Math.max(nums[s],nums[s+1]) 
        for(let i = s+2; i <= e; i++) {
            dp[i] = Math.max(dp[i-1], nums[i]+dp[i-2])
        }
        return dp[e]
    }
    const start = robRange(0, nums.length-2)
    const end = robRange(1, nums.length-1)
    return Math.max(start, end)
};
console.log(rob([1,2,3,1]));
// @lc code=end

