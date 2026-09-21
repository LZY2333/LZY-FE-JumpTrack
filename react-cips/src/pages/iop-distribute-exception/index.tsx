import { Alert, App as AntdApp, Button, Divider, Form, Input, Result, Space } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { postDERetry } from '@/api/iop';
import type { IopDistributeExceptionHandlingRequest } from '@/api/iop';
import IopPageShell from '@/components/IopPageCommon';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 分发异常经办填写字段。 */
type DistributionExceptionFields = Pick<
  IopDistributeExceptionHandlingRequest,
  'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, IopTaskNode.Approved]);

/** 分发异常 IOP 业务页面。 */
const IopDistributeException = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [distributionExceptionForm] = Form.useForm<DistributionExceptionFields>();
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);

  // 【Retry Distribute】
  const handleRetryDistribute = async (fields: DistributionExceptionFields) => {
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
        targeSysId: fields.targeSysId?.trim() || undefined,
        msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
        msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
      });
      distributionExceptionForm.resetFields();
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
        <Form
          form={distributionExceptionForm}
          size='small'
          layout='inline'
          className='mb-3 shrink-0'
          initialValues={{ targeSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
          onFinish={handleRetryDistribute}
        >
          <Form.Item name='targeSysId' label='Target System ID' className='mb-0'>
            <Input className='w-40' maxLength={10} placeholder='Enter target system ID' />
          </Form.Item>
          <Form.Item label='Owner By' className='mb-0'>
            <Space.Compact block>
              <Form.Item name='msgOwnerDept' noStyle>
                <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Department' />
              </Form.Item>
              <Form.Item name='msgOwnerGroup' noStyle>
                <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Group' />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item className='mb-0'>
            <Button size='small' type='primary' htmlType='submit' icon={<RedoOutlined />}>
              Retry Distribute
            </Button>
          </Form.Item>
        </Form>
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

      <div className='min-h-0 flex-1 overflow-hidden'>
        <PanelMessageDetail msgId={task.busRefNo} />
      </div>
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
