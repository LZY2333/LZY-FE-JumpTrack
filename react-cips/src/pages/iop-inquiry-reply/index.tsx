import { useEffect, useState } from 'react';
import { Alert, App as AntdApp, Button, Divider, Form, Result } from 'antd';
import { CheckOutlined, CloseOutlined, CommentOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { getIRForm, postIRApprove } from '@/api/iop';
import type { IopInquiryReplyBusData } from '@/api/iop';
import CardCollapse from '@/components/CardCollapse';
import IopPageShell from '@/components/IopPageCommon';
import { IopTaskContent, IopTaskMsgType } from '@/components/IopPageCommon/formItem';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';
import { openModalInquiryReplyApprove, openModalInquiryReplyReject } from './ModalApproval';

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage, IopTaskNode.MakerRework]);
const CHECKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.Checker1Stage, IopTaskNode.Checker2Stage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, ...CHECKER_TASK_NODES, IopTaskNode.Approved]);
const INQUIRY_REPLY_HIGH_LIGHT_FIELDS = ['content'] as const;
// 展开时解除折叠卡片的高度限制，由页面内容区统一滚动。
const REPLY_CONTENT_EXPANDED_BODY_CLASS_NAME = '[&>div]:max-h-none [&>div]:overflow-visible';

/** 查询查复 IOP 业务页面。 */
const IopInquiryReply = () => {
  const task = useOutletContext<IopTaskData>();
  const { message, modal } = AntdApp.useApp();
  const [inquiryReplyForm] = Form.useForm<IopInquiryReplyBusData>();
  const [replyContentCollapsed, setReplyContentCollapsed] = useState(false);
  const isMakerNode = MAKER_TASK_NODES.has(task.taskNode);
  const isCheckerNode = CHECKER_TASK_NODES.has(task.taskNode);

  /** 审批及已审批节点查询经办填写的查询查复内容。 */
  useEffect(() => {
    inquiryReplyForm.resetFields();
    if (isMakerNode || !SUPPORTED_TASK_NODES.has(task.taskNode)) return;

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    getIRForm(task.taskId)
      .then((fields) => {
        if (active && fields) inquiryReplyForm.setFieldsValue(fields);
      })
      .catch(() => undefined)
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [inquiryReplyForm, isMakerNode, task.taskId, task.taskNode]);

  // 【Submit】
  const handleSubmit = async (fields: IopInquiryReplyBusData) => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postIRApprove({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
        busData: {
          msgType: fields.msgType,
          content: fields.content.trim(),
        },
      });
      message.success('Inquiry reply submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const approvalResult = next ? await openModalInquiryReplyApprove(modal) : await openModalInquiryReplyReject(modal);
    if (!approvalResult) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      const rejectReason = typeof approvalResult === 'string' ? approvalResult : undefined;
      await postIRApprove({
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
      <IopPageShell title='Inquiry Reply' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Inquiry Reply' taskNode={task.taskNode}>
      <div className='min-h-0 flex-1 overflow-auto'>
        {isMakerNode && (
          <Button
            size='small'
            className='mb-3'
            type='primary'
            icon={<CommentOutlined />}
            onClick={() => inquiryReplyForm.submit()}
          >
            Submit
          </Button>
        )}

        {isCheckerNode && (
          <div className='mb-3 flex gap-2'>
            <Button size='small' type='primary' icon={<CheckOutlined />} onClick={() => handleApproval(true)}>
              Approve
            </Button>
            <Button size='small' danger icon={<CloseOutlined />} onClick={() => handleApproval(false)}>
              Reject
            </Button>
          </div>
        )}

        {task.taskNode === IopTaskNode.MakerRework && (
          <Alert
            className='mb-3'
            type='warning'
            showIcon
            message='Reject Reason'
            description={task.rejectReason || 'No reject reason provided.'}
          />
        )}

        {task.taskNode === IopTaskNode.Approved && (
          <Alert
            className='mb-3'
            type='success'
            showIcon
            message='Task Approved'
            description='This task has been approved.'
          />
        )}

        <CardCollapse
          size='small'
          title='Reply Content'
          collapsed={replyContentCollapsed}
          classNames={{ body: replyContentCollapsed ? undefined : REPLY_CONTENT_EXPANDED_BODY_CLASS_NAME }}
          onCollapsedChange={setReplyContentCollapsed}
        >
          <Form
            form={inquiryReplyForm}
            layout='vertical'
            disabled={!isMakerNode}
            initialValues={{ msgType: undefined, content: '' }}
            onFinish={handleSubmit}
          >
            <IopTaskMsgType className='mb-3' />
            <IopTaskContent textAreaAutoSize={{ minRows: 3 }} />
          </Form>
        </CardCollapse>

        <Divider className='my-3' orientation='left'>
          Related Message
        </Divider>

        <div>
          <PanelMessageDetail highLightFields={INQUIRY_REPLY_HIGH_LIGHT_FIELDS} msgId={task.busRefNo} />
        </div>
      </div>
    </IopPageShell>
  );
};

export default IopInquiryReply;

/**
 * InquiryReply 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST15-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=ST15-REWORK-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-REWORK-001&wkiid=WKI-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=ST15-CHECKER1-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-CHECKER1-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 2：
 * http://localhost:5173/iop?flwiid=ST15-CHECKER2-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-CHECKER2-001&wkiid=WKI-CHECKER2-001&nodnam=CHECKER2&userid=USER001&orgid=ORG001&userName=Tester
 */
