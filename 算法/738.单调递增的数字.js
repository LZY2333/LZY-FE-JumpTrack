/*
 * @lc app=leetcode.cn id=738 lang=javascript
 *
 * [738] 单调递增的数字
 */

// @lc code=start
/**
 * @param {number} n
 * @return {number}
 */
var monotoneIncreasingDigits = function(n) {
    let result = `${n}`.split('')
    const l = result.length;
    let flag = l
    for(let i = l - 1; i > 0; i--) {
        if(result[i-1] > result[i]) {
            flag = i
            result[i-1]-- 
        }
    }
    for(let i = flag; i < l; i++) result[i] = 9
    return +result.join('')
};
console.log(monotoneIncreasingDigits(53321));
// 只要发现 n[i-1] > n[i], n[i-1]退一位, i到末尾全变9
// 如果左往右遍历, 当 n[i-1] === n[i] > n[i+1] 会出错
// 332, 从前往后轮 得到错误答案 329(正确答案299)
// 53321
// 53319
// 53299
// 52999
// 49999
// @lc code=end

