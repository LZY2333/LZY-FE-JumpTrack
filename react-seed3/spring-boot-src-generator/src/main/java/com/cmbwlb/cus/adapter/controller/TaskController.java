package com.cmbwlb.cus.adapter.controller;

import com.cmbwlb.cus.application.dto.task.PagedTasksDTO;
import com.cmbwlb.cus.application.dto.task.TaskQueryDTO;
import com.cmbwlb.cus.application.service.ITaskApplicationService;
import com.cmbwlb.cus.infrastructure.common.valueobject.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/cies/v1/task")
@RequiredArgsConstructor
public class TaskController {

    private final ITaskApplicationService taskApplicationService;

    @PostMapping("/getTasks")
    public ApiResult<PagedTasksDTO> getTasks(
            @Valid @RequestBody TaskQueryDTO queryParams) {
        PagedTasksDTO result = taskApplicationService.getTaskList(queryParams);
        return ApiResult.success(result);
    }
}
