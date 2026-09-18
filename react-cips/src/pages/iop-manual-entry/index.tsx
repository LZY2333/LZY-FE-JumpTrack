import { useEffect, useRef, useState } from 'react';
import { Alert, App as AntdApp } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { postMEApprove, postMEConfirm, postMERedo, postMEUpdate } from '@/api/iop/iop-manual-entry';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import useMessageRaw from '@/components/ContentMessageRaw/useMessageRaw';
import { printXmlDocument } from '@/pages/message-detail/util';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { ApprovalYesNo, IopTaskNode } from '@/types/enums';
import { copyText } from '@/utils/fileUtil';
import PanelAction from './PanelAction';
import PanelContent from './PanelContent';
import { openModalApprove, openModalReject } from './ModalApproval';

/** IOP手工补录 */
const IopManualEntry = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const messageRawRef = useRef<ContentMessageRawRef>(null);
  const [currentRaw, setCurrentRaw] = useState('');
  const [originRaw, setOriginRaw] = useState('');
  const [updated, setUpdated] = useState(false);
  /** Maker节点 */
  const isMakerNode = task.taskNode === IopTaskNode.MakerStage || task.taskNode === IopTaskNode.MakerRework;
  /** Checker1节点 */
  const isCheckerNode = task.taskNode === IopTaskNode.Checker1Stage || task.taskNode === IopTaskNode.Approved;
  /** Approved节点 */
  const approvalDisabled = task.taskNode === IopTaskNode.Approved;
  // 报文原文加载
  const {
    raw: rawMessage,
    rawLoading,
    rawError,
  } = useMessageRaw({
    msgId: task.busRefNo,
    msgDirection: task.msgDirection,
  });
  /** 当前编辑或展示的原文对象。 */
  const currentRawMessage = {
    msgId: rawMessage?.msgId ?? task.busRefNo,
    msgContent: currentRaw,
    createTime: rawMessage?.createTime ?? '',
  };

  useEffect(() => {
    if (!rawMessage) return;

    setOriginRaw(rawMessage.msgContent);
    setCurrentRaw(rawMessage.msgContent);
    setUpdated(false);
  }, [rawMessage]);

  // 【Update】
  const handleUpdate = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMEUpdate({
        msgId: task.busRefNo,
        taskId: task.taskId,
        msgContent: currentRaw,
        userId: task.userId,
        orgId: task.orgId,
      });
      setUpdated(true);
      message.success('Raw message updated');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reset】
  const handleReset = () => {
    setCurrentRaw(originRaw);
    message.success('Raw message reset');
  };

  // 【Redo】
  const handleRedo = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMERedo({
        msgId: task.busRefNo,
        taskId: task.taskId,
        userId: task.userId,
        orgId: task.orgId,
      });
      setUpdated(false);
      message.success('Ready to edit again');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Confirm】
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

  // 【Reject】 【Approve】
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

  // 【Copy current】
  const handleCopy = async () => {
    if (!currentRaw) return;
    await copyText(currentRaw);
    message.success('Current message copied');
  };

  // 【Print Current】
  const handlePrint = () => {
    if (!currentRaw) return;
    const printContent = messageRawRef.current?.getPrintableValue() ?? currentRaw;
    const opened = printXmlDocument(`${task.busRefNo || 'message'}.xml`, printContent);
    if (!opened) message.error('The print window was blocked. Allow pop-ups and try again.');
  };

  return (
    <div className='flex h-full flex-col overflow-hidden p-4'>
      <h1 className='mb-3 mt-0 shrink-0 text-xl font-semibold leading-7'>Manual Entry</h1>

      <PanelAction
        isMakerNode={isMakerNode}
        isCheckerNode={isCheckerNode}
        approvalDisabled={approvalDisabled}
        updated={updated}
        rawLoading={rawLoading}
        currentRaw={currentRaw}
        originRaw={originRaw}
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

      <PanelContent
        ref={messageRawRef}
        taskNode={task.taskNode}
        isMakerNode={isMakerNode}
        isCheckerNode={isCheckerNode}
        updated={updated}
        msgId={task.busRefNo}
        msgDirection={task.msgDirection}
        businessType={task.businessType}
        currentRawMessage={currentRawMessage}
        rawLoading={rawLoading}
        rawError={rawError}
        onRawChange={setCurrentRaw}
      />
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
