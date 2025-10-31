/*
 * @lc app=leetcode.cn id=51 lang=javascript
 *
 * [51] N 皇后
 */

// @lc code=start
/**
 * @param {number} n
 * @return {string[][]}
 */

var solveNQueens = function (n) {
    const map = new Array(n).fill(-1);
    const result = [];
    const resolveRow = (curRow) => {
        if (curRow === n) {
            printMap();
            return;
        }
        for (let column = 0; column < n; column++) {
            if (!check(curRow, column)) continue;
            map[curRow] = column;
            resolveRow(curRow + 1);
        }
    };
    const check = (row, column) => {
        let left = (right = column);
        for (let i = row - 1; i >= 0; i--) {
            if (
                map[i] === column ||
                map[i] === --left ||
                map[i] === ++right
            ) {
                return false;
            }
        }
        return true;
    };
    const printMap = () => {
        const board = [];
        map.forEach((item) => {
            const tempRow = new Array(n).fill('.');
            tempRow[item] = 'Q';
            board.push(tempRow.join(''));
        });
        result.push(board);
    };
    resolveRow(0);
    return result;
};

console.log(solveNQueens(4));
// @lc code=end
