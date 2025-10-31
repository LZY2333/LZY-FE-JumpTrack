/*
 * @lc app=leetcode.cn id=93 lang=javascript
 *
 * [93] 复原 IP 地址
 */

// @lc code=start
/**
 * @param {string} s
 * @return {string[]}
 */
var restoreIpAddresses = function (s) {
    const result = [], path = [];
    const backTracking = (start) => {
        if (path.length === 4) {
            if (start === s.length)
                result.push(path.join('.'));
            return;
        }

        for (let i = start; i < s.length; i++) {
            const str = s.slice(start, i + 1);
            if (!isOK(str)) break;
            path.push(str);
            backTracking(i + 1);
            path.pop();
        }
    };
    const isOK = (str) => (str[0] !== '0' && str <= 255) || str === '0';
    backTracking(0);
    return result;
};
// [ '1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3' ]
console.log(restoreIpAddresses('101023'));
// @lc code=end
