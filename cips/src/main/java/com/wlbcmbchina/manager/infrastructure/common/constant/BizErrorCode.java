package com.wlbcmbchina.manager.infrastructure.common.constant;

/** 业务错误码。 */
public enum BizErrorCode {
    /** 请求参数不符合业务约束。 */
    INVALID_REQUEST("ERR0400", "Invalid request"),
    /** 目标报文不存在。 */
    MESSAGE_NOT_FOUND("ERR0404", "Message does not exist");

    private final String code;
    private final String message;

    BizErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
}
