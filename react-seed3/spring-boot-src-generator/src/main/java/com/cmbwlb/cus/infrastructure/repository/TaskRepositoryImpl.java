package com.cmbwlb.cus.infrastructure.repository;

import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.domain.task.repository.ITaskRepository;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageQuery;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageResult;
import com.cmbwlb.cus.infrastructure.persistence.task.converter.TaskPersistenceConverter;
import com.cmbwlb.cus.infrastructure.persistence.task.mapper.TaskMapper;
import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskListRowPO;
import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskQueryPO;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class TaskRepositoryImpl implements ITaskRepository {

    private final TaskMapper taskMapper;
    private final TaskPersistenceConverter taskConverter;

    @Override
    public PageResult<TaskSummary> findPage(
            TaskQueryCriteria criteria,
            PageQuery pageQuery) {
        TaskQueryPO queryPO = taskConverter.toQueryPO(criteria);
        PageHelper.startPage(pageQuery.getCurrent(), pageQuery.getPageSize());

        List<TaskListRowPO> rowList = taskMapper.selectTaskList(queryPO);
        PageInfo<TaskListRowPO> pageInfo =
                new PageInfo<TaskListRowPO>(rowList);
        List<TaskSummary> taskList = pageInfo.getList()
                .stream()
                .map(taskConverter::toDomainSummary)
                .collect(Collectors.toList());

        return new PageResult<TaskSummary>(
                taskList,
                pageInfo.getPageNum(),
                pageInfo.getPageSize(),
                pageInfo.getTotal()
        );
    }
}
