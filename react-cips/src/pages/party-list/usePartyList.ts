import { useCallback, useEffect, useState } from 'react';
import { getParties } from '@/api/party';
import type { PartyRecord } from '@/api/party';
import useUserStore from '@/store/useUserStore';
import { buildPartyQueryConditions, type PartyListFilterValues } from './partyListUtil';

const PAGE_SIZE_STORAGE_KEY = 'party-list-page-size';
export const PARTY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = PARTY_PAGE_SIZE_OPTIONS[0];

/** 编排参与行查询和本地分页状态 */
const usePartyList = () => {
  const userId = useUserStore((state) => state.user?.userId);
  const [records, setRecords] = useState<PartyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PartyListFilterValues>({});
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return PARTY_PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  });

  useEffect(() => {
    // if (!userId) {
    //   setRecords([]);
    //   setLoading(false);
    //   return;
    // }

    let active = true;
    setLoading(true);
    getParties(buildPartyQueryConditions(filters))
      .then((result) => {
        if (active) setRecords(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (active) setRecords([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, filters, refreshVersion]);

  const query = useCallback((values: PartyListFilterValues) => {
    setFilters({ ...values });
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

export default usePartyList;
