import type { App } from 'antd';
import { retryLcwTasks } from '@/api/lcw';

/** LCW 重试弹窗使用的 Ant Design 上下文能力 */
type ModalLcwRetryApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm'>;

/** LCW 批量重试成功后关闭弹窗并返回 true */
export const openModalLcwRetry = async (modal: ModalLcwRetryApi, msgIds: string[]): Promise<boolean> =>
  modal.confirm({
    title: `Retry ${msgIds.length} selected LCW message${msgIds.length > 1 ? 's' : ''}?`,
    content: 'The server will validate the latest LCW status before accepting each retry.',
    okText: 'Retry',
    cancelText: 'Cancel',
    onOk: async () => {
      await retryLcwTasks({ msgIds });
    },
  });
