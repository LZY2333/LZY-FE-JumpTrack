/*
 * @lc app=leetcode.cn id=844 lang=javascript
 *
 * [844] 比较含退格的字符串
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var backspaceCompare = function (S, T) {
    // 不用reverse字符串，而是从length处往前遍历，一直--
    let i = S.length - 1,
        j = T.length - 1,
        skipS = 0,
        skipT = 0;
    while (i >= 0 || j >= 0) {
        while (i >= 0) {
            // 处理连续## 或者连续间断#，例如 ab## c#d#
            if (S[i] === '#') {
                skipS++;
                i--;
            } else if (skipS > 0) {
                skipS--;
                i--;
            } else break;
        }
        while (j >= 0) {
            if (T[j] === '#') {
                skipT++;
                j--;
            } else if (skipT > 0) {
                skipT--;
                j--;
            } else break;
        }
        // 只有检测到不同的时候返回false,其他都是true
        if (S[i] !== T[j]) return false;
        i--;
        j--;
    }
    return true;
};

// console.log(backspaceCompare("ab##", "c#d#"))
// console.log(backspaceCompare("ab#c", "ad#c"))




// @lc code=end
