package com.cmbwlb.cus.infrastructure.persistence.task.po;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskQueryPO {

    private String status;
    private String cusId;
    private String taskId;
    private LocalDateTime createTimeFrom;
    private LocalDateTime createTimeToExclusive;
    private LocalDateTime updateTimeFrom;
    private LocalDateTime updateTimeToExclusive;
    private LocalDateTime transactionTimeFrom;
    private LocalDateTime transactionTimeToExclusive;
    private String sortField;
    private String sortOrder;
}
