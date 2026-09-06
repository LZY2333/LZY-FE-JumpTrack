package com.wlbcmbchina.manager.infrastructure.xml;

/** 从 CIPS/ISO 20022 XML 安全提取出的通用报文头。 */
public class CipsMessageHeader {

    /** Document 根节点命名空间。 */
    private final String namespaceUri;

    /** 从命名空间识别出的报文定义标识。 */
    private final String messageDefinitionId;

    /** 报文标识号。 */
    private final String messageId;

    /** 报文创建时间原始值。 */
    private final String creationDateTime;

    /** UETR 唯一标识号。 */
    private final String uetr;

    public CipsMessageHeader(String namespaceUri,
                             String messageDefinitionId,
                             String messageId,
                             String creationDateTime,
                             String uetr) {
        this.namespaceUri = namespaceUri;
        this.messageDefinitionId = messageDefinitionId;
        this.messageId = messageId;
        this.creationDateTime = creationDateTime;
        this.uetr = uetr;
    }

    public String getNamespaceUri() { return namespaceUri; }
    public String getMessageDefinitionId() { return messageDefinitionId; }
    public String getMessageId() { return messageId; }
    public String getCreationDateTime() { return creationDateTime; }
    public String getUetr() { return uetr; }
}
