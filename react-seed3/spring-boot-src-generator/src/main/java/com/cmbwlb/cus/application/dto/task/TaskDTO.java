package com.cmbwlb.cus.application.dto.task;

import lombok.Getter;

@Getter
public final class TaskDTO {

    private final String taskId;
    private final String tranType;
    private final String taskStatus;
    private final String cusId;
    private final String cusEnName;
    private final String cusCnName;
    private final String makerId;
    private final String checkerId;
    private final String createTime;
    private final String transactionTime;
    private final String updateTime;
    private final String taskRemark;

    public TaskDTO(
            String taskId,
            String tranType,
            String taskStatus,
            String cusId,
            String cusEnName,
            String cusCnName,
            String makerId,
            String checkerId,
            String createTime,
            String transactionTime,
            String updateTime,
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
}
