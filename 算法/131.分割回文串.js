/*
 * @lc app=leetcode.cn id=131 lang=javascript
 *
 * [131] 分割回文串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string[][]}
 */
var partition = function (s) {
    const path = [];
    const result = [];

    const backTracking = (start) => {
        if (start === s.length) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < s.length; i++) {
            if (!isOK(start, i)) continue;
            path.push(s.slice(start, i + 1));
            backTracking(i + 1);
            path.pop();
        }
    };

    const isOK = (start, end) => {
        for (let i = start, j = end; i < j; i++, j--)
            if (s[i] !== s[j]) return false;
        return true;
    };

    backTracking(0);
    return result;
};

console.log(partition('aab'));
// @lc code=end
