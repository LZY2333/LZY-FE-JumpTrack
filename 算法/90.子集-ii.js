/*
 * @lc app=leetcode.cn id=90 lang=javascript
 *
 * [90] 子集 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsetsWithDup = function (nums) {
    const path = [], result = [];
    const backTracking = (start) => {
        result.push([...path]);
        for (let i = start; i < nums.length; i++) {
            if (i !== start && nums[i - 1] === nums[i])
                continue;
            path.push(nums[i]);
            backTracking(i + 1);
            path.pop();
        }
    };
    nums.sort((a, b) => a - b);
    backTracking(0);
    return result;
};
// [ [], [ 1 ], [ 1, 2 ], [ 1, 2, 2 ], [ 2 ], [ 2, 2 ] ]
console.log(subsetsWithDup([1, 2, 2]));
// @lc code=end
