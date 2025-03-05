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
    let cur = 0, l = nums.length;
    for(let i = 1; i < l; i++) {
        if(nums[cur] === nums[i]) {
            continue;
        }
        nums[++cur] = nums[i]
    }
    // 题目要求返回长度，这个长度是cur+1，不是nums.length
    return cur + 1
};
// console.log(removeDuplicates([1,1,2]))
// @lc code=end

