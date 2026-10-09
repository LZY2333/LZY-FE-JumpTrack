import type { ReactNode } from 'react';
import { Tag } from 'antd';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 统一固定 IOP 页面标题，让操作区与业务内容在标题下方滚动。 */
const IopPageShell = ({ title, taskNode, children }: IopPageShellProps) => (
  <div className='flex h-full flex-col overflow-hidden p-4'>
    <header className='mb-3 flex shrink-0 items-center gap-2'>
      <h1 className='m-0 text-xl font-semibold leading-7'>{title}</h1>
      <Tag color='red' className='m-0'>
        {IOP_TASK_NODE_LABELS[taskNode] ?? taskNode}
      </Tag>
    </header>
    <div className='min-h-0 flex-1 overflow-auto'>{children}</div>
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
