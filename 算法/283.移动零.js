/*
 * @lc app=leetcode.cn id=283 lang=javascript
 *
 * [283] 移动零
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function (nums) {
    let cur = i = 0;
    const l = nums.length;

    while (i < l) {
        if (nums[i] !== 0) {
            nums[cur++] = nums[i];
        }
        i++;
    }
    while (cur < l) {
        nums[cur++] = 0;
    }
    return nums;
};
// @lc code=end
