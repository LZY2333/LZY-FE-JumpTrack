/*
 * @lc app=leetcode.cn id=63 lang=javascript
 *
 * [63] 不同路径 II
 */

// @lc code=start
/**
 * @param {number[][]} obstacleGrid
 * @return {number}
 */
var uniquePathsWithObstacles = function (obstacleGrid) {
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;
    const dp = Array(n).fill(0);
    dp[0] = 1;
    // 要从 i=0 j=0开始完成初始化, 一样能做到石头开始全为0
    for (let i = 0; i < m; i++) {
        // 如果石头在j0列，则j0列后续会一直是0
        if (obstacleGrid[i][0]) dp[0] = 0;
        for (let j = 1; j < n; j++) {
            // 这里不能continue，因为一维这里会有数，要清0
            if (obstacleGrid[i][j]) dp[j] = 0;
            else dp[j] = dp[j] + dp[j - 1];
        }
    }
    return dp[n - 1];
};
// 2
console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]));
// @lc code=end
