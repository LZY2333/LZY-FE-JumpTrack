package com.wlbcmbchina.manager.infrastructure.xml;

import com.wlbcmbchina.manager.infrastructure.common.config.CipsProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** 安全 StAX 解析器测试。 */
class StaxCipsMessageParserTest {

    @Test
    void shouldReadIso20022HeaderWithoutBuildingDom() {
        StaxCipsMessageParser parser = parser();
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08\">"
                + "<FIToFICstmrCdtTrf><GrpHdr><MsgId>CIPSIN20261231000001</MsgId>"
                + "<CreDtTm>2026-12-31T09:15:30</CreDtTm></GrpHdr>"
                + "<CdtTrfTxInf><PmtId><UETR>9f1c3f0e-1111-4b68-8e8a-9e6f8a1c2d3e</UETR>"
                + "</PmtId></CdtTrfTxInf></FIToFICstmrCdtTrf></Document>";

        CipsMessageHeader header = parser.parseHeader(xml);

        assertThat(header.getMessageDefinitionId()).isEqualTo("pacs.008.001.08");
        assertThat(header.getMessageId()).isEqualTo("CIPSIN20261231000001");
        assertThat(header.getCreationDateTime()).isEqualTo("2026-12-31T09:15:30");
        assertThat(header.getUetr()).isEqualTo("9f1c3f0e-1111-4b68-8e8a-9e6f8a1c2d3e");
    }

    @Test
    void shouldRejectDoctypeAndExternalEntity() {
        StaxCipsMessageParser parser = parser();
        String xml = "<!DOCTYPE Document [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>"
                + "<Document><MsgId>&xxe;</MsgId></Document>";

        assertThatThrownBy(() -> parser.parseHeader(xml))
                .isInstanceOf(CipsXmlParseException.class)
                .hasMessage("Invalid or unsafe CIPS XML");
    }

    @Test
    void shouldRejectUtf8BomRequiredByCipsTransportRules() {
        StaxCipsMessageParser parser = parser();

        assertThatThrownBy(() -> parser.parseHeader("\uFEFF<Document><MsgId>1</MsgId></Document>"))
                .isInstanceOf(CipsXmlParseException.class)
                .hasMessage("CIPS XML must not contain a UTF-8 BOM");
    }

    private StaxCipsMessageParser parser() {
        CipsProperties properties = new CipsProperties();
        properties.setXmlMaxCharacters(4096);
        return new StaxCipsMessageParser(properties);
    }
}
