/*
 * @lc app=leetcode.cn id=377 lang=javascript
 *
 * [377] 组合总和 Ⅳ
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var combinationSum4 = function(nums, target) {
    // 容量为4，nums种找元素装满target
    // dp[i] 装满dp[i] 有几种方法, 区分顺序
    const dp = Array(target + 1).fill(0)
    // 初始化容量为0 有1种摆法(j-nums[i]=0物体恰好适配容量，应+1)
    dp[0] = 1
    for(let j = 1; j <= target; j++) {
        // 区分顺序，针对每个容量，遍历item
        for(let i = 0; i < nums.length; i++) {
            if(j < nums[i]) continue;
            dp[j] += dp[j - nums[i]]
        }
        // console.log(j,dp);
    }

    return dp[target]
};
// 1 [ 1, 1, 0, 0, 0 ]
// 2 [ 1, 1, 2, 0, 0 ]
// 3 [ 1, 1, 2, 4, 0 ]
// 4 [ 1, 1, 2, 4, 7 ]
// 7
console.log(combinationSum4([1,2,3],4));


// @lc code=end

