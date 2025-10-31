/*
 * @lc app=leetcode.cn id=40 lang=javascript
 *
 * [40] 组合总和 II
 */

// @lc code=start
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum2 = function (candidates, target) {
    const path = [];
    const result = [];
    let sum = 0;
    const backTracking = (start) => {
        if (sum === target) {
            result.push([...path]);
            return;
        }
        for (
            let i = start;
            i < candidates.length &&
            candidates[i] + sum <= target;
            i++
        ) {
            sum += candidates[i];
            path.push(candidates[i]);
            backTracking(i + 1);
            sum -= candidates[i];
            path.pop();
        }
    };
    candidates.sort((a, b) => a - b);
    backTracking(0);
    return result;
};

console.log(combinationSum2([10, 1, 2, 7, 6, 1, 5], 8));
// [ [ 1, 1, 6 ], [ 1, 2, 5 ], [ 1, 7 ], [ 2, 6 ] ]

// @lc code=end
