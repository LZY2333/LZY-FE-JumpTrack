/*
 * @lc app=leetcode.cn id=26 lang=javascript
 *
 * [26] 删除有序数组中的重复项
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    let cur = 1, l = nums.length;
    for(let i = 1; i < l; i++) {
        if(nums[i] === nums[i-1]) {
            continue;
        }
        nums[cur] = nums[i]
    }
};
// @lc code=end

