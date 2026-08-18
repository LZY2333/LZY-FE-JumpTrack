import { useEffect } from 'react';
import { App } from 'antd';

type MessageApi = ReturnType<typeof App.useApp>['message'];

let messageApi: MessageApi | undefined;
const pendingErrorMessages: string[] = [];

/**
 * Axios 拦截器位于 React 树外，无法调用 App.useApp()；这里复用 React 树内取得的 message 实例，
 * 避免使用无法继承 ConfigProvider 主题、语言等上下文的静态 message API。
 */
export const showErrorMessage = (content: string) => {
  if (!messageApi) {
    pendingErrorMessages.push(content);
    return;
  }
  void messageApi.error(content);
};

/**
 * 将 antd App 的 message 实例桥接给请求层；初始化前的错误先进入队列，实例就绪后再统一展示。
 */
const AntdAppBridge = () => {
  const { message } = App.useApp();

  useEffect(() => {
    messageApi = message;
    pendingErrorMessages.splice(0).forEach((content) => void message.error(content));

    return () => {
      if (messageApi === message) messageApi = undefined;
    };
  }, [message]);

  return null;
};

export default AntdAppBridge;
