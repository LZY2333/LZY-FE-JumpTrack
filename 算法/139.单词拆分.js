/*
 * @lc app=leetcode.cn id=139 lang=javascript
 *
 * [139] 单词拆分
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
    const dp = Array(s.length + 1).fill(false);
    // 裁剪剩下的 s = '' 必然true
    dp[0] = true;
    // 针对每个容量，用物体一个个匹配
    for (let j = 1; j <= s.length; j++) {
        for (let i = 0; i < wordDict.length; i++) {
            const l = wordDict[i].length;
            if (j < l) continue;
            // 前面有匹配上 || 当前匹配上
            dp[j] = dp[j] || (wordDict[i] === s.slice(j - l, j) && dp[j - l]);
            // console.log(j, wordDict[i], s.slice(j - l, j), dp);
        }
    }
    return dp[s.length];
};
// console.log(wordBreak('leetcode', ['leet', 'code']));
// @lc code=end
