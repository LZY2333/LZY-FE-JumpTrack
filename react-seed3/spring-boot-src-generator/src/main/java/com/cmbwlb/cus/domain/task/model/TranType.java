package com.cmbwlb.cus.domain.task.model;

public enum TranType {

    DAILY_REPORT("T01"),
    ANNUAL_REPORT("T02"),
    AD_HOC_REPORT("T03"),
    AIP_REPORT("T04"),
    INFORMATION_AMENDMENT("T05");

    private final String code;

    TranType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static TranType fromCode(String code) {
        if (code == null) {
            return null;
        }
        for (TranType value : values()) {
            if (value.code.equals(code)) {
                return value;
            }
        }
        throw new IllegalArgumentException("不支持的交易类型：" + code);
    }
}
