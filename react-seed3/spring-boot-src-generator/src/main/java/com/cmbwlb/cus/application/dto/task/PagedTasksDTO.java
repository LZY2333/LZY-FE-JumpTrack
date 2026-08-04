package com.cmbwlb.cus.application.dto.task;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
public final class PagedTasksDTO {

    private final List<TaskDTO> list;
    private final int current;
    private final int pageSize;
    private final long total;

    public PagedTasksDTO(List<TaskDTO> list, int current, int pageSize, long total) {
        this.list = Collections.unmodifiableList(new ArrayList<TaskDTO>(list));
        this.current = current;
        this.pageSize = pageSize;
        this.total = total;
    }
}
