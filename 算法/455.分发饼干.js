/*
 * @lc app=leetcode.cn id=455 lang=javascript
 *
 * [455] 分发饼干
 */

// @lc code=start
/**
 * @param {number[]} g
 * @param {number[]} s
 * @return {number}
 */
var findContentChildren = function (g, s) {
    let gp = 0, sp = 0;
    g.sort((a,b) => a - b)
    s.sort((a,b) => a - b)
    while(gp < g.length && sp < s.length) {
        if(g[gp] <= s[sp]) {
            gp++
        }
        sp++
    }
    return gp
};
// @lc code=end
