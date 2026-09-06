package com.wlbcmbchina.manager.domain.message.model;

/** 发报处理状态，当前代码值待业务最终确认。 */
public enum MsgSendStatus {
    /** 待发送。 */
    S01,
    /** 发送中。 */
    S02,
    /** 已发送。 */
    S03,
    /** 发送失败。 */
    S04
}
