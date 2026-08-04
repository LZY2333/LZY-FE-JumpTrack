package com.cmbwlb.cus.infrastructure.common.valueobject;

import lombok.Getter;

@Getter
public final class ApiResult<T> {

    private final boolean success;
    private final String code;
    private final String message;
    private final T data;

    private ApiResult(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResult<T> success(T data) {
        return new ApiResult<T>(true, "SUCCESS", "成功", data);
    }

    public static <T> ApiResult<T> error(String code, String message) {
        return new ApiResult<T>(false, code, message, null);
    }
}
