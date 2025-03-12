/*
 * @lc app=leetcode.cn id=209 lang=javascript
 *
 * [209] 长度最小的子数组
 */

// @lc code=start
/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function(target, nums) {
    let l = 0;
    let sum = 0;
    let result = Infinity;
    for(let r = 0; r < nums.length; r++) {
        sum += nums[r];
        while(sum >= target) {
            result = Math.min(result, r - l + 1)
            sum -= nums[l]
            l++;
        }
    }
    return result === Infinity ? 0 : result;
};
// console.log(minSubArrayLen(7, [2,3,1,2,4,3]));

// @lc code=end

