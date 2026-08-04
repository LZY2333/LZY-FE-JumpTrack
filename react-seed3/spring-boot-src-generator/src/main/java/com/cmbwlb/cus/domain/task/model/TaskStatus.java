package com.cmbwlb.cus.domain.task.model;

public enum TaskStatus {

    PENDING("S01"),
    SUBMITTED("S02"),
    APPROVED("S03"),
    RETURNED("S04"),
    CANCELLED("S05");

    private final String code;

    TaskStatus(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static TaskStatus fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (TaskStatus value : values()) {
            if (value.code.equals(code)) {
                return value;
            }
        }
        throw new IllegalArgumentException("不支持的任务状态：" + code);
    }
}
