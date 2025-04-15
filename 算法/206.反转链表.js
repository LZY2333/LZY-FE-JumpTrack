/*
 * @lc app=leetcode.cn id=206 lang=javascript
 *
 * [206] 反转链表
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
// 递归
// 假设列表的其余部分已经被反转，现在我们应该如何反转当前节点？
// 1.如果为null则当前就是头节点，返回
// 2.先反转后续的节点
// 3.再反转当前节点
var reverseList = function(head) {
    if (head === null || head.next === null) { return head; }
    const newHead = reverseList(head.next); // 从最后一个结点开始轮，此处返回最后一个结点
    head.next.next = head; // 倒数第二个 的下一个结点 的next 指向当前结点
    head.next = null; // 当前结点 也就是 倒数第二个结点 next为null
    // 每一层 递归都记录了当前结点，所以直接把next置为null也没关系
    // 外层会继续将next 置为前一个数
    return newHead;
}
// @lc code=end

