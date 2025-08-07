/*
 * @lc app=leetcode.cn id=39 lang=javascript
 *
 * [39] 组合总和
 */

// @lc code=start
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function (candidates, target) {
    const path = [];
    let sum = 0;
    const result = [];

    const backtracking = (start) => {
        if (sum === target) {
            result.push(path.slice());
            return;
        }

        for (
            let i = start;
            sum + candidates[i] <= target;
            i++
        ) {
            path.push(candidates[i]);
            sum += candidates[i];
            backtracking(i);
            sum -= candidates[i];
            path.pop();
        }
    };

    // sort((a, b) => a - b) 才是从小到大排序，不然超过一位的数会出错
    // 这里排序进行剪枝
    candidates.sort().sort((a, b) => a - b);
    backtracking(0);
    return result;
};
console.log(combinationSum([2, 3, 5], 8));
// [ [ 2, 2, 2, 2 ], [ 2, 3, 3 ], [ 3, 5 ] ]
// @lc code=end
