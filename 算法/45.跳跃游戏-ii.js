/*
 * @lc app=leetcode.cn id=45 lang=javascript
 *
 * [45] 跳跃游戏 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var jump = function(nums) {
    let result = 0;
    let curDistance = 0;
    let nextDistance = 0;

    for(let i = 0; i < nums.length - 1; i++) {
        nextDistance = Math.max(nextDistance, i + nums[i])
        if(i === curDistance) {
            curDistance = nextDistance
            result++
        }
    }
    return result
};
// 2
console.log(jump([2,3,1,1,4]));
// @lc code=end

