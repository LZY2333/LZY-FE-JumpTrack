package com.wlbcmbchina.manager.domain.message.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** 报文列表允许的服务端排序字段白名单。 */
public enum MessageSortField {
    /** 按方向对应的收发日期排序。 */
    MSG_DATE("msgDate"),
    /** 按基本信息记录创建时间排序。 */
    CREATE_TIME("createTime"),
    /** 按基本信息记录更新时间排序。 */
    UPDATE_TIME("updateTime");

    private final String value;

    MessageSortField(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    /** 将接口值严格转换为排序字段。 */
    @JsonCreator
    public static MessageSortField fromValue(String value) {
        for (MessageSortField field : values()) {
            if (field.value.equals(value)) {
                return field;
            }
        }
        throw new IllegalArgumentException("Unsupported message sort field: " + value);
    }
}
