/*
 * @lc app=leetcode.cn id=860 lang=javascript
 *
 * [860] 柠檬水找零
 */

// @lc code=start
/**
 * @param {number[]} bills
 * @return {boolean}
 */
var lemonadeChange = function (bills) {
    let rank1 = 0;
    let rank2 = 0;
    for (let i = 0; i < bills.length; i++) {
        if (bills[i] === 5) {
            rank1 += 1;
        }
        if (bills[i] === 10) {
            if (!rank1) return false;
            rank2 += 1;
            rank1 -= 1;
        }
        if (bills[i] === 20) {
            if (rank1 && rank2) {
                rank1 -= 1;
                rank2 -= 1;
            } else if (rank1 >= 3){
                rank1 -= 3;
            } else return false
        }
    }
    return true;
};
// @lc code=end
