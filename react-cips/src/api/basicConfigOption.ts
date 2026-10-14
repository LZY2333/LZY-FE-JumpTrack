import { DictionaryOptionsEnum } from '@/types/enums';
import type { DictionaryOptions } from '@/types/enums';
import { post } from './request';

/** 基础配置字典查询地址 */
export const API_BASIC_CONFIG_OPTIONS = '/pssst/manager/basicConfigOption/queryOptions';

/** 基础配置字典查询条件 */
export interface BasicConfigOptionQueryRequest {
  /** 本次需要加载的字典类型 */
  configType: DictionaryOptionsEnum[];
}

/** 基础配置字典接口条目 */
export interface BasicConfigOptionItem {
  /** 字典类型 */
  configType: DictionaryOptionsEnum;
  /** 配置编码 */
  configKey: string;
  /** 配置显示文本 */
  configVal: string;
  /** 配置说明 */
  configDesc: string;
}

/** 基础配置字典接口响应 */
export type BasicConfigOptionQueryBody = Partial<Record<DictionaryOptionsEnum, BasicConfigOptionItem[]>>;

/** 查询字典, 并转换为{label，value} */
export const queryBasicConfigOptionsApi = async (configTypes: DictionaryOptionsEnum[]): Promise<DictionaryOptions> => {
  const body = await post<BasicConfigOptionQueryBody>(API_BASIC_CONFIG_OPTIONS, { configType: configTypes });
  const options: DictionaryOptions = {};

  // 转换为 [{label，value}]
  for (const configType of configTypes) {
    const items = body?.[configType] ?? [];
    options[configType] = items.map((item) => ({ value: item.configVal, label: item.configKey }));
  }

  return options;
};
