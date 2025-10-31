/*
 * @lc app=leetcode.cn id=78 lang=javascript
 *
 * [78] 子集
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function(nums) {
    const path = [], result = [];
    const backTracking = (start) => {
        result.push([...path])
        for(let i = start; i < nums.length; i++ ) {
            path.push(nums[i])
            backTracking(i+1)
            path.pop()
        }
    }
    backTracking(0)
    return result
};
// [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
console.log(subsets([1,2,3]));
// @lc code=end

