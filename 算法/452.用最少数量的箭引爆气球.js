/*
 * @lc app=leetcode.cn id=452 lang=javascript
 *
 * [452] 用最少数量的箭引爆气球
 */

// @lc code=start
/**
 * @param {number[][]} points
 * @return {number}
 */
var findMinArrowShots = function (points) {
    points.sort((a, b) => a[1] - b[1]);
    let result = 0;
    let pre = -Infinity;

    for (const [start, end] of points) {
        if (pre < start) {
            result++;
            pre = end;
        }
    }
    return result;
};

// @lc code=end
