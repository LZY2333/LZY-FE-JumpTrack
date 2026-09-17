import { useRef } from 'react';
import { Alert, App as AntdApp, Typography } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { postMEApprove, postMEConfirm, postMERedo, postMEUpdate } from '@/api/iop';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import { printXmlDocument } from '@/pages/message-detail/util';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { ApprovalYesNo, IopTaskNode } from '@/types/enums';
import { copyText } from '@/utils/fileUtil';
import ManualEntryActions from './ManualEntryActions';
import ManualEntryContent from './ManualEntryContent';
import { openModalApprove, openModalReject } from './ModalApproval';
import useManualEntry from './useManualEntry';

/** 手工补录 IOP 页面入口。 */
const IopManualEntry = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const manualEntry = useManualEntry(task);
  const messageRawRef = useRef<ContentMessageRawRef>(null);

  /** 保存原文并展示解析结果。 */
  const handleUpdate = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEUpdate({
        msgId: task.busRefNo,
        taskId: task.taskId,
        msgContent: manualEntry.currentRaw,
        userId: task.userId,
        orgId: task.orgId,
      });
      manualEntry.setUpdated(true);
      message.success('Raw message updated');
    } finally {
      stopGlobalLoading();
    }
  };

  /** 恢复首次加载的原文。 */
  const handleReset = () => {
    manualEntry.setCurrentRaw(manualEntry.originRaw);
    message.success('Raw message reset');
  };

  /** 调用重做接口并返回编辑状态。 */
  const handleRedo = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMERedo({
        msgId: task.busRefNo,
        taskId: task.taskId,
        userId: task.userId,
        orgId: task.orgId,
      });
      manualEntry.setUpdated(false);
      message.success('Ready to edit again');
    } finally {
      stopGlobalLoading();
    }
  };

  /** 确认当前 Maker 处理结果。 */
  const handleConfirm = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEConfirm({
        msgId: task.busRefNo,
        taskId: task.taskId,
        userId: task.userId,
        orgId: task.orgId,
      });
      message.success('Task confirmed');
    } finally {
      stopGlobalLoading();
    }
  };

  /** 复制当前编辑或预览的原文。 */
  const handleCopy = async () => {
    if (!manualEntry.currentRaw) return;
    await copyText(manualEntry.currentRaw);
    message.success('Current message copied');
  };

  /** 打印当前编辑或预览的原文。 */
  const handlePrint = () => {
    if (!manualEntry.currentRaw) return;
    const printContent = messageRawRef.current?.getPrintableValue() ?? manualEntry.currentRaw;
    const opened = printXmlDocument(`${task.busRefNo || 'message'}.xml`, printContent);
    if (!opened) message.error('The print window was blocked. Allow pop-ups and try again.');
  };

  /** 打开审批弹窗并提交结果。 */
  const handleApproval = async (next: ApprovalYesNo) => {
    const rejecting = next === ApprovalYesNo.No;
    const approvalResult = rejecting ? await openModalReject() : await openModalApprove();
    if (!approvalResult) return;

    const rejectReason = typeof approvalResult === 'string' ? approvalResult : '';
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEApprove({
        msgId: task.busRefNo,
        taskId: task.taskId,
        next,
        rejectReason,
        userId: task.userId,
        orgId: task.orgId,
      });
      message.success(rejecting ? 'Task rejected' : 'Task approved');
    } finally {
      stopGlobalLoading();
    }
  };

  return (
    <div className='flex h-full flex-col overflow-hidden p-4'>
      <Typography.Title className='shrink-0' level={4}>
        Manual Entry
      </Typography.Title>

      <ManualEntryActions
        manualEntry={manualEntry}
        onUpdate={handleUpdate}
        onReset={handleReset}
        onRedo={handleRedo}
        onConfirm={handleConfirm}
        onCopy={handleCopy}
        onPrint={handlePrint}
        onApproval={handleApproval}
      />

      {task.taskNode === IopTaskNode.MakerRework && (
        <Alert
          className='mb-3 shrink-0'
          type='warning'
          showIcon
          message='Reject Reason'
          description={task.rejectReason || 'No reject reason provided.'}
        />
      )}

      <ManualEntryContent ref={messageRawRef} taskNode={task.taskNode} manualEntry={manualEntry} />
    </div>
  );
};

export default IopManualEntry;

/**
 * ManualEntry 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST10-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST10-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST10-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 */
