package com.wlbcmbchina.manager.application.api.dto.response;

import java.util.Collections;
import java.util.List;

/** 【15:分页响应 DTO】面向接口调用方的稳定分页结构，不暴露 MyBatis 分页对象。 */
public class PageDTO<T> {

    /** 当前页数据。 */
    private final List<T> list;

    /** 当前页码。 */
    private final long current;

    /** 单页行数。 */
    private final long pageSize;

    /** 符合条件的总行数。 */
    private final long total;

    public PageDTO(List<T> list, long current, long pageSize, long total) {
        this.list = list == null ? Collections.<T>emptyList() : list;
        this.current = current;
        this.pageSize = pageSize;
        this.total = total;
    }

    public List<T> getList() { return list; }
    public long getCurrent() { return current; }
    public long getPageSize() { return pageSize; }
    public long getTotal() { return total; }
}
