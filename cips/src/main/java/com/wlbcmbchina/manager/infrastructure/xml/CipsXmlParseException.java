package com.wlbcmbchina.manager.infrastructure.xml;

/** CIPS XML 不合法、超限或包含不安全结构。 */
public class CipsXmlParseException extends RuntimeException {

    public CipsXmlParseException(String message) {
        super(message);
    }

    public CipsXmlParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
