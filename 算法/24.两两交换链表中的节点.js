/*
 * @lc app=leetcode.cn id=24 lang=javascript
 *
 * [24] 两两交换链表中的节点
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
 * @return {ListNode}
 */
var swapPairs = function (head) {
    const newHead = new ListNode(-1, head);
    let p = newHead;
    // 记住从前往后拼，拼的间隙会丢失哪个next就提前记录哪个next
    // 0 1 2 3: 顺序 0->2, 2->1, 1->3
    while (p.next && p.next.next) {
        const first = p.next, third = p.next.next.next
        // 0->2, 丢失first, 所以提前记录first
        p.next = p.next.next
        // 2->1, 丢失third, 所以提前记录third
        p.next.next = first
        // 1->3
        first.next = third
        p = first
    }
    // 在第一轮p.next修改时，newHead指向了新转过来的head，随后p指向其他节点
    return newHead.next
};
// @lc code=end

