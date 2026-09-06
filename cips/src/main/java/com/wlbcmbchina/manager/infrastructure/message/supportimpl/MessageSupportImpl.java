package com.wlbcmbchina.manager.infrastructure.message.supportimpl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.PageResult;
import com.wlbcmbchina.manager.domain.message.support.MessageSupport;
import com.wlbcmbchina.manager.infrastructure.message.dao.converter.MessageConverter;
import com.wlbcmbchina.manager.infrastructure.message.dao.mapper.MessageMapper;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessageBusinessSummaryPO;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessagePO;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 基于 MyBatis-Plus 的报文查询领域端口实现（Repository Adapter）。
 *
 * <p>Infrastructure 层在此把领域查询条件翻译为持久化调用，并把数据库 PO 转回领域模型；
 * MyBatis 类型被限制在本层之内，不向应用服务泄漏。</p>
 */
@Repository
public class MessageSupportImpl implements MessageSupport {

    private final MessageMapper messageMapper;
    private final MessageConverter messageConverter;

    public MessageSupportImpl(MessageMapper messageMapper, MessageConverter messageConverter) {
        this.messageMapper = messageMapper;
        this.messageConverter = messageConverter;
    }

    /**
     * 基础查询不联查三类业务表，只针对当前页按类型批量补齐展示字段。
     * 这种“先分页、后批量补齐”策略避免多表联查造成行膨胀，也避免逐条查询导致 N+1 问题。
     */
    @Override
    public PageResult<Message> queryPage(MessageQueryCriteria criteria) {
        // 【8:创建持久化分页参数】第三个参数 true 表示需要查询 total；该 MyBatis Page 只存在于基础设施层。
        Page<MessagePO> requestPage = new Page<MessagePO>(criteria.getCurrent(), criteria.getPageSize(), true);

        // 【9:执行基础分页 SQL】Mapper 代理查公共表和方向主表；分页拦截器追加 count 与 LIMIT，并映射成 MessagePO。
        IPage<MessagePO> resultPage = messageMapper.selectMessagePage(requestPage, criteria);
        List<MessagePO> records = resultPage.getRecords();

        // 【10:空页快速返回】没有记录时不再访问三张业务摘要表，减少无意义 SQL。
        if (records == null || records.isEmpty()) {
            return new PageResult<Message>(Collections.<Message>emptyList(), resultPage.getCurrent(),
                    resultPage.getSize(), resultPage.getTotal());
        }

        // 【11-12:分组并批量补齐摘要】当前页按业务类型分组，每种类型最多执行一次 IN 查询。
        Map<String, MessageBusinessSummaryPO> summaries = loadBusinessSummaries(records);
        List<Message> messages = new ArrayList<Message>(records.size());
        for (MessagePO record : records) {
            // 【13:PO 转领域模型】按 MSG_ID 合并公共字段和业务摘要；OTHER 或缺失摘要时 summary 可以为 null。
            messages.add(messageConverter.toDomain(record, summaries.get(record.getMsgId())));
        }

        // 【14:返回领域分页结果】剥离 MyBatis IPage，应用层只看到框架无关的 PageResult。
        return new PageResult<Message>(messages, resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
    }

    /** 【11:按业务类型分组】只收集当前页 PAY、BILL、QUERY 的主键，OTHER 不需要摘要。 */
    private Map<String, MessageBusinessSummaryPO> loadBusinessSummaries(List<MessagePO> records) {
        Map<MessageBusinessType, List<String>> idsByType = new EnumMap<MessageBusinessType, List<String>>(
                MessageBusinessType.class);
        for (MessagePO record : records) {
            MessageBusinessType businessType = record.getBusinessType();
            if (businessType == null || businessType == MessageBusinessType.OTHER) {
                continue;
            }
            List<String> messageIds = idsByType.get(businessType);
            if (messageIds == null) {
                messageIds = new ArrayList<String>();
                idsByType.put(businessType, messageIds);
            }
            messageIds.add(record.getMsgId());
        }

        Map<String, MessageBusinessSummaryPO> summaries = new HashMap<String, MessageBusinessSummaryPO>();
        // 【12:有界批量查询】最多三次 SQL，而不是每条报文一次 SQL；次数随业务类型数增长，不随页大小增长。
        merge(summaries, selectSummaries(idsByType, MessageBusinessType.PAY));
        merge(summaries, selectSummaries(idsByType, MessageBusinessType.BILL));
        merge(summaries, selectSummaries(idsByType, MessageBusinessType.QUERY));
        return summaries;
    }

    /** 根据业务类型选择对应的物理表；空分组直接返回，禁止生成非法的 {@code IN ()}。 */
    private List<MessageBusinessSummaryPO> selectSummaries(
            Map<MessageBusinessType, List<String>> idsByType,
            MessageBusinessType businessType) {
        List<String> messageIds = idsByType.get(businessType);
        if (messageIds == null || messageIds.isEmpty()) {
            return Collections.emptyList();
        }
        if (businessType == MessageBusinessType.PAY) {
            return messageMapper.selectPaymentSummaries(messageIds);
        }
        if (businessType == MessageBusinessType.BILL) {
            return messageMapper.selectBillSummaries(messageIds);
        }
        return messageMapper.selectQuerySummaries(messageIds);
    }

    /** 将批量结果建立为 MSG_ID 索引，使第 13 步逐条合并由线性查找降为近似 O(1)。 */
    private void merge(Map<String, MessageBusinessSummaryPO> target,
                       List<MessageBusinessSummaryPO> source) {
        if (source == null || source.isEmpty()) {
            return;
        }
        for (MessageBusinessSummaryPO summary : source) {
            target.put(summary.getMsgId(), summary);
        }
    }
}
