/*
 * @lc app=leetcode.cn id=435 lang=javascript
 *
 * [435] 无重叠区间
 */

// @lc code=start
/**
 * @param {number[][]} intervals
 * @return {number}
 */
var eraseOverlapIntervals = function(intervals) {
    intervals.sort((a,b) => a[1] - b[1]);
    let count = 0;
    let pre = -Infinity;

    for (const [start, end] of intervals) {
        if (pre <= start) {
            count++;
            pre = end;
        }
    }
    return intervals.length - count;
};
// @lc code=end

