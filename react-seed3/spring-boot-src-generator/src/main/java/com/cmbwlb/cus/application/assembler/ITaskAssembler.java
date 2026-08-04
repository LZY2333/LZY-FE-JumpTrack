package com.cmbwlb.cus.application.assembler;

import com.cmbwlb.cus.application.dto.task.PagedTasksDTO;
import com.cmbwlb.cus.application.dto.task.TaskQueryDTO;
import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageResult;

public interface ITaskAssembler {

    TaskQueryCriteria toCriteria(TaskQueryDTO source);

    PagedTasksDTO toPagedTasksDTO(PageResult<TaskSummary> pageResult);
}
