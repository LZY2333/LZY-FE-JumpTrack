/*
 * @lc app=leetcode.cn id=763 lang=javascript
 *
 * [763] 划分字母区间
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number[]}
 */
var partitionLabels = function (s) {
    const map = {};
    for (let i = 0; i < s.length; i++) map[s[i]] = i;
    const result = [];
    let left = 0;
    let right = 0;
    for (let i = 0; i < s.length; i++) {
        right = Math.max(right, map[s[i]]);
        if (i === right) {
            result.push(right - left + 1);
            left = right + 1;
        }
    }
    return result;
};
// [ 9, 7, 8 ]
console.log(partitionLabels('ababcbacadefegdehijhklij'));
// @lc code=end
