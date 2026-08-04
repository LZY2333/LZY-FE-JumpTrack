package com.cmbwlb.cus.domain.task.model;

public enum TaskSortField {

    TASK_ID("taskId"),
    CREATE_TIME("createTime"),
    TRANSACTION_TIME("transactionTime"),
    UPDATE_TIME("updateTime");

    private final String apiValue;

    TaskSortField(String apiValue) {
        this.apiValue = apiValue;
    }

    public String getApiValue() {
        return apiValue;
    }

    public static TaskSortField fromApiValue(String apiValue) {
        if (apiValue == null) {
            return null;
        }
        for (TaskSortField value : values()) {
            if (value.apiValue.equals(apiValue)) {
                return value;
            }
        }
        throw new IllegalArgumentException("不支持的排序字段：" + apiValue);
    }
}
