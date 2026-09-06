package com.wlbcmbchina.manager.application.service;

import com.wlbcmbchina.manager.application.api.dto.request.MessageQuery;
import com.wlbcmbchina.manager.application.assembler.MessageAssembler;
import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.MessageSortField;
import com.wlbcmbchina.manager.domain.message.model.MessageSortOrder;
import com.wlbcmbchina.manager.domain.message.model.PageResult;
import com.wlbcmbchina.manager.domain.message.support.MessageSupport;
import com.wlbcmbchina.manager.infrastructure.common.config.CipsProperties;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** 报文查询应用编排测试。 */
class MessageApplicationServiceImplTest {

    @Test
    void shouldNormalizeUtcBoundariesToBusinessDates() {
        MessageSupport support = mock(MessageSupport.class);
        MessageAssembler assembler = Mappers.getMapper(MessageAssembler.class);
        CipsProperties properties = new CipsProperties();
        properties.setBusinessZoneId("Asia/Shanghai");
        MessageApplicationServiceImpl service = new MessageApplicationServiceImpl(support, assembler, properties);
        when(support.queryPage(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new PageResult<Message>(Collections.<Message>emptyList(), 1, 10, 0));

        MessageQuery query = new MessageQuery();
        query.setMsgDirection(MessageDirection.IN);
        query.setMsgDateFrom(OffsetDateTime.parse("2026-08-21T16:00:00Z"));
        query.setMsgDateTo(OffsetDateTime.parse("2026-08-22T15:59:59.999Z"));
        query.setCurrency(" cny ");
        query.setCurrent(1);
        query.setPageSize(10);

        service.queryMessages(query);

        ArgumentCaptor<MessageQueryCriteria> captor = ArgumentCaptor.forClass(MessageQueryCriteria.class);
        verify(support).queryPage(captor.capture());
        MessageQueryCriteria criteria = captor.getValue();
        assertThat(criteria.getMsgDateFrom()).isEqualTo(LocalDate.of(2026, 8, 22));
        assertThat(criteria.getMsgDateTo()).isEqualTo(LocalDate.of(2026, 8, 22));
        assertThat(criteria.getCurrency()).isEqualTo("CNY");
        assertThat(criteria.getSortField()).isEqualTo(MessageSortField.CREATE_TIME);
        assertThat(criteria.getSortOrder()).isEqualTo(MessageSortOrder.DESC);
    }
}
