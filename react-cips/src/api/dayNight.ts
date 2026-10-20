import type { DayNightStatusEnum } from '@/types/enums';
import { get } from './request';

/** 日夜场当前配置 */
export interface DayNightCurrentConfig {
  /** 报文 ID */
  msgId: string;
  /** 当前日期 */
  currDate: string;
  /** 下一日期 */
  nextDate: string;
  /** 当前系统状态 */
  currStatus: DayNightStatusEnum;
  /** 更新时间 */
  updateTime: string;
}

/** 查询系统当前日夜场状态 */
export const getDayNightCurrentConfig = () => get<DayNightCurrentConfig>('/pssst/manager/api/cips-status/getcurrcfg');
