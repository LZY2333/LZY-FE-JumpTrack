package com.wlbcmbchina.manager.application.api.dto.response;

import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;
import com.wlbcmbchina.manager.domain.message.model.MsgRecvStatus;
import com.wlbcmbchina.manager.domain.message.model.MsgSendStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** 报文列表统一展示对象，所有可空字段均显式输出 null。 */
public class MessageDTO {

    /** 报文标识号。 */
    private String msgId;
    /** 报文收发方向。 */
    private MessageDirection msgDirection;
    /** 结构化业务类型。 */
    private MessageBusinessType businessType;
    /** 收发报通道。 */
    private String msgChannel;
    /** 含版本号的报文类型。 */
    private String msgType;
    /** 业务流水号。 */
    private String msgBusinessNo;
    /** 按业务类型映射的统一金额。 */
    private String amount;
    /** 按业务类型映射的统一币种。 */
    private String currency;
    /** 支付类交易标识号。 */
    private String tranId;
    /** 收报状态。 */
    private MsgRecvStatus msgRecvStatus;
    /** 发报状态。 */
    private MsgSendStatus msgSendStatus;
    /** 方向对应的收发日期。 */
    private LocalDate msgDate;
    /** UETR 唯一标识号。 */
    private String msgUetr;
    /** 收报归属部门。 */
    private String msgOwnerDept;
    /** 收报归属组。 */
    private String msgOwnerGroup;
    /** 主报文编号。 */
    private String mainMsgId;
    /** 关联流水号。 */
    private String msgRelatedId;
    /** 端到端流水号。 */
    private String msgEndId;
    /** 基本信息创建时间。 */
    private LocalDateTime createTime;
    /** 基本信息更新时间。 */
    private LocalDateTime updateTime;
    /** 备注。 */
    private String remark;
    /** 原报文记录的发送时间。 */
    private String msgSendTime;
    /** 非直通原因。 */
    private String nonStpReason;
    /** 创建人。 */
    private String createUser;
    /** 创建人部门号。 */
    private String createBrno;
    /** 审批人。 */
    private String authorUser;
    /** 审批人部门号。 */
    private String authorBrno;

    public String getMsgId() { return msgId; }
    public void setMsgId(String msgId) { this.msgId = msgId; }
    public MessageDirection getMsgDirection() { return msgDirection; }
    public void setMsgDirection(MessageDirection msgDirection) { this.msgDirection = msgDirection; }
    public MessageBusinessType getBusinessType() { return businessType; }
    public void setBusinessType(MessageBusinessType businessType) { this.businessType = businessType; }
    public String getMsgChannel() { return msgChannel; }
    public void setMsgChannel(String msgChannel) { this.msgChannel = msgChannel; }
    public String getMsgType() { return msgType; }
    public void setMsgType(String msgType) { this.msgType = msgType; }
    public String getMsgBusinessNo() { return msgBusinessNo; }
    public void setMsgBusinessNo(String msgBusinessNo) { this.msgBusinessNo = msgBusinessNo; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getTranId() { return tranId; }
    public void setTranId(String tranId) { this.tranId = tranId; }
    public MsgRecvStatus getMsgRecvStatus() { return msgRecvStatus; }
    public void setMsgRecvStatus(MsgRecvStatus msgRecvStatus) { this.msgRecvStatus = msgRecvStatus; }
    public MsgSendStatus getMsgSendStatus() { return msgSendStatus; }
    public void setMsgSendStatus(MsgSendStatus msgSendStatus) { this.msgSendStatus = msgSendStatus; }
    public LocalDate getMsgDate() { return msgDate; }
    public void setMsgDate(LocalDate msgDate) { this.msgDate = msgDate; }
    public String getMsgUetr() { return msgUetr; }
    public void setMsgUetr(String msgUetr) { this.msgUetr = msgUetr; }
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
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public String getMsgSendTime() { return msgSendTime; }
    public void setMsgSendTime(String msgSendTime) { this.msgSendTime = msgSendTime; }
    public String getNonStpReason() { return nonStpReason; }
    public void setNonStpReason(String nonStpReason) { this.nonStpReason = nonStpReason; }
    public String getCreateUser() { return createUser; }
    public void setCreateUser(String createUser) { this.createUser = createUser; }
    public String getCreateBrno() { return createBrno; }
    public void setCreateBrno(String createBrno) { this.createBrno = createBrno; }
    public String getAuthorUser() { return authorUser; }
    public void setAuthorUser(String authorUser) { this.authorUser = authorUser; }
    public String getAuthorBrno() { return authorBrno; }
    public void setAuthorBrno(String authorBrno) { this.authorBrno = authorBrno; }
}
