/*
 * @lc app=leetcode.cn id=406 lang=javascript
 *
 * [406] 根据身高重建队列
 */

// @lc code=start
/**
 * @param {number[][]} people
 * @return {number[][]}
 */
var reconstructQueue = function (people) {
    people.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const queue = [];
    for (let i = 0; i < people.length; i++) {
        queue.splice(people[i][1], 0, people[i]);
    }
    return queue;
};

// __两个维度先确定一个维度,排序确定入栈顺序__
// 一个是 身高无明显提示 一个是 要求前面比自己高的人数
// 一定是高的人在前面，先根据h从高到低排
// __贪心:排序时，大h放左边，同h，小k放左边__
// 排序完成后，对i来说，左侧调换序 都不影响 后续i的座序
// 相较左侧，i是小h，往前插也不会影响左侧已经排好的限制k
// 如果同h, 小k在大k 的后续压入queue,则必被在大k左边，导致大k数k超额
// @lc code=end
