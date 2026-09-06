package com.wlbcmbchina.manager.infrastructure.message.supportimpl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.PageResult;
import com.wlbcmbchina.manager.infrastructure.message.dao.converter.MessageConverter;
import com.wlbcmbchina.manager.infrastructure.message.dao.mapper.MessageMapper;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessageBusinessSummaryPO;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessagePO;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** 当前页业务摘要批量补齐策略测试。 */
class MessageSupportImplTest {

    @Test
    @SuppressWarnings("unchecked")
    void shouldLoadAtMostOneBatchPerBusinessType() {
        MessageMapper mapper = mock(MessageMapper.class);
        MessageConverter converter = Mappers.getMapper(MessageConverter.class);
        MessageSupportImpl support = new MessageSupportImpl(mapper, converter);
        MessageQueryCriteria criteria = new MessageQueryCriteria();
        criteria.setCurrent(1);
        criteria.setPageSize(10);

        Page<MessagePO> databasePage = new Page<MessagePO>(1, 10);
        databasePage.setRecords(Arrays.asList(
                message("PAY-1", MessageBusinessType.PAY),
                message("PAY-2", MessageBusinessType.PAY),
                message("BILL-1", MessageBusinessType.BILL),
                message("QUERY-1", MessageBusinessType.QUERY),
                message("OTHER-1", MessageBusinessType.OTHER)));
        databasePage.setTotal(5);
        when(mapper.selectMessagePage(any(Page.class), any(MessageQueryCriteria.class))).thenReturn(databasePage);
        when(mapper.selectPaymentSummaries(Arrays.asList("PAY-1", "PAY-2")))
                .thenReturn(Arrays.asList(summary("PAY-1", "100.00"), summary("PAY-2", "200.00")));
        when(mapper.selectBillSummaries(Collections.singletonList("BILL-1")))
                .thenReturn(Collections.singletonList(summary("BILL-1", "300.00")));
        when(mapper.selectQuerySummaries(Collections.singletonList("QUERY-1")))
                .thenReturn(Collections.singletonList(summary("QUERY-1", "400.00")));

        PageResult<Message> result = support.queryPage(criteria);

        assertThat(result.getRecords()).extracting(Message::getAmount)
                .containsExactly("100.00", "200.00", "300.00", "400.00", null);
        verify(mapper).selectPaymentSummaries(Arrays.asList("PAY-1", "PAY-2"));
        verify(mapper).selectBillSummaries(Collections.singletonList("BILL-1"));
        verify(mapper).selectQuerySummaries(Collections.singletonList("QUERY-1"));
    }

    private MessagePO message(String msgId, MessageBusinessType businessType) {
        MessagePO message = new MessagePO();
        message.setMsgId(msgId);
        message.setBusinessType(businessType);
        return message;
    }

    private MessageBusinessSummaryPO summary(String msgId, String amount) {
        MessageBusinessSummaryPO summary = new MessageBusinessSummaryPO();
        summary.setMsgId(msgId);
        summary.setAmount(amount);
        summary.setCurrency("CNY");
        return summary;
    }
}
