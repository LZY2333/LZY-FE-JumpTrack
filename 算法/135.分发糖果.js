/*
 * @lc app=leetcode.cn id=135 lang=javascript
 *
 * [135] 分发糖果
 */

// @lc code=start
/**
 * @param {number[]} ratings
 * @return {number}
 */
var candy = function (ratings) {
    const l = ratings.length;
    const rank = new Array(l).fill(1);

    for (let i = 1; i < l; i++) {
        if (ratings[i] > ratings[i - 1])
            rank[i] = rank[i - 1] + 1;
    }
    for (let i = l - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1])
            rank[i] = Math.max(rank[i], rank[i + 1] + 1);
    }

    return rank.reduce((pre, cur) => pre + cur, 0);
};
// 两次遍历，每个item满足积累rank的 左规则或右规则时，取二者大值
// 比较左边时，必须 从左往右 遍历
// 因为最左边一个0号本身已是最终结果，rank是需要从最边开始累加的
// 比较右边时，必须 从右往左 遍历
// 此时则要比较两次rank 取大值
// @lc code=end
