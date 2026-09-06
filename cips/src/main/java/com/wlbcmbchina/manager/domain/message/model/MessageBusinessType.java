package com.wlbcmbchina.manager.domain.message.model;

/** 报文结构化业务类型。 */
public enum MessageBusinessType {
    /** 支付类。 */
    PAY,
    /** 账单类。 */
    BILL,
    /** 查询查复类。 */
    QUERY,
    /** 暂无专用结构化字段的其他类。 */
    OTHER
}
