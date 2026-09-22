import { useEffect, useState } from 'react';
import { Alert, App as AntdApp, Button, Divider, Result, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { postEOCheckIn } from '@/api/iop';
import type { IopExceptionOutActionRequest } from '@/api/iop';
import IopPageShell from '@/components/IopPageCommon';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';
import { openModalExceptionOutApprove, openModalExceptionOutReject } from './ModalApproval';

/** 发报异常经办操作。 */
type ExceptionOutOperation = NonNullable<IopExceptionOutActionRequest['operation']>;

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage, IopTaskNode.MakerRework]);
const CHECKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.Checker1Stage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, ...CHECKER_TASK_NODES, IopTaskNode.Approved]);
const OPERATION_LABELS: Partial<Record<string, string>> = {
  OUT_CANCEL: 'Cancel Sending',
  OUT_RETRY: 'Resend',
};

/** 发报异常 IOP 业务页面。 */
const IopExceptionOut = () => {
  const task = useOutletContext<IopTaskData>();
  const { message, modal } = AntdApp.useApp();
  const [operationCode, setOperationCode] = useState(task.operationCode);
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);
  const isCheckerNode = CHECKER_TASK_NODES.has(task.taskNode);
  const operationLabel = OPERATION_LABELS[operationCode!] || operationCode || '-';

  /** 切换任务或节点时同步 Maker 已提交的操作。 */
  useEffect(() => {
    setOperationCode(task.operationCode);
  }, [task.taskId, task.taskNode, task.operationCode]);

  // 【Cancel Sending】 【Resend】
  const handleExceptionOut = async (operation: ExceptionOutOperation) => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postEOCheckIn({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
        operation,
      });
      setOperationCode(operation);
      message.success(`${OPERATION_LABELS[operation]} submitted for approval`);
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const approvalResult = next
      ? await openModalExceptionOutApprove(modal, operationLabel)
      : await openModalExceptionOutReject(modal);
    if (!approvalResult) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      const rejectReason = typeof approvalResult === 'string' ? approvalResult : undefined;
      await postEOCheckIn({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next,
        rejectReason,
      });
      message.success(next ? 'Task approved' : 'Task rejected');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!SUPPORTED_TASK_NODES.has(task.taskNode)) {
    return (
      <IopPageShell title='Out Exception' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Out Exception' taskNode={task.taskNode}>
      <div className='shrink-0'>
        {isMakerNode && (
          <div className='mb-3 flex gap-2'>
            <Button
              size='small'
              type='primary'
              icon={<StopOutlined />}
              onClick={() => handleExceptionOut('OUT_CANCEL')}
            >
              Cancel Sending
            </Button>
            <Button
              size='small'
              type='primary'
              icon={<ReloadOutlined />}
              onClick={() => handleExceptionOut('OUT_RETRY')}
            >
              Resend
            </Button>
          </div>
        )}

        {isCheckerNode && (
          <>
            <div className='mb-3 flex gap-2'>
              <Button size='small' type='primary' icon={<CloseOutlined />} onClick={() => handleApproval(false)}>
                Reject
              </Button>
              <Button size='small' type='primary' icon={<CheckOutlined />} onClick={() => handleApproval(true)}>
                Approve
              </Button>
            </div>
            <section className=' bg-gray-50 px-4 py-3' aria-label='Maker Operation'>
              <Typography.Text>Maker Operation: {operationLabel}</Typography.Text>
            </section>
          </>
        )}
        {task.taskNode === IopTaskNode.MakerRework && (
          <Alert
            className='mt-3'
            type='warning'
            showIcon
            message='Reject Reason'
            description={task.rejectReason || 'No reject reason provided.'}
          />
        )}

        {task.taskNode === IopTaskNode.Approved && (
          <Alert
            className='mt-3'
            type='success'
            showIcon
            message='Task Approved'
            description='This task has been approved.'
          />
        )}
      </div>

      <Divider className='mb-3 mt-0 shrink-0' orientation='left'>
        Current Message
      </Divider>

      <div className='min-h-0 flex-1 overflow-hidden'>
        <PanelMessageDetail msgId={task.busRefNo} />
      </div>
    </IopPageShell>
  );
};

export default IopExceptionOut;

/**
 * ExceptionOut 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker（Cancel Sending / Resend）：
 * http://localhost:5173/iop?flwiid=ST16-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework（展示退回原因，可重新提交）：
 * http://localhost:5173/iop?flwiid=ST16-REWORK-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-REWORK-001&wkiid=WKI-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1（Resend）：
 * http://localhost:5173/iop?flwiid=ST16-CHECKER1-RETRY-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-CHECKER1-RETRY-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1（Cancel Sending）：
 * http://localhost:5173/iop?flwiid=ST16-CHECKER1-CANCEL-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-CHECKER1-CANCEL-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Approved（审批完成）：
 * http://localhost:5173/iop?flwiid=ST16-APPROVED-RETRY-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-APPROVED-001&wkiid=WKI-APPROVED-001&nodnam=APPROVED&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 2（不支持二级审批，展示节点不可用）：
 * http://localhost:5173/iop?flwiid=ST16-CHECKER2-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST16-CHECKER2-001&wkiid=WKI-CHECKER2-001&nodnam=CHECKER2&userid=USER001&orgid=ORG001&userName=Tester
 */
