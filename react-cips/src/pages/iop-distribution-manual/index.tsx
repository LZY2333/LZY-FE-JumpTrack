import { Alert, App as AntdApp, Button, Form, Result } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { postDMHandling } from '@/api/iop';
import type { IopDistributionManualHandlingRequest } from '@/api/iop';
import IopPageShell from '@/components/IopPageCommon';
import { IopTargetSysId } from '@/components/IopPageCommon/formItem';
import { MessageOwnerBy } from '@/components/FormItem/message';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 手工分发经办填写字段 */
type DistributionManualFields = Pick<
  IopDistributionManualHandlingRequest,
  'targetSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, IopTaskNode.Approved]);

/** IOP手工分发 */
const IopDistributionManual = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [distributionManualForm] = Form.useForm<DistributionManualFields>();
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);

  // 【Assign】
  const handleDistributionManual = async (fields: DistributionManualFields) => {
    if (!isMakerNode) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDMHandling({
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
      distributionManualForm.resetFields();
      message.success('Message distribution submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!SUPPORTED_TASK_NODES.has(task.taskNode)) {
    return (
      <IopPageShell title='Distribution Manual' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Distribution Manual' taskNode={task.taskNode}>
      {isMakerNode && (
        <Button size='small' className='mb-3' type='primary' onClick={() => distributionManualForm.submit()}>
          Assign
        </Button>
      )}

      <Form
        form={distributionManualForm}
        size='small'
        layout='inline'
        wrapperCol={{ flex: '1 1 0', className: 'min-w-0' }}
        className='mb-3 shrink-0'
        disabled={!isMakerNode}
        initialValues={{ targetSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
        onFinish={handleDistributionManual}
      >
        <IopTargetSysId className='w-80' />
        <MessageOwnerBy className='w-96' />
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

export default IopDistributionManual;

/**
 * DistributionManual 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST11-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST11-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Approved：
 * http://localhost:5173/iop?flwiid=ST11-APPROVED-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST11-APPROVED-001&wkiid=WKI-APPROVED-001&nodnam=APPROVED&userid=USER001&orgid=ORG001&userName=Tester
 */
