package com.cmbwlb.cus.infrastructure.persistence.task.mapper;

import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskListRowPO;
import com.cmbwlb.cus.infrastructure.persistence.task.po.TaskQueryPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskMapper {

    List<TaskListRowPO> selectTaskList(@Param("query") TaskQueryPO queryPO);
}
