import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Button, Card } from 'antd';
import type { CardProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import cn from 'classnames';

export interface CardCollapseProps extends CardProps {
  /** 受控收起状态；不传时由组件内部维护。 */
  collapsed?: boolean;
  /** 非受控模式下的初始收起状态。 */
  defaultCollapsed?: boolean;
  /** 收起状态变化回调。 */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** 带标题开关和自上而下展开动画的 Card，保留 Ant Design Card 原生属性。 */
const CardCollapse = ({
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  title,
  classNames,
  children,
  ...cardProps
}: CardCollapseProps) => {
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const resolvedCollapsed = collapsed ?? innerCollapsed;
  const contentClassName = resolvedCollapsed
    ? 'invisible max-h-0 overflow-hidden px-3 py-0 opacity-0 transition-all duration-200 ease-in-out motion-reduce:transition-none'
    : 'visible max-h-screen overflow-hidden p-3 opacity-100 transition-all duration-200 ease-in-out motion-reduce:transition-none';

  const handleCollapse = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const nextCollapsed = !resolvedCollapsed;
    if (collapsed === undefined) setInnerCollapsed(nextCollapsed);
    onCollapsedChange?.(nextCollapsed);
  };

  return (
    <Card
      {...cardProps}
      classNames={{ ...classNames, body: cn('!p-0', classNames?.body) }}
      title={
        <div className='flex items-center gap-1'>
          <span>{title}</span>
          <Button
            size='small'
            color='primary'
            variant='link'
            icon={
              <DownOutlined
                className={`transition-transform duration-200 motion-reduce:transition-none ${
                  resolvedCollapsed ? 'rotate-0' : 'rotate-180'
                }`}
              />
            }
            aria-label={resolvedCollapsed ? 'Expand card' : 'Collapse card'}
            aria-expanded={!resolvedCollapsed}
            onClick={handleCollapse}
          />
        </div>
      }
    >
      <div className={contentClassName}>{children}</div>
    </Card>
  );
};

export default CardCollapse;
