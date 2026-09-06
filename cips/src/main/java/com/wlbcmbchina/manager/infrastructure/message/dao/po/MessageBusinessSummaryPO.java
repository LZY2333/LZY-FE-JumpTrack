package com.wlbcmbchina.manager.infrastructure.message.dao.po;

/** 当前页报文需要展示的最小业务摘要。 */
public class MessageBusinessSummaryPO {

    private String msgId;
    private String amount;
    private String currency;
    private String tranId;

    public String getMsgId() { return msgId; }
    public void setMsgId(String msgId) { this.msgId = msgId; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getTranId() { return tranId; }
    public void setTranId(String tranId) { this.tranId = tranId; }
}
