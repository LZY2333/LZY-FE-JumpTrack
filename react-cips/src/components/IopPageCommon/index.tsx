import type { ReactNode } from 'react';
import { Tag } from 'antd';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 统一承载 IOP 页面标题、任务节点和业务内容。 */
const IopPageShell = ({ title, taskNode, children }: IopPageShellProps) => (
  <div className='flex h-full flex-col overflow-hidden p-4'>
    <header className='mb-3 flex shrink-0 items-center gap-2'>
      <h1 className='m-0 text-xl font-semibold leading-7'>{title}</h1>
      <Tag color='red' className='m-0'>
        {IOP_TASK_NODE_LABELS[taskNode] ?? taskNode}
      </Tag>
    </header>
    {children}
  </div>
);

interface IopPageShellProps {
  /** 页面标题。 */
  title: string;
  /** 当前经办节点。 */
  taskNode: IopTaskNode;
  /** 页面业务内容。 */
  children: ReactNode;
}

export default IopPageShell;
