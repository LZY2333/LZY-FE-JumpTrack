import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, App as AntdApp, Button, Card, Descriptions, Divider, Flex, Space, Switch, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { checkDayEnd, getDayEndStatus } from '@/api/dayEnd';
import type { DayEndCheckResult, DayEndStatus } from '@/api/dayEnd';
import {
  iopTaskBusRefNo,
  iopTaskFlowName,
  iopTaskId,
  iopTaskInputId,
  iopTaskInputTime,
  iopTaskNode,
} from '@/components/TableColumn/dayEnd';
import type { IopTaskInfo } from '@/types';
import { renderMessageText } from '@/components/TableColumn/messageColumnUtil';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import useUserStore from '@/store/useUserStore';
import { openModalDayEnd } from './ModalDayEnd';

/** 日结页面查询状态 */
interface DayEndPageState {
  /** 当前日结状态 */
  status?: DayEndStatus;
  /** 未结束任务 */
  pendingTasks?: DayEndCheckResult['pendingTasks'];
  /** 后端是否允许日结 */
  canDayEnd?: boolean;
  /** 查询失败提示 */
  error?: string;
}

const DAY_END_TASK_COLUMNS: TableColumnsType<IopTaskInfo> = [
  iopTaskId,
  iopTaskFlowName,
  iopTaskBusRefNo,
  iopTaskNode,
  iopTaskInputId,
  iopTaskInputTime,
];

/** 日结页 */
const DayEnd = () => {
  const { message, modal } = AntdApp.useApp();
  const userId = useUserStore((state) => state.user?.userId);
  const [pageState, setPageState] = useState<DayEndPageState>({});
  const { status, pendingTasks, error } = pageState;

  /** 刷新 */
  const handleRefresh = useCallback(
    async (event?: MouseEvent<HTMLElement>) => {
      if (!userId) {
        message.warning('Please log in first.');
        setPageState({});
        return false;
      }

      const stopGlobalLoading = startGlobalLoading();
      try {
        const [status, checkResult] = await Promise.all([getDayEndStatus(), checkDayEnd()]);
        const canDayEnd = checkResult?.canDayEnd === true;
        setPageState({ status, pendingTasks: checkResult?.pendingTasks, canDayEnd, error: undefined });
        if (event) message.success('Refresh success');
        return canDayEnd;
      } catch {
        setPageState({ error: 'Unable to load day end status and pending tasks. Please refresh.' });
        return false;
      } finally {
        stopGlobalLoading();
      }
    },
    [message, userId],
  );

  /** 日结 */
  const handleChange = useCallback(
    async (checked: boolean) => {
      if (!userId) {
        message.warning('Please log in first.');
        return;
      }

      // 刷新状态
      const canDayEnd = await handleRefresh();
      // 当前 checked = false时，正在执行日结(关闭)，需要进行校验
      if (!checked && !canDayEnd) {
        message.warning('Pending tasks must be completed before day end.');
        return;
      }
      // 打开日结弹窗
      if (!pageState.status) return;
      const saved = await openModalDayEnd(modal, pageState.status, checked ? 'Y' : 'N');
      if (!saved) return;
      message.success('Update success');
      // 刷新状态
      await handleRefresh();
    },
    [handleRefresh, message, modal, pageState.status, userId],
  );

  useEffect(() => {
    if (!userId) return;

    handleRefresh();
  }, [handleRefresh, userId]);

  return (
    <div className='h-1/2'>
      <Card
        size='small'
        title='CIPS Day End'
        className='flex max-h-full flex-col overflow-hidden'
        classNames={{ header: 'shrink-0', body: 'flex min-h-0 flex-col gap-2 overflow-hidden' }}
      >
        <Flex vertical gap='small' className='shrink-0'>
          {error && <Alert type='error' message={error} />}
          <Descriptions
            size='small'
            column={3}
            className='w-fit [&>.ant-descriptions-view>table]:!w-auto [&>.ant-descriptions-view>table]:!table-auto'
          >
            <Descriptions.Item label='Current Status'>
              <Space>
                {renderMessageText(status?.enableInd)}
                <Switch
                  size='small'
                  aria-label='Change day end status'
                  checked={status?.enableInd === 'Y'}
                  onChange={handleChange}
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label='Msg Channel' span={2}>
              {renderMessageText(status?.msgChannel)}
            </Descriptions.Item>
            <Descriptions.Item label='Last Operator'>{renderMessageText(status?.authorUser)}</Descriptions.Item>
            <Descriptions.Item label='Department'>{renderMessageText(status?.deption)}</Descriptions.Item>
            <Descriptions.Item label='Last Updated'>{status?.updateTime}</Descriptions.Item>
          </Descriptions>
          <Divider orientation='left' size='small'>
            <Flex align='center' gap='small'>
              <div>Pending Tasks ({pendingTasks?.length ?? 0})</div>
              <Button size='small' color='primary' variant='text' icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
            </Flex>
          </Divider>
        </Flex>
        <div className='min-h-0 overflow-auto'>
          <Table<IopTaskInfo>
            sticky
            size='small'
            rowKey='taskId'
            columns={DAY_END_TASK_COLUMNS}
            dataSource={pendingTasks ?? []}
            locale={{ emptyText: !userId ? 'Waiting for authentication...' : 'No pending tasks' }}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default DayEnd;
