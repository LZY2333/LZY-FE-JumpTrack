package com.wlbcmbchina.manager.domain.message.model;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 【5-6:领域查询条件】已经过接口校验、应用层转换和规范化的报文分页查询条件。
 *
 * <p>它不携带 Jackson、Bean Validation 或 MyBatis 类型，使查询意图独立于入站协议和持久化框架。</p>
 */
public class MessageQueryCriteria {

    private MessageDirection msgDirection;
    private MessageBusinessType businessType;
    private MsgRecvStatus msgRecvStatus;
    private MsgSendStatus msgSendStatus;
    private LocalDate msgDateFrom;
    private LocalDate msgDateTo;
    private String msgType;
    private String msgBusinessNo;
    private String msgId;
    private String tranId;
    private String currency;
    private BigDecimal amountFrom;
    private BigDecimal amountTo;
    private String msgChannel;
    private String msgOwnerDept;
    private String msgOwnerGroup;
    private String mainMsgId;
    private String msgRelatedId;
    private String msgEndId;
    private String msgUetr;
    private long current;
    private long pageSize;
    private MessageSortField sortField;
    private MessageSortOrder sortOrder;

    /**
     * 是否需要访问业务金额来源表参与筛选。
     * MyBatis 通过 JavaBean 规则把 {@code isBusinessDataFilter()} 识别为 OGNL 属性
     * {@code criteria.businessDataFilter}。
     */
    public boolean isBusinessDataFilter() {
        return tranId != null || currency != null || amountFrom != null || amountTo != null;
    }

    public MessageDirection getMsgDirection() { return msgDirection; }
    public void setMsgDirection(MessageDirection msgDirection) { this.msgDirection = msgDirection; }
    public MessageBusinessType getBusinessType() { return businessType; }
    public void setBusinessType(MessageBusinessType businessType) { this.businessType = businessType; }
    public MsgRecvStatus getMsgRecvStatus() { return msgRecvStatus; }
    public void setMsgRecvStatus(MsgRecvStatus msgRecvStatus) { this.msgRecvStatus = msgRecvStatus; }
    public MsgSendStatus getMsgSendStatus() { return msgSendStatus; }
    public void setMsgSendStatus(MsgSendStatus msgSendStatus) { this.msgSendStatus = msgSendStatus; }
    public LocalDate getMsgDateFrom() { return msgDateFrom; }
    public void setMsgDateFrom(LocalDate msgDateFrom) { this.msgDateFrom = msgDateFrom; }
    public LocalDate getMsgDateTo() { return msgDateTo; }
    public void setMsgDateTo(LocalDate msgDateTo) { this.msgDateTo = msgDateTo; }
    public String getMsgType() { return msgType; }
    public void setMsgType(String msgType) { this.msgType = msgType; }
    public String getMsgBusinessNo() { return msgBusinessNo; }
    public void setMsgBusinessNo(String msgBusinessNo) { this.msgBusinessNo = msgBusinessNo; }
    public String getMsgId() { return msgId; }
    public void setMsgId(String msgId) { this.msgId = msgId; }
    public String getTranId() { return tranId; }
    public void setTranId(String tranId) { this.tranId = tranId; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getAmountFrom() { return amountFrom; }
    public void setAmountFrom(BigDecimal amountFrom) { this.amountFrom = amountFrom; }
    public BigDecimal getAmountTo() { return amountTo; }
    public void setAmountTo(BigDecimal amountTo) { this.amountTo = amountTo; }
    public String getMsgChannel() { return msgChannel; }
    public void setMsgChannel(String msgChannel) { this.msgChannel = msgChannel; }
    public String getMsgOwnerDept() { return msgOwnerDept; }
    public void setMsgOwnerDept(String msgOwnerDept) { this.msgOwnerDept = msgOwnerDept; }
    public String getMsgOwnerGroup() { return msgOwnerGroup; }
    public void setMsgOwnerGroup(String msgOwnerGroup) { this.msgOwnerGroup = msgOwnerGroup; }
    public String getMainMsgId() { return mainMsgId; }
    public void setMainMsgId(String mainMsgId) { this.mainMsgId = mainMsgId; }
    public String getMsgRelatedId() { return msgRelatedId; }
    public void setMsgRelatedId(String msgRelatedId) { this.msgRelatedId = msgRelatedId; }
    public String getMsgEndId() { return msgEndId; }
    public void setMsgEndId(String msgEndId) { this.msgEndId = msgEndId; }
    public String getMsgUetr() { return msgUetr; }
    public void setMsgUetr(String msgUetr) { this.msgUetr = msgUetr; }
    public long getCurrent() { return current; }
    public void setCurrent(long current) { this.current = current; }
    public long getPageSize() { return pageSize; }
    public void setPageSize(long pageSize) { this.pageSize = pageSize; }
    public MessageSortField getSortField() { return sortField; }
    public void setSortField(MessageSortField sortField) { this.sortField = sortField; }
    public MessageSortOrder getSortOrder() { return sortOrder; }
    public void setSortOrder(MessageSortOrder sortOrder) { this.sortOrder = sortOrder; }
}
