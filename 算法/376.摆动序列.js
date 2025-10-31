/*
 * @lc app=leetcode.cn id=376 lang=javascript
 *
 * [376] 摆动序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var wiggleMaxLength = function (nums) {
    let up = 1, down = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i - 1] < nums[i]) {
            up = down + 1;
        } else if (nums[i - 1] > nums[i]) {
            down = up + 1;
        }
    }
    return Math.max(up, down);
};
// @lc code=end
