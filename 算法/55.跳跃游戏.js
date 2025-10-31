/*
 * @lc app=leetcode.cn id=55 lang=javascript
 *
 * [55] 跳跃游戏
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function(nums) {
    let end = nums.length - 1
    for(let i = end - 1; i >= 0; i--) {
        if(nums[i] >= end - i) end = i
    }
    return end === 0
};
// @lc code=end

