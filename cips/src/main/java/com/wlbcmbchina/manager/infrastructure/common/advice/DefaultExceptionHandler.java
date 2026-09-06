package com.wlbcmbchina.manager.infrastructure.common.advice;

import com.wlbcmbchina.manager.application.api.dto.response.ApiResponse;
import com.wlbcmbchina.manager.infrastructure.common.constant.BizErrorCode;
import com.wlbcmbchina.manager.infrastructure.common.constant.SysErrorCode;
import com.wlbcmbchina.manager.infrastructure.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.validation.ConstraintViolationException;

/**
 * 调用链异常出口：将框架异常和业务异常收敛为稳定的前端响应协议。
 *
 * <p>第 1 步反序列化失败、第 2 步校验失败都发生在 Controller 方法体之前；第 4-15 步抛出的异常则从调用栈
 * 向外传播。Spring MVC 最终在这里选择最匹配的处理方法，避免每个 Controller 重复 try/catch。</p>
 */
@RestControllerAdvice
public class DefaultExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultExceptionHandler.class);

    /** 【异常分支:校验失败】处理第 2 步的请求体 Bean Validation 错误，返回 HTTP 400。 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
        return badRequest(firstValidationMessage(exception));
    }

    /** 处理绑定参数校验错误。 */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Void>> handleBind(BindException exception) {
        FieldError error = exception.getBindingResult().getFieldError();
        return badRequest(error == null ? BizErrorCode.INVALID_REQUEST.getMessage() : error.getDefaultMessage());
    }

    /** 处理路径参数等约束错误。 */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
        return badRequest(exception.getMessage());
    }

    /** 【异常分支:反序列化失败】处理第 1 步的 JSON、枚举值和日期格式错误，返回 HTTP 400。 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadableMessage(HttpMessageNotReadableException exception) {
        return badRequest("Malformed JSON or unsupported field value");
    }

    /** 处理明确的业务异常。 */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException exception) {
        BizErrorCode code = exception.getErrorCode();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>failure(code.getCode(), exception.getMessage()));
    }

    /** 【异常分支:未预期异常】记录完整服务端堆栈并返回通用 500，避免泄露 SQL、表名等内部细节。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
        LOGGER.error("Unhandled request exception", exception);
        SysErrorCode code = SysErrorCode.INTERNAL_ERROR;
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>failure(code.getCode(), code.getMessage()));
    }

    private ResponseEntity<ApiResponse<Void>> badRequest(String message) {
        BizErrorCode code = BizErrorCode.INVALID_REQUEST;
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Void>failure(code.getCode(), message));
    }

    private String firstValidationMessage(MethodArgumentNotValidException exception) {
        FieldError error = exception.getBindingResult().getFieldError();
        if (error != null && error.getDefaultMessage() != null) {
            return error.getDefaultMessage();
        }
        return BizErrorCode.INVALID_REQUEST.getMessage();
    }
}
