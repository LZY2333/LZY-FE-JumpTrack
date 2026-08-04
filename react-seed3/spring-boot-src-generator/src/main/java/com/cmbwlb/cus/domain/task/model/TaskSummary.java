package com.cmbwlb.cus.domain.task.model;

import java.time.LocalDateTime;

public final class TaskSummary {

    private final String taskId;
    private final TranType tranType;
    private final TaskStatus taskStatus;
    private final String cusId;
    private final String cusEnName;
    private final String cusCnName;
    private final String makerId;
    private final String checkerId;
    private final LocalDateTime createTime;
    private final LocalDateTime transactionTime;
    private final LocalDateTime updateTime;
    private final String taskRemark;

    public TaskSummary(
            String taskId,
            TranType tranType,
            TaskStatus taskStatus,
            String cusId,
            String cusEnName,
            String cusCnName,
            String makerId,
            String checkerId,
            LocalDateTime createTime,
            LocalDateTime transactionTime,
            LocalDateTime updateTime,
            String taskRemark) {
        this.taskId = taskId;
        this.tranType = tranType;
        this.taskStatus = taskStatus;
        this.cusId = cusId;
        this.cusEnName = cusEnName;
        this.cusCnName = cusCnName;
        this.makerId = makerId;
        this.checkerId = checkerId;
        this.createTime = createTime;
        this.transactionTime = transactionTime;
        this.updateTime = updateTime;
        this.taskRemark = taskRemark;
    }

    public String getTaskId() {
        return taskId;
    }

    public TranType getTranType() {
        return tranType;
    }

    public TaskStatus getTaskStatus() {
        return taskStatus;
    }

    public String getCusId() {
        return cusId;
    }

    public String getCusEnName() {
        return cusEnName;
    }

    public String getCusCnName() {
        return cusCnName;
    }

    public String getMakerId() {
        return makerId;
    }

    public String getCheckerId() {
        return checkerId;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public String getTaskRemark() {
        return taskRemark;
    }
}
