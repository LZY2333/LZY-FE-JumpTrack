package com.cmbwlb.cus.application.service;

import com.cmbwlb.cus.application.dto.task.PagedTasksDTO;
import com.cmbwlb.cus.application.dto.task.TaskQueryDTO;

public interface ITaskApplicationService {

    PagedTasksDTO getTaskList(TaskQueryDTO queryParams);
}
