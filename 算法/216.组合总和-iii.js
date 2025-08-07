/*
 * @lc app=leetcode.cn id=216 lang=javascript
 *
 * [216] 组合总和 III
 */

// @lc code=start
/**
 * @param {number} k
 * @param {number} n
 * @return {number[][]}
 */
var combinationSum3 = function (k, n) {
    const path = [];
    let sum = 0;
    const result = [];

    const backtracking = (start) => {
        if (path.length === k) {
            if (sum === n) result.push(path.slice());
            return;
        }

        for (
            let i = start;
            i <= 9 - (k - path.length) + 1 && sum + i <= n;
            i++
        ) {
            path.push(i);
            sum += i;
            backtracking(i + 1);
            sum -= i;
            path.pop();
        }
    };

    backtracking(1);
    return result;
};

console.log(combinationSum3(3, 9));
// @lc code=end
