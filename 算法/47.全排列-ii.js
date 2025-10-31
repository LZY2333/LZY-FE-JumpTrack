/*
 * @lc app=leetcode.cn id=47 lang=javascript
 *
 * [47] 全排列 II
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function(nums) {
    const path = [], result = [], used = {};
    nums.sort((a, b) => a - b);

    const backTracking = () => {
        if(path.length === nums.length) {
            result.push([...path])
        }
        for (let i = 0;i < nums.length;i++) {
            // 深度优先遍历，
            // 遍历到 当前数 时，同层前一个数的递归一定是结束了，此时它的标记一定是false
            // 所以借 used[i - 1] === false 判断 上一个数同层
            // 同层 且 当前数 与 上一个数 相等(同层重复)，则跳过
            if (i > 0 && nums[i] === nums[i - 1] && used[i - 1] === false) continue
            // 如果当前数 用过(同枝重复)，或称 正在当前递归(path)中，跳过
            if(used[i]) continue;
            used[i] = true
            path.push(nums[i])
            backTracking()
            used[i] = false
            path.pop()
        }
    }
    
    backTracking()
    return result
};
// [ [ 1, 1, 3 ], [ 1, 3, 1 ], [ 3, 1, 1 ] ]
console.log(permuteUnique([1,1,3]))
// @lc code=end

