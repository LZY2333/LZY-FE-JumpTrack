package com.wlbcmbchina.manager.infrastructure.xml;

import com.wlbcmbchina.manager.infrastructure.common.config.CipsProperties;
import org.springframework.stereotype.Component;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.StringReader;

/** 使用 JDK StAX 以流式、禁用外部实体的方式读取 CIPS/ISO 20022 XML。 */
@Component
public class StaxCipsMessageParser {

    private final int maxCharacters;

    public StaxCipsMessageParser(CipsProperties cipsProperties) {
        this.maxCharacters = cipsProperties.getXmlMaxCharacters();
    }

    /** 读取通用头字段；不将整棵报文加载进内存。 */
    public CipsMessageHeader parseHeader(String xml) {
        if (xml == null || xml.trim().isEmpty()) {
            throw new CipsXmlParseException("CIPS XML must not be empty");
        }
        if (xml.charAt(0) == '\uFEFF') {
            throw new CipsXmlParseException("CIPS XML must not contain a UTF-8 BOM");
        }
        if (xml.length() > maxCharacters) {
            throw new CipsXmlParseException("CIPS XML exceeds the configured character limit");
        }

        XMLStreamReader reader = null;
        try {
            reader = createSecureFactory().createXMLStreamReader(new StringReader(xml));
            return readHeader(reader);
        } catch (XMLStreamException exception) {
            throw new CipsXmlParseException("Invalid or unsafe CIPS XML", exception);
        } finally {
            close(reader);
        }
    }

    private CipsMessageHeader readHeader(XMLStreamReader reader) throws XMLStreamException {
        String namespaceUri = null;
        String messageId = null;
        String creationDateTime = null;
        String uetr = null;

        while (reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.DTD || event == XMLStreamConstants.ENTITY_REFERENCE) {
                throw new XMLStreamException("DTD and entity references are forbidden");
            }
            if (event != XMLStreamConstants.START_ELEMENT) {
                continue;
            }
            String localName = reader.getLocalName();
            if (namespaceUri == null && "Document".equals(localName)) {
                namespaceUri = emptyToNull(reader.getNamespaceURI());
                continue;
            }
            if (messageId == null && ("MsgId".equals(localName) || "BizMsgIdr".equals(localName))) {
                messageId = readElementText(reader);
                continue;
            }
            if (creationDateTime == null && "CreDtTm".equals(localName)) {
                creationDateTime = readElementText(reader);
                continue;
            }
            if (uetr == null && "UETR".equals(localName)) {
                uetr = readElementText(reader);
            }
        }
        return new CipsMessageHeader(namespaceUri, messageDefinitionId(namespaceUri), messageId,
                creationDateTime, uetr);
    }

    private XMLInputFactory createSecureFactory() {
        XMLInputFactory factory = XMLInputFactory.newFactory();
        setProperty(factory, XMLInputFactory.SUPPORT_DTD, false);
        setProperty(factory, "javax.xml.stream.isSupportingExternalEntities", false);
        setProperty(factory, XMLInputFactory.IS_REPLACING_ENTITY_REFERENCES, false);
        factory.setXMLResolver((publicId, systemId, baseUri, namespace) -> {
            throw new XMLStreamException("External XML entities are forbidden");
        });
        return factory;
    }

    private void setProperty(XMLInputFactory factory, String property, Object value) {
        if (factory.isPropertySupported(property)) {
            factory.setProperty(property, value);
        }
    }

    private String readElementText(XMLStreamReader reader) throws XMLStreamException {
        return emptyToNull(reader.getElementText());
    }

    private String messageDefinitionId(String namespaceUri) {
        if (namespaceUri == null) {
            return null;
        }
        int separator = namespaceUri.lastIndexOf(':');
        return separator < 0 ? namespaceUri : emptyToNull(namespaceUri.substring(separator + 1));
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private void close(XMLStreamReader reader) {
        if (reader == null) {
            return;
        }
        try {
            reader.close();
        } catch (XMLStreamException ignored) {
            // Reader 已完成内存字符串解析，关闭失败不覆盖原始解析结果或异常。
        }
    }
}
