package com.wlbcmbchina.manager.domain.message.model;

import java.util.Collections;
import java.util.List;

/**
 * 【14:领域分页结果】与具体持久化框架无关，防止 MyBatis 的 {@code IPage} 穿透到应用层和 Web 层。
 */
public class PageResult<T> {

    private final List<T> records;
    private final long current;
    private final long pageSize;
    private final long total;

    public PageResult(List<T> records, long current, long pageSize, long total) {
        this.records = records == null ? Collections.<T>emptyList() : records;
        this.current = current;
        this.pageSize = pageSize;
        this.total = total;
    }

    public List<T> getRecords() { return records; }
    public long getCurrent() { return current; }
    public long getPageSize() { return pageSize; }
    public long getTotal() { return total; }
}
