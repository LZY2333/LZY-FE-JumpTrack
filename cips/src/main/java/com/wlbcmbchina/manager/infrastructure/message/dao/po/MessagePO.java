package com.wlbcmbchina.manager.infrastructure.message.dao.po;

import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;
import com.wlbcmbchina.manager.domain.message.model.MsgRecvStatus;
import com.wlbcmbchina.manager.domain.message.model.MsgSendStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** 公共信息表与方向主表联查结果。 */
public class MessagePO {

    private String msgId;
    private MessageDirection msgDirection;
    private MessageBusinessType businessType;
    private String msgChannel;
    private String msgType;
    private String msgBusinessNo;
    private MsgRecvStatus msgRecvStatus;
    private MsgSendStatus msgSendStatus;
    private LocalDate msgDate;
    private String msgUetr;
    private String msgOwnerDept;
    private String msgOwnerGroup;
    private String mainMsgId;
    private String msgRelatedId;
    private String msgEndId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String remark;
    private String msgSendTime;
    private String nonStpReason;
    private String createUser;
    private String createBrno;
    private String authorUser;
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
