package com.wlbcmbchina.manager.domain.message.model;

/** 收报处理状态。 */
public enum MsgRecvStatus {
    /** 任务已创建。 */
    C01,
    /** 报文解析中。 */
    P01,
    /** 报文解析失败。 */
    P02,
    /** 归属判定中。 */
    B01,
    /** 待手工判定归属。 */
    B02,
    /** 反洗钱扫描中。 */
    L01,
    /** 报文分发中。 */
    D01,
    /** 报文分发完成。 */
    D02
}
