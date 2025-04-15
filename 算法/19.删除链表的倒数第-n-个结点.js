/*
 * @lc app=leetcode.cn id=19 lang=javascript
 *
 * [19] 删除链表的倒数第 N 个结点
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
    // 双指针
    const newHead = new ListNode(-1, head)
    let p1 = p2 = newHead
    while (n-- > 0) p2 = p2.next
    while (p2.next) {
        p1 = p1.next
        p2 = p2.next
    }
    p1.next = p1.next.next
    return newHead.next
};
// @lc code=end

