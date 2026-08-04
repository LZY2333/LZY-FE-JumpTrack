package com.cmbwlb.cus.infrastructure.persistence.task.po;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TaskListRowPO {

    private String taskId;
    private String taskStatus;
    private String taskRemark;
    private String makerId;
    private String checkerId;
    private LocalDateTime createTime;
    private LocalDateTime transactionTime;
    private LocalDateTime updateTime;
    private String tranType;
    private String cusId;
    private String cusEnName;
    private String cusCnName;
}
