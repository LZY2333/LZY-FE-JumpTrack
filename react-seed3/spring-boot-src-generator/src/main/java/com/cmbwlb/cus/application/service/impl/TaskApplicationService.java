package com.cmbwlb.cus.application.service.impl;

import com.cmbwlb.cus.application.assembler.ITaskAssembler;
import com.cmbwlb.cus.application.dto.task.PagedTasksDTO;
import com.cmbwlb.cus.application.dto.task.TaskQueryDTO;
import com.cmbwlb.cus.application.service.ITaskApplicationService;
import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.domain.task.repository.ITaskRepository;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageQuery;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskApplicationService implements ITaskApplicationService {

    private final ITaskRepository taskRepository;
    private final ITaskAssembler taskAssembler;

    @Override
    public PagedTasksDTO getTaskList(TaskQueryDTO queryParams) {
        TaskQueryCriteria criteria = taskAssembler.toCriteria(queryParams);
        PageQuery pageQuery = new PageQuery(
                queryParams.getCurrent(),
                queryParams.getPageSize()
        );
        PageResult<TaskSummary> pageResult =
                taskRepository.findPage(criteria, pageQuery);
        return taskAssembler.toPagedTasksDTO(pageResult);
    }
}
