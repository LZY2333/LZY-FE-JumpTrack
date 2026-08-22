/** 一期只开放报文列表与明细；登录和用户权限继续沿用现有入口。 */
export enum RoutePath {
  Root = '/',
  MessageList = '/messages',
  MessageDetail = '/messages/:messageId',
}
