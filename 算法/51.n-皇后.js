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
    const map = new Array(n).fill(-1); // key表示row，value表示column
    const result = [];
    const solveRow = (row) => {
        // row是从0开始的,row === n棋盘已经是n+1行
        if (row === n) {
            printMap();
            return;
        }

        for (let column = 0; column < n; column++) {
            if (!check(row, column)) continue;
            map[row] = column;
            // 这里不能写++row, ++row就是实参+1了，应该写row + 1传给下一层，形参+1
            solveRow(row + 1);
            // 形参+1，不需要 回溯撤销 的过程，因为这种一维数组的map模式会自动覆盖
        }
    };

    const check = (row, column) => {
        let left = (right = column);
        // row 是从0开始的,row - 1是上一行,所以是--left
        for (let i = row - 1; i >= 0; i--) {
            if (
                map[i] === --left ||
                map[i] === ++right ||
                map[i] === column
            )
                return false;
        }
        return true;
    };
    // 打印成棋盘的格式
    const printMap = () => {
        const board = [];
        map.forEach(item => {
            let row = new Array(n).fill('.');
            row[item] = 'Q';
            board.push(row.join(''));
        })
        result.push(board);
    };

    // 别忘了调用，且要从0开始，不是n
    solveRow(0);
    return result;
};

console.log(solveNQueens(4));
// @lc code=end
