/*
 * @lc app=leetcode.cn id=77 lang=javascript
 *
 * [77] 组合
 */

// @lc code=start
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function (n, k) {
    const path = [];
    const result = [];
    const backTracking = (start) => {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        // 剪枝,后续数量不够K的没必要遍历
        for (
            let i = start;
            i <= n - (k - path.length) + 1;
            i++
        ) {
            path.push(i);
            backTracking(i + 1);
            path.pop();
        }
    };

    // 别忘了调用
    backTracking(1);
    return result;
};
console.log(combine(4, 2));
// @lc code=end
