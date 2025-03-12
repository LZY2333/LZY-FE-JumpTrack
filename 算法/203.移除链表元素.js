/*
 * @lc app=leetcode.cn id=203 lang=javascript
 *
 * [203] 移除链表元素
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
 * @param {number} val
 * @return {ListNode}
 */
var removeElements = function(head, val) {
    const newHead = new ListNode(undefined,head);
    let p = newHead;

    while(p.next) {
        if(p.next.val === val) {
            p.next = p.next.next
            continue
        }
        p = p.next
    }
    return newHead.next
};
// @lc code=end

