import type { ChangeEvent } from 'react';
import { Input } from 'antd';
import cn from 'classnames';

interface RawEditorProps {
  /** Raw Message content. */
  value: string;
  /** Whether editing is disabled. */
  disabled?: boolean;
  /** Empty content prompt. */
  placeholder?: string;
  /** Layout class name. */
  className?: string;
  /** Raw Message change callback. */
  onChange: (value: string) => void;
}

/** Raw Message Editor */
const RawEditor = ({
  value,
  disabled = false,
  placeholder = 'Enter raw message',
  className,
  onChange,
}: RawEditorProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <Input.TextArea
      className={cn('h-full min-h-40 resize-none font-mono text-xs', className)}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default RawEditor;
