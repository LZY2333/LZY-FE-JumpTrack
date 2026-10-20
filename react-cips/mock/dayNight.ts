import type { DayNightCurrentConfig } from '@/api/dayNight';
import type { ApiResult } from '@/api/request';
import { DayNightStatusEnum, ResCode } from '@/types/enums';

// 修改当前状态后刷新页面，可查看不同日夜场状态
const DAY_NIGHT_MOCK_STATUS: DayNightCurrentConfig['currStatus'] = DayNightStatusEnum.DaytimePreparation;

export default [
  {
    url: '/pssst/manager/api/cips-status/getcurrcfg',
    method: 'get',
    response: (): ApiResult<DayNightCurrentConfig> => ({
      returnCode: ResCode.Success,
      body: {
        msgId: 'MSG20261013000001',
        currDate: '2026-10-15',
        nextDate: '2026-10-16',
        currStatus: DAY_NIGHT_MOCK_STATUS,
        updateTime: '2026-10-16T06:38:32.000+00:00',
      },
    }),
  },
];
