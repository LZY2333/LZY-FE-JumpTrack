/*
 * @lc app=leetcode.cn id=56 lang=javascript
 *
 * [56] 合并区间
 */

// @lc code=start
/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    intervals.sort((p, q) => p[0] - q[0]);
    const result = [];
    for (const range of intervals) {
        const l = result.length;
        if (l && result[l - 1][1] >= range[0]) {
            result[l - 1][1] = Math.max(result[l - 1][1], range[1]);
        } else {
            result.push(range);
        }
    }
    return result;
};

// 452「射最少箭」、435「保留最多不重叠区间」
// 贪婪: 希望尽早结束，给后续留更多空间 => i[end]升序
// 56「合并区间」
// 贪婪: 希望尽早吞并，保证连续 => i[start]升序

// 如果这里还 i[end]升序 正序遍历, [[1,2],[4,5],[1,6]] 就会出问题
// 实际上 i[end]升序 倒序遍历 确实也能做这题
// @lc code=end

