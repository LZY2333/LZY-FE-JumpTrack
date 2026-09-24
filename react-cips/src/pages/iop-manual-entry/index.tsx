import { useEffect, useRef, useState } from 'react';
import { Alert, App as AntdApp, Card, Divider, Result } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { postMEApprove, postMEConfirm, postMEReject, postMEUpdate } from '@/api/iop';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import IopPageShell from '@/components/IopPageCommon';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode, MessageDirection } from '@/types/enums';
import PanelAction from './PanelAction';
import { openModalApprove, openModalReject } from './ModalApproval';

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage, IopTaskNode.MakerRework]);
const CHECKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.Checker1Stage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([
  ...MAKER_TASK_NODES,
  ...CHECKER_TASK_NODES,
  IopTaskNode.Approved,
]);

/** IOP手工补录 */
const IopManualEntry = () => {
  const task = useOutletContext<IopTaskData>();
  const { message, modal } = AntdApp.useApp();
  const messageRawRef = useRef<ContentMessageRawRef>(null);
  const [updated, setUpdated] = useState(false);
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);
  const isCheckerNode = CHECKER_TASK_NODES.has(task.taskNode);

  // 切换任务时重置当前页面的更新状态。
  useEffect(() => {
    setUpdated(false);
  }, [task.iopWfTaskId]);

  // 【Update】
  const handleUpdate = async () => {
    const contentTemp = messageRawRef.current!.getUpdatedContent();
    if (!contentTemp) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEUpdate({
        msgId: task.busRefNo,
        message: contentTemp,
      });
      setUpdated(true);
      message.success('Raw message updated');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reset】
  const handleReset = () => {
    messageRawRef.current!.resetCurrent();
  };

  // 【Rollback】
  const handleRollback = () => {
    setUpdated(false);
    message.success('Raw message update rolled back');
  };

  // 【Confirm】
  const handleConfirm = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEConfirm({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
      });
      message.success('Task confirmed');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const rejecting = !next;
    const approvalResult = rejecting ? await openModalReject(modal) : await openModalApprove(modal);
    if (!approvalResult) return;

    const rejectReason = typeof approvalResult === 'string' ? approvalResult : undefined;
    const stopGlobalLoading = startGlobalLoading();
    try {
      const postApproval = next ? postMEApprove : postMEReject;
      await postApproval({
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
      message.success(rejecting ? 'Task rejected' : 'Task approved');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Copy current】
  const handleCopy = async () => {
    await messageRawRef.current!.copyCurrent();
  };

  // 【Print Current】
  const handlePrint = () => {
    messageRawRef.current!.printCurrent();
  };

  if (!SUPPORTED_TASK_NODES.has(task.taskNode)) {
    return (
      <IopPageShell title='Manual Entry' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Manual Entry' taskNode={task.taskNode}>
      {(isMakerNode || isCheckerNode) && (
        <PanelAction
          isMakerNode={isMakerNode}
          isCheckerNode={isCheckerNode}
          updated={updated}
          onUpdate={handleUpdate}
          onReset={handleReset}
          onRollback={handleRollback}
          onConfirm={handleConfirm}
          onCopy={handleCopy}
          onPrint={handlePrint}
          onApproval={handleApproval}
        />
      )}

      {task.taskNode === IopTaskNode.MakerRework && (
        <Alert
          className='mb-3 shrink-0'
          type='warning'
          showIcon
          message='Reject Reason'
          description={task.rejectReason || 'No reject reason provided.'}
        />
      )}

      {task.taskNode === IopTaskNode.Approved && (
        <Alert
          className='mb-3 shrink-0'
          type='success'
          showIcon
          message='Task Approved'
          description='This task has been approved.'
        />
      )}

      <Divider className='mb-3 mt-0 shrink-0' orientation='left'>
        Current Message
      </Divider>

      {isMakerNode && !updated ? (
        <Card
          className='flex h-full min-h-0 flex-col'
          classNames={{ body: 'flex min-h-0 flex-1 flex-col overflow-hidden' }}
          size='small'
          title='Raw Message'
        >
          <ContentMessageRaw
            ref={messageRawRef}
            msgId={task.busRefNo}
            msgDirection={MessageDirection.In}
            editable
          />
        </Card>
      ) : (
        <PanelMessageDetail temp msgId={task.busRefNo} />
      )}
    </IopPageShell>
  );
};

export default IopManualEntry;

/**
 * ManualEntry 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST10-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST10-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=ST10-REWORK-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST10-REWORK-001&wkiid=WKI-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=ST10-CHECKER1-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST10-CHECKER1-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 */
