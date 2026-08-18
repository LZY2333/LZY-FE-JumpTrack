import { forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { Button, Card, Form, List, message } from 'antd';
import { DownloadOutlined, FileOutlined } from '@ant-design/icons';
import type { Attachment } from '@/types';
import { downloadAttachment } from '@/api/tasks';
import { TaskDescription, TaskName } from '@/components/FormItem';

interface TaskFormProps {
  initialValues?: TaskFormValues;
  attachments?: Attachment[];
  readonly?: boolean;
}

export interface TaskFormValues {
  taskName: string;
  description: string;
}

export interface TaskFormRef {
  /** 校验通过后返回可提交的任务字段。 */
  validate: () => Promise<TaskFormValues>;
}

const EMPTY_TASK_FORM_VALUES: TaskFormValues = { taskName: '', description: '' };
const EMPTY_ATTACHMENTS: Attachment[] = [];

const TaskForm = forwardRef<TaskFormRef, TaskFormProps>((props, ref) => {
  const initialValues = props.initialValues ?? EMPTY_TASK_FORM_VALUES;
  const attachments = props.attachments ?? EMPTY_ATTACHMENTS;
  const readonly = props.readonly ?? !props.initialValues;
  const [form] = Form.useForm<TaskFormValues>();

  useLayoutEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  useImperativeHandle(
    ref,
    () => ({
      validate: () =>
        form.validateFields().then((values) => ({
          taskName: values.taskName,
          description: values.description ?? '',
        })),
    }),
    [form],
  );

  const handleDownload = (fileName: string) => {
    downloadAttachment(fileName)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        try {
          document.body.appendChild(anchor);
          anchor.click();
        } finally {
          anchor.remove();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
        }
      })
      .catch(() => {
        message.error('Attachment download failed');
      });
  };

  return (
    <>
      <Card title='Task Information' size='small'>
        <Form<TaskFormValues>
          form={form}
          layout='vertical'
          disabled={readonly}
          initialValues={initialValues}
          scrollToFirstError
        >
          <TaskName />
          <TaskDescription />
        </Form>
      </Card>

      <Card title='Attachments' size='small' className='mt-4'>
        <List
          size='small'
          dataSource={attachments}
          locale={{ emptyText: 'No attachments' }}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                <Button
                  key='download'
                  type='text'
                  size='small'
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(attachment.fileName)}
                />,
              ]}
            >
              <div className='flex items-center'>
                <FileOutlined className='mr-2 text-gray-400' />
                <span>{attachment.fileName}</span>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
});

TaskForm.displayName = 'TaskForm';

export default TaskForm;
