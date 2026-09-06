package com.wlbcmbchina.manager.infrastructure.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

/** CIPS 业务级配置。 */
@Validated
@ConfigurationProperties(prefix = "cips")
public class CipsProperties {

    /** CIPS 业务日期采用的时区。 */
    @NotBlank
    private String businessZoneId = "Asia/Shanghai";

    /** 单个待解析 XML 的最大字符数。 */
    @Min(1024)
    private int xmlMaxCharacters = 2 * 1024 * 1024;

    public String getBusinessZoneId() {
        return businessZoneId;
    }

    public void setBusinessZoneId(String businessZoneId) {
        this.businessZoneId = businessZoneId;
    }

    public int getXmlMaxCharacters() {
        return xmlMaxCharacters;
    }

    public void setXmlMaxCharacters(int xmlMaxCharacters) {
        this.xmlMaxCharacters = xmlMaxCharacters;
    }
}
