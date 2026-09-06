package com.wlbcmbchina.manager.infrastructure.common.constant;

/** 系统错误码。 */
public enum SysErrorCode {
    /** 未预期的服务端错误。 */
    INTERNAL_ERROR("ERR0500", "Internal server error");

    private final String code;
    private final String message;

    SysErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
}
