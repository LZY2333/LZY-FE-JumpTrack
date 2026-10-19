import { Descriptions } from 'antd';
import type { App } from 'antd';
import { submitDayEnd } from '@/api/dayEnd';
import type { DayEndEnableInd, DayEndStatus } from '@/api/dayEnd';
import useUserStore from '@/store/useUserStore';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 日结弹窗使用的 Ant Design 上下文能力 */
type ModalDayEndApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm' | 'warning'>;

/** 打开日结状态切换确认弹窗，提交失败时保留弹窗供重试 */
export const openModalDayEnd = async (
  modal: ModalDayEndApi,
  status: DayEndStatus,
  enableInd: DayEndEnableInd,
): Promise<boolean> => {
  const user = useUserStore.getState().user;
  if (!user?.userId?.trim()) {
    modal.warning({
      title: 'Authentication Required',
      content: 'Please log in before changing the day end status.',
    });
    return false;
  }

  return modal.confirm({
    title: 'Confirm Status Change',
    content: (
      <Descriptions size='small' column={1}>
        <Descriptions.Item label='Msg Channel'>{status.msgChannel}</Descriptions.Item>
        <Descriptions.Item label='Operator'>
          {user.userName} / {user.userId}
        </Descriptions.Item>
        <Descriptions.Item label='Department'>{user.orgId}</Descriptions.Item>
        <Descriptions.Item label='Status Change'>
          {status.enableInd} → {enableInd}
        </Descriptions.Item>
      </Descriptions>
    ),
    okText: 'Confirm',
    onOk: async () => {
      const stopGlobalLoading = startGlobalLoading();
      try {
        await submitDayEnd({
          msgChannel: status.msgChannel,
          deption: user.orgId,
          createUser: user.userId.trim(),
          enableInd,
        });
      } finally {
        stopGlobalLoading();
      }
    },
  });
};
