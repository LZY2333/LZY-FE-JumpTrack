package com.cmbwlb.cus.application.dto.task;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TaskQueryDTO {

    @NotNull(message = "current不能为空")
    @Min(value = 1, message = "current必须大于等于1")
    private Integer current;

    @NotNull(message = "pageSize不能为空")
    @Min(value = 1, message = "pageSize必须大于等于1")
    @Max(value = 100, message = "pageSize不能超过100")
    private Integer pageSize;

    @Pattern(regexp = "S0[1-5]", message = "status必须是S01至S05")
    private String status;

    @Size(max = 10, message = "cusId长度不能超过10")
    private String cusId;

    @Size(max = 18, message = "taskId长度不能超过18")
    private String taskId;

    private LocalDate createTimeFrom;
    private LocalDate createTimeTo;
    private LocalDate updateTimeFrom;
    private LocalDate updateTimeTo;
    private LocalDate transactionTimeFrom;
    private LocalDate transactionTimeTo;

    @Pattern(
            regexp = "taskId|createTime|transactionTime|updateTime",
            message = "sortField不合法")
    private String sortField;

    @Pattern(regexp = "asc|desc", message = "sortOrder只能是asc或desc")
    private String sortOrder;

    @AssertTrue(message = "sortField和sortOrder必须同时传入")
    @JsonIgnore
    public boolean isSortPairValid() {
        return (sortField == null) == (sortOrder == null);
    }

    @AssertTrue(message = "createTime日期范围不合法")
    @JsonIgnore
    public boolean isCreateTimeRangeValid() {
        return isRangeValid(createTimeFrom, createTimeTo);
    }

    @AssertTrue(message = "updateTime日期范围不合法")
    @JsonIgnore
    public boolean isUpdateTimeRangeValid() {
        return isRangeValid(updateTimeFrom, updateTimeTo);
    }

    @AssertTrue(message = "transactionTime日期范围不合法")
    @JsonIgnore
    public boolean isTransactionTimeRangeValid() {
        return isRangeValid(transactionTimeFrom, transactionTimeTo);
    }

    private boolean isRangeValid(LocalDate from, LocalDate to) {
        return from == null || to == null || !from.isAfter(to);
    }
}
