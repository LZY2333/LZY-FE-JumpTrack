import { App as AntdApp, Button, Result } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { postDERetry } from '@/api/iop/iop-distribute-exception';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 分发异常 IOP 业务页面。 */
const IopDistributeException = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  /** Maker节点。 */
  const isMakerNode = task.taskNode === IopTaskNode.MakerStage;
  /** 分发异常仅支持经办和完成状态。 */
  const isSupportedNode = isMakerNode || task.taskNode === IopTaskNode.Approved;

  // 【Retry Distribute】
  const handleRetryDistribute = async () => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDERetry({
        msgId: task.busRefNo,
        taskId: task.taskId,
        userId: task.userId,
        orgId: task.orgId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        iopWkiId: task.iopWkiId ?? task.iopWfTaskId,
      });
      message.success('Distribution retry submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!isSupportedNode) {
    return (
      <Result
        status='warning'
        title='Task unavailable at the current stage'
        subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
      />
    );
  }

  return (
    <div className='flex h-full flex-col overflow-hidden p-4'>
      <h1 className='mb-3 mt-0 shrink-0 text-xl font-semibold leading-7'>Distribution Exception</h1>

      {isMakerNode && (
        <div className='mb-3 shrink-0'>
          <Button size='small' type='primary' icon={<RedoOutlined />} onClick={handleRetryDistribute}>
            Retry Distribute
          </Button>
        </div>
      )}

      <div className='min-h-0 flex-1 overflow-hidden'>
        <PanelMessageDetail
          temp
          msgId={task.busRefNo}
          msgDirection={task.msgDirection}
          businessType={task.businessType}
        />
      </div>
    </div>
  );
};

export default IopDistributeException;

/**
 * DistributeException 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST13-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Approved：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST13-APPROVED-001&nodnam=APPROVED&userid=USER001&orgid=ORG001&userName=Tester
 */
