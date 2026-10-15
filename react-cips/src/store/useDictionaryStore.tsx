import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { create } from 'zustand';
import { queryBasicConfigOptionsApi } from '@/api/basicConfigOption';
import type { DictionaryOption, DictionaryOptions, DictionaryOptionsEnum } from '@/types/enums';
import dictionaryOptions from './dictionaryOptions.json';

/** 字典缓存与按需加载入口 */
interface DictionaryStore {
  /** 已加载的字典选项，空数组同样属于有效缓存 */
  options: DictionaryOptions;
  /** 收集尚未缓存的字典需求 */
  ensureOptions: (configType: DictionaryOptionsEnum) => void;
}

/** 字典编码翻译文本属性 */
interface DictionaryTextProps {
  /** 编码所属的字典类型 */
  configType: DictionaryOptionsEnum;
  /** 待翻译的字典编码 */
  value?: string | null;
  /** 自定义翻译文本的展示方式，缺省使用纯文本 */
  children?: (text: string) => ReactNode;
}

const EMPTY_OPTIONS: DictionaryOption[] = [];
const BATCH_DELAY_MS = 30;

/** 字段和文本展示共用的字典缓存，短时间内的需求合并为一次请求 */
const useDictionaryStore = create<DictionaryStore>((set, get) => {
  const pendingTypes = new Set<DictionaryOptionsEnum>();
  const inFlightTypes = new Set<DictionaryOptionsEnum>();
  let batchTimer: ReturnType<typeof setTimeout> | undefined;

  /** 收集未缓存且未请求中的字典需求 */
  const ensureOptions = (configType: DictionaryOptionsEnum) => {
    if (get().options[configType] !== undefined) return;
    if (inFlightTypes.has(configType)) return;

    pendingTypes.add(configType);
    if (batchTimer !== undefined) return;

    batchTimer = setTimeout(() => {
      batchTimer = undefined;
      void fetchOptions();
    }, BATCH_DELAY_MS);
  };

  /** 加载当前收集窗口内的全部字典 */
  const fetchOptions = async () => {
    const configTypes = [...pendingTypes];
    pendingTypes.clear();
    configTypes.forEach((configType) => inFlightTypes.add(configType));

    try {
      const options = await queryBasicConfigOptionsApi(configTypes);
      set((state) => ({ options: { ...state.options, ...options } }));
    } catch {
      // 请求及响应异常已由接口层提示，失败结果不写入缓存
    } finally {
      configTypes.forEach((configType) => inFlightTypes.delete(configType));
    }
  };

  // 临时字典随构建内置，后端提供正式字典后移除对应预置项
  return { options: dictionaryOptions, ensureOptions };
});

/** 字段挂载或启用时加载自己的字典 */
export const useDictionaryOptions = (configType: DictionaryOptionsEnum, enabled = true) => {
  const options = useDictionaryStore((state) => state.options[configType] ?? EMPTY_OPTIONS);
  const ensureOptions = useDictionaryStore((state) => state.ensureOptions);

  useEffect(() => {
    if (!enabled) return;
    ensureOptions(configType);
  }, [configType, enabled, ensureOptions]);

  return { options };
};

/** 展示字典编码的翻译文本，未加载或未知编码保留原值 */
export const TextDictionary = ({ configType, value, children }: DictionaryTextProps) => {
  const { options } = useDictionaryOptions(configType, Boolean(value));
  const text = options.find((option) => option.value === value)?.label || value || '--';
  if (children) return <>{children(text)}</>;
  return <span>{text}</span>;
};

export default useDictionaryStore;
