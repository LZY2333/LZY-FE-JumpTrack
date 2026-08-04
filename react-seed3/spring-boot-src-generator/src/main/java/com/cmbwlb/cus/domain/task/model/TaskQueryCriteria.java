package com.cmbwlb.cus.domain.task.model;

import java.time.LocalDateTime;

public final class TaskQueryCriteria {

    private final TaskStatus status;
    private final String cusId;
    private final String taskId;
    private final LocalDateTime createTimeFrom;
    private final LocalDateTime createTimeToExclusive;
    private final LocalDateTime updateTimeFrom;
    private final LocalDateTime updateTimeToExclusive;
    private final LocalDateTime transactionTimeFrom;
    private final LocalDateTime transactionTimeToExclusive;
    private final TaskSortField sortField;
    private final SortDirection sortDirection;

    public TaskQueryCriteria(
            TaskStatus status,
            String cusId,
            String taskId,
            LocalDateTime createTimeFrom,
            LocalDateTime createTimeToExclusive,
            LocalDateTime updateTimeFrom,
            LocalDateTime updateTimeToExclusive,
            LocalDateTime transactionTimeFrom,
            LocalDateTime transactionTimeToExclusive,
            TaskSortField sortField,
            SortDirection sortDirection) {
        this.status = status;
        this.cusId = cusId;
        this.taskId = taskId;
        this.createTimeFrom = createTimeFrom;
        this.createTimeToExclusive = createTimeToExclusive;
        this.updateTimeFrom = updateTimeFrom;
        this.updateTimeToExclusive = updateTimeToExclusive;
        this.transactionTimeFrom = transactionTimeFrom;
        this.transactionTimeToExclusive = transactionTimeToExclusive;
        this.sortField = sortField;
        this.sortDirection = sortDirection;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public String getCusId() {
        return cusId;
    }

    public String getTaskId() {
        return taskId;
    }

    public LocalDateTime getCreateTimeFrom() {
        return createTimeFrom;
    }

    public LocalDateTime getCreateTimeToExclusive() {
        return createTimeToExclusive;
    }

    public LocalDateTime getUpdateTimeFrom() {
        return updateTimeFrom;
    }

    public LocalDateTime getUpdateTimeToExclusive() {
        return updateTimeToExclusive;
    }

    public LocalDateTime getTransactionTimeFrom() {
        return transactionTimeFrom;
    }

    public LocalDateTime getTransactionTimeToExclusive() {
        return transactionTimeToExclusive;
    }

    public TaskSortField getSortField() {
        return sortField;
    }

    public SortDirection getSortDirection() {
        return sortDirection;
    }
}
