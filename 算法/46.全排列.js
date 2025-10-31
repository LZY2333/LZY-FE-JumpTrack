/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const path = [], result = [];
    const used = {}

    const backTracking = () => {
        if(path.length === nums.length) {
            result.push([...path])
        }
        for (const cur of nums) {
            if(used[cur]) continue;
            path.push(cur)
            used[cur] = true
            backTracking()
            used[cur] = false
            path.pop()
        }
    }
    backTracking()
    return result
};

console.log(permute([1,2,3]))
// @lc code=end

