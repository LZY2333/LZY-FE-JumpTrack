import { useCallback, useEffect, useState } from 'react';
import { getPartyRelations } from '@/api/party';
import type { PartyRelationQuery, PartyRelationConditions, PartyRelationRecord } from '@/api/party';
import useUserStore from '@/store/useUserStore';

const PAGE_SIZE_STORAGE_KEY = 'party-relation-page-size';
export const PARTY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

/** 编排直间参关系查询和服务端分页状态 */
const usePartyRelationList = () => {
  const userId = useUserStore((state) => state.user?.userId);
  const [records, setRecords] = useState<PartyRelationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PartyRelationConditions>({});
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return PARTY_PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    const requestParams: PartyRelationQuery = { current, pageSize, ...filters };
    getPartyRelations(requestParams)
      .then((result) => {
        if (!active) return;
        setRecords(result?.list ?? []);
        setTotal(result?.total ?? 0);
      })
      .catch(() => {
        if (!active) return;
        setRecords([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, current, pageSize, filters, refreshVersion]);

  const query = useCallback((values: PartyRelationConditions) => {
    setFilters(cleanPartyValues(values));
    setCurrent(1);
  }, []);

  const reset = useCallback(() => {
    setFilters({});
    setCurrent(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
    setPageSizeState(value);
  }, []);

  /** 成功修改后按当前筛选条件重新查询列表 */
  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  return {
    authenticated: Boolean(userId),
    records,
    total,
    loading,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    query,
    reset,
    refresh,
  };
};

export default usePartyRelationList;

/** 清理未填写的提交字段 */
const cleanPartyValues = <Values extends object>(values: Values): Values =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as Values;
