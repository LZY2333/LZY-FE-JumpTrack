package com.cmbwlb.cus.application.assembler.impl;

import com.cmbwlb.cus.application.assembler.ITaskAssembler;
import com.cmbwlb.cus.application.dto.task.PagedTasksDTO;
import com.cmbwlb.cus.application.dto.task.TaskDTO;
import com.cmbwlb.cus.application.dto.task.TaskQueryDTO;
import com.cmbwlb.cus.domain.task.model.SortDirection;
import com.cmbwlb.cus.domain.task.model.TaskQueryCriteria;
import com.cmbwlb.cus.domain.task.model.TaskSortField;
import com.cmbwlb.cus.domain.task.model.TaskStatus;
import com.cmbwlb.cus.domain.task.model.TaskSummary;
import com.cmbwlb.cus.infrastructure.common.valueobject.PageResult;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TaskAssembler implements ITaskAssembler {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public TaskQueryCriteria toCriteria(TaskQueryDTO source) {
        return new TaskQueryCriteria(
                TaskStatus.fromCode(trimToNull(source.getStatus())),
                trimToNull(source.getCusId()),
                trimToNull(source.getTaskId()),
                startOfDay(source.getCreateTimeFrom()),
                nextDayStart(source.getCreateTimeTo()),
                startOfDay(source.getUpdateTimeFrom()),
                nextDayStart(source.getUpdateTimeTo()),
                startOfDay(source.getTransactionTimeFrom()),
                nextDayStart(source.getTransactionTimeTo()),
                TaskSortField.fromApiValue(trimToNull(source.getSortField())),
                SortDirection.fromApiValue(trimToNull(source.getSortOrder()))
        );
    }

    @Override
    public PagedTasksDTO toPagedTasksDTO(PageResult<TaskSummary> pageResult) {
        List<TaskDTO> taskDTOList = pageResult.getList()
                .stream()
                .map(this::toTaskDTO)
                .collect(Collectors.toList());

        return new PagedTasksDTO(
                taskDTOList,
                pageResult.getCurrent(),
                pageResult.getPageSize(),
                pageResult.getTotal()
        );
    }

    private TaskDTO toTaskDTO(TaskSummary source) {
        return new TaskDTO(
                emptyIfNull(source.getTaskId()),
                source.getTranType() == null ? "" : source.getTranType().getCode(),
                source.getTaskStatus() == null ? "" : source.getTaskStatus().getCode(),
                emptyIfNull(source.getCusId()),
                emptyIfNull(source.getCusEnName()),
                emptyIfNull(source.getCusCnName()),
                emptyIfNull(source.getMakerId()),
                emptyIfNull(source.getCheckerId()),
                formatDate(source.getCreateTime()),
                formatDate(source.getTransactionTime()),
                formatDate(source.getUpdateTime()),
                emptyIfNull(source.getTaskRemark())
        );
    }

    private LocalDateTime startOfDay(LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    private LocalDateTime nextDayStart(LocalDate date) {
        return date == null ? null : date.plusDays(1).atStartOfDay();
    }

    private String formatDate(LocalDateTime dateTime) {
        return dateTime == null
                ? ""
                : dateTime.toLocalDate().format(DATE_FORMATTER);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private String emptyIfNull(String value) {
        return value == null ? "" : value;
    }
}
