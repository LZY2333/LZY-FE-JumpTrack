/*
 * @lc app=leetcode.cn id=494 lang=javascript
 *
 * [494] 目标和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var findTargetSumWays = function (nums, target) {
    // 本质是 将数组分成两个集合，其中一个集合比另一个集合多 target
    // 转换成数学就是, 要装满下面的 大集合capacity 有多少种方法
    // 小集合 = sum - capacity ;  capacity - 小集合 = target;
    // 大集合capacity = (sum + target) / 2
    const sum = nums.reduce((pre, cur) => pre + cur, 0);
    if (Math.abs(target) > sum) return 0
    if ((target + sum) % 2 === 1) return 0;
    
    const capacity = (sum + target) / 2;
    const dp = Array(capacity + 1).fill(0);
    dp[0] = 1;
    for (let i = 0; i < nums.length; i++) {
        for (let j = capacity; j >= nums[i]; j--) {
            // 不加入 + 加入
            dp[j] = dp[j] + dp[j - nums[i]];
        }
        // console.log(i, nums[i], dp);
    }
    return dp[capacity];
};
// 0 1 [ 1, 1, 0, 0, 0 ]
// 1 1 [ 1, 2, 1, 0, 0 ]
// 2 1 [ 1, 3, 3, 1, 0 ]
// 3 1 [ 1, 4, 6, 4, 1 ]
// 4 1 [ 1, 5, 10, 10, 5 ]
// console.log(findTargetSumWays([1, 1, 1, 1, 1], 3));
// @lc code=end
