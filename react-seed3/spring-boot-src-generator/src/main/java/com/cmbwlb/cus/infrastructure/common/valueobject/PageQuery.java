package com.cmbwlb.cus.infrastructure.common.valueobject;

import lombok.Getter;

@Getter
public final class PageQuery {

    private final int current;
    private final int pageSize;

    public PageQuery(int current, int pageSize) {
        if (current < 1) {
            throw new IllegalArgumentException("current必须大于等于1");
        }
        if (pageSize < 1 || pageSize > 100) {
            throw new IllegalArgumentException("pageSize必须在1至100之间");
        }
        this.current = current;
        this.pageSize = pageSize;
    }
}
