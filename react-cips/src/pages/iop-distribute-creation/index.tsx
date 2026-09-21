import { useEffect } from 'react';
import { Alert, App as AntdApp, Button, Divider, Form, Result } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { getDCForm, postDCHandling } from '@/api/iop';
import type { IopDistributeCreationHandlingRequest } from '@/api/iop';
import IopPageShell from '@/components/IopPageCommon';
import { IopMsgOwner, IopTargeSysId } from '@/components/IopPageCommon/formItem';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';
import { openModalDistributeCreationApprove, openModalDistributeCreationReject } from './ModalApproval';

/** 创建分发任务经办填写字段。 */
type DistributionCreationFields = Pick<
  IopDistributeCreationHandlingRequest,
  'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage, IopTaskNode.MakerRework]);
const CHECKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.Checker1Stage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([
  ...MAKER_TASK_NODES,
  ...CHECKER_TASK_NODES,
  IopTaskNode.Approved,
]);

/** 创建分发任务 IOP 业务页面。 */
const IopDistributeCreation = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [distributionCreationForm] = Form.useForm<DistributionCreationFields>();
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);
  const isCheckerNode = CHECKER_TASK_NODES.has(task.taskNode);

  /** 审批及已审批节点查询 Maker 填写的清分字段。 */
  useEffect(() => {
    distributionCreationForm.resetFields();
    if (isMakerNode || !SUPPORTED_TASK_NODES.has(task.taskNode)) return;

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    getDCForm(task.busRefNo)
      .then((fields) => {
        if (active && fields) distributionCreationForm.setFieldsValue(fields);
      })
      .catch(() => undefined)
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [distributionCreationForm, isMakerNode, task.busRefNo, task.taskNode]);

  // 【Create】
  const handleDistributionCreation = async (fields: DistributionCreationFields) => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDCHandling({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
        targeSysId: fields.targeSysId?.trim() || undefined,
        msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
        msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
      });
      distributionCreationForm.resetFields();
      message.success('Distribution creation submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const approvalResult = next
      ? await openModalDistributeCreationApprove()
      : await openModalDistributeCreationReject();
    if (!approvalResult) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      const rejectReason = typeof approvalResult === 'string' ? approvalResult : undefined;
      await postDCHandling({
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
      <IopPageShell title='Distribution Creation' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Distribution Creation' taskNode={task.taskNode}>
      <div className='mb-3 shrink-0'>
        <Form
          form={distributionCreationForm}
          size='small'
          layout='inline'
          disabled={!isMakerNode}
          initialValues={{ targeSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
          onFinish={handleDistributionCreation}
        >
          <IopTargeSysId />
          <IopMsgOwner />
          {isMakerNode && (
            <Form.Item className='mb-0'>
              <Button size='small' type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          )}
        </Form>

        {task.taskNode === IopTaskNode.MakerRework && (
          <Alert
            className='mt-3'
            type='warning'
            showIcon
            message='Reject Reason'
            description={task.rejectReason || 'No reject reason provided.'}
          />
        )}

        {isCheckerNode && (
          <div className='mt-3 flex gap-2'>
            <Button size='small' danger icon={<CloseOutlined />} onClick={() => handleApproval(false)}>
              Reject
            </Button>
            <Button size='small' type='primary' icon={<CheckOutlined />} onClick={() => handleApproval(true)}>
              Approve
            </Button>
          </div>
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

export default IopDistributeCreation;

/**
 * DistributeCreation 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST12-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST12-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=ST12-REWORK-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST12-REWORK-001&wkiid=WKI-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=ST12-CHECKER1-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST12-CHECKER1-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 */
