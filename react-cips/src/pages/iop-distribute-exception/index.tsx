import { useEffect } from 'react';
import { Alert, App as AntdApp, Button, Form, Result } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { getDEForm, postDERetry } from '@/api/iop';
import type { IopDistributeExceptionHandlingRequest } from '@/api/iop';
import IopPageShell from '@/components/IopPageCommon';
import { IopMsgOwner, IopTargetSysId } from '@/components/IopPageCommon/formItem';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 分发异常经办填写字段。 */
type DistributionExceptionFields = Pick<
  IopDistributeExceptionHandlingRequest,
  'targetSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, IopTaskNode.Approved]);

/** 分发异常 IOP 业务页面。 */
const IopDistributeException = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [distributionExceptionForm] = Form.useForm<DistributionExceptionFields>();
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);

  /** 初始化并回填当前分发异常任务的目标系统及报文归属信息 */
  useEffect(() => {
    distributionExceptionForm.resetFields();
    if (!SUPPORTED_TASK_NODES.has(task.taskNode)) return;

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    getDEForm(task.busRefNo)
      .then((fields) => {
        if (!active) return;
        distributionExceptionForm.setFieldsValue(fields ?? {});
      })
      .catch(() => undefined)
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [distributionExceptionForm, task.busRefNo, task.iopWfTaskId, task.taskNode]);

  // 【Retry Distribute】
  const handleRetryDistribute = async (fields: DistributionExceptionFields) => {
    if (!isMakerNode) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDERetry({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
        targetSysId: fields.targetSysId?.trim() || undefined,
        msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
        msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
      });
      message.success('Distribution retry submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!SUPPORTED_TASK_NODES.has(task.taskNode)) {
    return (
      <IopPageShell title='Distribution Exception' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Distribution Exception' taskNode={task.taskNode}>
      {isMakerNode && (
        <Button
          size='small'
          className='mb-3'
          type='primary'
          icon={<RedoOutlined />}
          onClick={() => distributionExceptionForm.submit()}
        >
          Retry Distribute
        </Button>
      )}

      <Form
        form={distributionExceptionForm}
        size='small'
        layout='inline'
        className='mb-3 shrink-0'
        disabled={!isMakerNode}
        initialValues={{ targetSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
        onFinish={handleRetryDistribute}
      >
        <IopTargetSysId />
        <IopMsgOwner />
      </Form>

      {task.taskNode === IopTaskNode.Approved && (
        <Alert
          className='mb-3 shrink-0'
          type='success'
          showIcon
          message='Task Approved'
          description='This task has been approved.'
        />
      )}

      <PanelMessageDetail msgId={task.busRefNo} />
    </IopPageShell>
  );
};

export default IopDistributeException;

/**
 * DistributeException 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST13-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST13-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Approved：
 * http://localhost:5173/iop?flwiid=ST13-APPROVED-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST13-APPROVED-001&wkiid=WKI-APPROVED-001&nodnam=APPROVED&userid=USER001&orgid=ORG001&userName=Tester
 */
