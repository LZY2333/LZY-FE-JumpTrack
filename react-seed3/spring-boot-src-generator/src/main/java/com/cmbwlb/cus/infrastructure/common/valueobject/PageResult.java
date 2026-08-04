package com.cmbwlb.cus.infrastructure.common.valueobject;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
public final class PageResult<T> {

    private final List<T> list;
    private final int current;
    private final int pageSize;
    private final long total;

    public PageResult(List<T> list, int current, int pageSize, long total) {
        if (list == null) {
            throw new IllegalArgumentException("list不能为空");
        }
        if (current < 1) {
            throw new IllegalArgumentException("current必须大于等于1");
        }
        if (pageSize < 1) {
            throw new IllegalArgumentException("pageSize必须大于等于1");
        }
        if (total < 0) {
            throw new IllegalArgumentException("total不能小于0");
        }
        this.list = Collections.unmodifiableList(new ArrayList<T>(list));
        this.current = current;
        this.pageSize = pageSize;
        this.total = total;
    }
}
