package com.wlbcmbchina.manager.infrastructure.common.exception;

import com.wlbcmbchina.manager.infrastructure.common.constant.BizErrorCode;

/** 可安全返回给调用方的业务异常。 */
public class BusinessException extends RuntimeException {

    private final BizErrorCode errorCode;

    public BusinessException(BizErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(BizErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public BizErrorCode getErrorCode() {
        return errorCode;
    }
}
