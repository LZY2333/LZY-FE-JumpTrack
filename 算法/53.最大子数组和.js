/*
 * @lc app=leetcode.cn id=53 lang=javascript
 *
 * [53] 最大子数组和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let result = Number.NEGATIVE_INFINITY;
    let sum = 0;
    for(let i = 0; i < nums.length; i++) {
        sum += nums[i]
        if(sum > result) result = sum
        if(sum < 0) sum = 0
    }
    return result
};
// 6
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));
// @lc code=end

