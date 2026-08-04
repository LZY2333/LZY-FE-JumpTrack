package com.cmbwlb.cus.domain.task.repository;

import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageQuery;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageResult;

public interface ITaskRepository {

    PageResult<TaskSummary> findPage(
            TaskQueryCriteria criteria,
            PageQuery pageQuery);
}
