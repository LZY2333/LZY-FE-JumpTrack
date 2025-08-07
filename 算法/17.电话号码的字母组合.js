/*
 * @lc app=leetcode.cn id=17 lang=javascript
 *
 * [17] 电话号码的字母组合
 */

// @lc code=start
/**
 * @param {string} digits
 * @return {string[]}
 */
var letterCombinations = function(digits) {
    if (!digits) return []
    const map = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
    const path = []
    const result = []

    const backtracking = (index) => {
        if(path.length === digits.length) {
            result.push(path.join(''))
            return
        }

        const chars = map[digits[index]]
        for(let i = 0; i < chars.length; i++) {
            path.push(chars[i])
            backtracking(index + 1)
            path.pop()
        }
    }

    backtracking(0)
    return result
};

console.log(letterCombinations('23'));
// @lc code=end

