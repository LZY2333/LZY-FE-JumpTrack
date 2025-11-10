/*
 * @lc app=leetcode.cn id=416 lang=javascript
 *
 * [416] 分割等和子集
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {boolean}
 */
// 本质是 集合里能否出现总和为 sum / 2 的子集
var canPartition = function(nums) {
    // 本质是能否把sum/2的背包装满
    const sum = nums.reduce((pre, cur) => pre + cur, 0)
    if(sum % 2 === 1) return 0
    const capacity = sum / 2
    // dp[i]: 当前容量能否被放满
    const dp = Array(capacity+1).fill(0)
    // 减的剩下0空间了，自然为true
    dp[0] = 1
    for(let i = 0; i < nums.length; i++) {
        // 到当前j 的时候，前面的j还要用，所以倒序
        for(let j = capacity; j >= nums[i] ; j-- ) {
            // 不放 || 放
            dp[j] = dp[j] || dp[j-nums[i]]
        }
        console.log(i,nums[i],dp);
    }

    return !!dp[capacity]
};
// true
console.log(canPartition([1,5,11,5]));
// @lc code=end