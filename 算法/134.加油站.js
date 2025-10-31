/*
 * @lc app=leetcode.cn id=134 lang=javascript
 *
 * [134] 加油站
 */

// @lc code=start
/**
 * @param {number[]} gas
 * @param {number[]} cost
 * @return {number}
 */
var canCompleteCircuit = function (gas, cost) {
    let start = 0; // 记录出发点
    let curGas = 0; // 当前油量
    let totalGain = 0; // 总油量差

    for (let i = 0; i < gas.length; i++) {
        const gain = gas[i] - cost[i];
        curGas += gain;
        totalGain += gain;

        // 如果当前油量小于 0，说明无法从 start 到 i+1
        if (curGas < 0) {
            start = i + 1; // 改变起点
            curGas = 0; // 重置油量
        }
    }

    return totalGain < 0 ? -1 : start;
};

// 代码含义: 最后一个 totalGain < 0 的路段的下一个坐标即为 start

// 首先 totalGain >= 0，说明总油量能走完，必然有答案

// 假设路段(0-i)totalGain变负，代表其无法走到下一站，
// 也代表 其缺少了前面的gain，即 段内无start
// 代码执行过程: 前期连续发现 totalGain为负 的路段，
// 但由于总 totalGain >= 0，最后一段必为start

// 另外，假设路段(0-i)totalGain一直为正，从未变负，则0就是 start
// 当然，这情况也可能是多解，但题目条件保证了单解，因此只能是0

// 最后，从某点出发后，任何中途的油量都不为负
// 这题其实就是找 最小前缀和的 下一个坐标
// @lc code=end
