/*
 * @lc app=leetcode.cn id=491 lang=javascript
 *
 * [491] 非递减子序列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var findSubsequences = function (nums) {
    const path = [],
        result = [];
    const backTracking = (start) => {
        if (path.length > 1) {
            result.push([...path]);
        }
        const used = {};
        for (let i = start; i < nums.length; i++) {
            if (
                (path.length > 0 &&
                    nums[i] < path[path.length - 1]) ||
                used[nums[i]]
            )
                continue;
            used[nums[i]] = true;
            path.push(nums[i]);
            backTracking(i + 1);
            path.pop();
        }
    };
    backTracking(0);
    return result;
};

console.log(findSubsequences([4, 6, 7, 7]));
// @lc code=end
