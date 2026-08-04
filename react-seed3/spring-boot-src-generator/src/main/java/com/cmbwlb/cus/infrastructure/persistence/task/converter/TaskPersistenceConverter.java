package com.cmbwlb.cus.infrastructure.persistence.task.converter;

import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskStatus;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.domain.task.model.TranType;
import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskListRowPO;
import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskQueryPO;
import org.springframework.stereotype.Component;

@Component
public class TaskPersistenceConverter {

    public TaskQueryPO toQueryPO(TaskQueryCriteria source) {
        TaskQueryPO target = new TaskQueryPO();
        target.setStatus(source.getStatus() == null
                ? null
                : source.getStatus().getCode());
        target.setCusId(source.getCusId());
        target.setTaskId(source.getTaskId());
        target.setCreateTimeFrom(source.getCreateTimeFrom());
        target.setCreateTimeToExclusive(source.getCreateTimeToExclusive());
        target.setUpdateTimeFrom(source.getUpdateTimeFrom());
        target.setUpdateTimeToExclusive(source.getUpdateTimeToExclusive());
        target.setTransactionTimeFrom(source.getTransactionTimeFrom());
        target.setTransactionTimeToExclusive(
                source.getTransactionTimeToExclusive());
        target.setSortField(source.getSortField() == null
                ? null
                : source.getSortField().getApiValue());
        target.setSortOrder(source.getSortDirection() == null
                ? null
                : source.getSortDirection().getApiValue());
        return target;
    }

    public TaskSummary toDomainSummary(TaskListRowPO source) {
        return new TaskSummary(
                source.getTaskId(),
                TranType.fromCode(source.getTranType()),
                TaskStatus.fromCode(source.getTaskStatus()),
                source.getCusId(),
                source.getCusEnName(),
                source.getCusCnName(),
                source.getMakerId(),
                source.getCheckerId(),
                source.getCreateTime(),
                source.getTransactionTime(),
                source.getUpdateTime(),
                source.getTaskRemark()
        );
    }
}
