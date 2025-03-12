/*
 * @lc app=leetcode.cn id=707 lang=javascript
 *
 * [707] 设计链表
 */

// @lc code=start

function ListNode(val, next) {
    this.val = val
    this.next = next
}

var MyLinkedList = function () {
    this.head = new ListNode();
};

MyLinkedList.prototype.getNode = function (index) {
    let p = this.head
    while (index > 0) {
        if (!p.next) return;
        p = p.next
        index--;
    }
    return p.next
};

MyLinkedList.prototype.get = function (index) {
    const node = this.getNode(index);
    return node ? node.val : -1;
};

MyLinkedList.prototype.addAtHead = function (val) {
    this.addAtIndex(0, val)
};

MyLinkedList.prototype.addAtTail = function (val) {
    let p = this.head
    while (p.next) p = p.next;
    p.next = new ListNode(val)
};

MyLinkedList.prototype.addAtIndex = function (index, val) {
    const p = index === 0 ? this.head : this.getNode(index - 1);
    if (!p) return;
    const next = p.next
    p.next = new ListNode(val, next)
};

MyLinkedList.prototype.deleteAtIndex = function (index) {
    const p = index === 0 ? this.head : this.getNode(index - 1);
    // getNode 可能会没拿到p，p 也可能没有next
    if (!p || !p.next) return;
    p.next = p.next.next
};

// var myLinkedList = new MyLinkedList();
// myLinkedList.addAtHead(1);
// myLinkedList.addAtTail(3);
// myLinkedList.addAtIndex(1, 2);    // 链表变为 1->2->3
// console.log(JSON.stringify(myLinkedList));
// myLinkedList.get(1);              // 返回 2
// myLinkedList.deleteAtIndex(1);    // 现在，链表变为 1->3
// myLinkedList.get(1);              // 返回 3

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * var obj = new MyLinkedList()
 * var param_1 = obj.get(index)
 * obj.addAtHead(val)
 * obj.addAtTail(val)
 * obj.addAtIndex(index,val)
 * obj.deleteAtIndex(index)
 */
// @lc code=end

