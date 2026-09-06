package com.wlbcmbchina.manager.domain.message.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** 报文列表排序方向。 */
public enum MessageSortOrder {
    /** 升序。 */
    ASC("asc"),
    /** 降序。 */
    DESC("desc");

    private final String value;

    MessageSortOrder(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    /** 将接口值严格转换为排序方向。 */
    @JsonCreator
    public static MessageSortOrder fromValue(String value) {
        for (MessageSortOrder order : values()) {
            if (order.value.equals(value)) {
                return order;
            }
        }
        throw new IllegalArgumentException("Unsupported message sort order: " + value);
    }
}
