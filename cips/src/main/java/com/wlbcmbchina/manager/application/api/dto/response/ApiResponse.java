package com.wlbcmbchina.manager.application.api.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 【16:统一响应信封】为成功和失败响应提供稳定业务码结构；Controller 返回后由 Jackson 执行
 * 【17:响应序列化】。
 */
public class ApiResponse<T> {

    /** 业务返回码。 */
    private final String returnCode;

    /** 成功业务数据。 */
    private final T body;

    /** 失败信息。 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String errorMsg;

    private ApiResponse(String returnCode, T body, String errorMsg) {
        this.returnCode = returnCode;
        this.body = body;
        this.errorMsg = errorMsg;
    }

    /** 【16:包装成功响应】业务数据放入 body，成功场景不输出 errorMsg。 */
    public static <T> ApiResponse<T> success(T body) {
        return new ApiResponse<T>("SUC0000", body, null);
    }

    /** 构造失败响应。 */
    public static <T> ApiResponse<T> failure(String returnCode, String errorMsg) {
        return new ApiResponse<T>(returnCode, null, errorMsg);
    }

    public String getReturnCode() { return returnCode; }
    public T getBody() { return body; }
    public String getErrorMsg() { return errorMsg; }
}
