package com.cmbwlb.cus.domain.task.model;

public enum SortDirection {

    ASC("asc"),
    DESC("desc");

    private final String apiValue;

    SortDirection(String apiValue) {
        this.apiValue = apiValue;
    }

    public String getApiValue() {
        return apiValue;
    }

    public static SortDirection fromApiValue(String apiValue) {
        if (apiValue == null) {
            return null;
        }
        for (SortDirection value : values()) {
            if (value.apiValue.equals(apiValue)) {
                return value;
            }
        }
        throw new IllegalArgumentException("不支持的排序方向：" + apiValue);
    }
}
