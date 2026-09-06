package com.wlbcmbchina.manager.application.api.dto.request;

import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;
import com.wlbcmbchina.manager.domain.message.model.MessageSortField;
import com.wlbcmbchina.manager.domain.message.model.MessageSortOrder;
import com.wlbcmbchina.manager.domain.message.model.MsgRecvStatus;
import com.wlbcmbchina.manager.domain.message.model.MsgSendStatus;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Digits;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 【1:请求 DTO】报文分页查询的 HTTP 输入模型，由 Jackson 根据请求 JSON 创建并填充。
 *
 * <p>请求 DTO 表达“接口允许客户端传什么”，因此包含格式、长度和必填约束；它不会直接传给 Mapper，
 * 而会在应用层转换成 {@code MessageQueryCriteria}，防止 HTTP 协议模型渗透到领域与基础设施层。</p>
 */
@ValidMessageQuery
public class MessageQuery {

    /** 收发方向。 */
    @NotNull(message = "Direction is required")
    private MessageDirection msgDirection;

    /** 结构化业务类型。 */
    private MessageBusinessType businessType;

    /** 收报状态。 */
    private MsgRecvStatus msgRecvStatus;

    /** 发报状态。 */
    private MsgSendStatus msgSendStatus;

    /** 收发日期起点，按业务时区换算为自然日。 */
    private OffsetDateTime msgDateFrom;

    /** 收发日期终点，按业务时区换算为自然日。 */
    private OffsetDateTime msgDateTo;

    /** 含版本号的报文类型编码。 */
    @Size(max = 20)
    private String msgType;

    /** 报文业务流水号。 */
    @Size(max = 35)
    private String msgBusinessNo;

    /** 系统内报文标识号。 */
    @Size(max = 20)
    private String msgId;

    /** 支付类交易标识号。 */
    @Size(max = 35)
    private String tranId;

    /** ISO 4217 三位币种代码。 */
    @Pattern(regexp = "(?i)^[A-Z]{3}$", message = "currency must be a three-letter code")
    private String currency;

    /** 统一业务金额下限。 */
    @DecimalMin(value = "0", inclusive = true)
    @Digits(integer = 16, fraction = 2)
    private BigDecimal amountFrom;

    /** 统一业务金额上限。 */
    @DecimalMin(value = "0", inclusive = true)
    @Digits(integer = 16, fraction = 2)
    private BigDecimal amountTo;

    /** 报文收发通道。 */
    @Size(max = 10)
    private String msgChannel;

    /** 收报归属部门。 */
    @Size(max = 10)
    private String msgOwnerDept;

    /** 收报归属组。 */
    @Size(max = 10)
    private String msgOwnerGroup;

    /** 主报文编号。 */
    @Size(max = 20)
    private String mainMsgId;

    /** 关联流水号。 */
    @Size(max = 35)
    private String msgRelatedId;

    /** 端到端流水号。 */
    @Size(max = 35)
    private String msgEndId;

    /** UETR 唯一标识号。 */
    @Size(max = 36)
    private String msgUetr;

    /** 当前页码，从 1 开始。 */
    @NotNull(message = "current is required")
    @Min(value = 1, message = "current must be at least 1")
    private Integer current;

    /** 单页行数，只允许前端约定档位。 */
    @NotNull(message = "pageSize is required")
    private Integer pageSize;

    /** 排序字段白名单。 */
    private MessageSortField sortField;

    /** 排序方向。 */
    private MessageSortOrder sortOrder;

    public MessageDirection getMsgDirection() { return msgDirection; }
    public void setMsgDirection(MessageDirection msgDirection) { this.msgDirection = msgDirection; }
    public MessageBusinessType getBusinessType() { return businessType; }
    public void setBusinessType(MessageBusinessType businessType) { this.businessType = businessType; }
    public MsgRecvStatus getMsgRecvStatus() { return msgRecvStatus; }
    public void setMsgRecvStatus(MsgRecvStatus msgRecvStatus) { this.msgRecvStatus = msgRecvStatus; }
    public MsgSendStatus getMsgSendStatus() { return msgSendStatus; }
    public void setMsgSendStatus(MsgSendStatus msgSendStatus) { this.msgSendStatus = msgSendStatus; }
    public OffsetDateTime getMsgDateFrom() { return msgDateFrom; }
    public void setMsgDateFrom(OffsetDateTime msgDateFrom) { this.msgDateFrom = msgDateFrom; }
    public OffsetDateTime getMsgDateTo() { return msgDateTo; }
    public void setMsgDateTo(OffsetDateTime msgDateTo) { this.msgDateTo = msgDateTo; }
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
    public Integer getCurrent() { return current; }
    public void setCurrent(Integer current) { this.current = current; }
    public Integer getPageSize() { return pageSize; }
    public void setPageSize(Integer pageSize) { this.pageSize = pageSize; }
    public MessageSortField getSortField() { return sortField; }
    public void setSortField(MessageSortField sortField) { this.sortField = sortField; }
    public MessageSortOrder getSortOrder() { return sortOrder; }
    public void setSortOrder(MessageSortOrder sortOrder) { this.sortOrder = sortOrder; }
}
