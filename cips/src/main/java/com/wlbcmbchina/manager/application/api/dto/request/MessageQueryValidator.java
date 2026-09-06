package com.wlbcmbchina.manager.application.api.dto.request;

import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

/**
 * 【2:跨字段校验器】校验单个注解无法表达的字段组合规则。
 *
 * <p>例如“金额条件出现时业务类型必填”依赖多个字段，不适合塞进 Controller，也不能只靠
 * {@code @NotNull}。校验器只判断输入是否合法，不修改请求对象，保持校验与规范化职责分离。</p>
 */
public class MessageQueryValidator implements ConstraintValidator<ValidMessageQuery, MessageQuery> {

    /**
     * 按 error-first 顺序校验：发现首个非法组合即返回，避免无效请求进入应用服务和数据库。
     * {@code query == null} 时返回 true，是因为对象是否必填应由使用位置的 {@code @NotNull} 负责。
     */
    @Override
    public boolean isValid(MessageQuery query, ConstraintValidatorContext context) {
        if (query == null) {
            return true;
        }

        if (query.getPageSize() != null && query.getPageSize() != 10 && query.getPageSize() != 20
                && query.getPageSize() != 50 && query.getPageSize() != 100) {
            return reject(context, "pageSize", "pageSize must be one of 10, 20, 50 or 100");
        }

        boolean hasAmountOrCurrency = query.getAmountFrom() != null
                || query.getAmountTo() != null
                || hasText(query.getCurrency());
        boolean hasBusinessDataFilter = hasAmountOrCurrency || hasText(query.getTranId());

        if (hasBusinessDataFilter && query.getBusinessType() == null) {
            return reject(context, "businessType", "Business Type is required for refTxn20, amount or currency");
        }
        if (hasText(query.getTranId()) && query.getBusinessType() != MessageBusinessType.PAY) {
            return reject(context, "tranId", "refTxn20 is only available for PAY messages");
        }
        if (hasAmountOrCurrency && query.getBusinessType() == MessageBusinessType.OTHER) {
            return reject(context, "businessType", "OTHER messages do not provide amount or currency");
        }
        if (query.getAmountFrom() != null && query.getAmountTo() != null
                && query.getAmountFrom().compareTo(query.getAmountTo()) > 0) {
            return reject(context, "amountFrom", "Amount From must not exceed Amount To");
        }
        if (query.getMsgDateFrom() != null && query.getMsgDateTo() != null
                && query.getMsgDateFrom().isAfter(query.getMsgDateTo())) {
            return reject(context, "msgDateFrom", "Date From must not be after Date To");
        }
        if ((query.getSortField() == null) != (query.getSortOrder() == null)) {
            return reject(context, "sortField", "sortField and sortOrder must be provided together");
        }
        if (query.getMsgDirection() == MessageDirection.IN && query.getMsgSendStatus() != null) {
            return reject(context, "msgSendStatus", "msgSendStatus is only available for OU messages");
        }
        if (query.getMsgDirection() == MessageDirection.OU && query.getMsgRecvStatus() != null) {
            return reject(context, "msgRecvStatus", "msgRecvStatus is only available for IN messages");
        }
        if (query.getMsgDirection() == MessageDirection.OU
                && (hasText(query.getMsgOwnerDept()) || hasText(query.getMsgOwnerGroup()))) {
            return reject(context, "msgOwnerDept", "message owner filters are only available for IN messages");
        }
        return true;
    }

    /** 将类级校验错误精确挂到字段上，便于异常处理器和前端定位问题。 */
    private boolean reject(ConstraintValidatorContext context, String property, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(property)
                .addConstraintViolation();
        return false;
    }

    /** 判断文本是否包含去除首尾空白后的有效内容，但不改写原请求值。 */
    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
