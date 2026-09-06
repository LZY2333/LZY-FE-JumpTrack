package com.wlbcmbchina.manager.application.service;

import com.wlbcmbchina.manager.application.api.MessageApplicationService;
import com.wlbcmbchina.manager.application.api.dto.request.MessageQuery;
import com.wlbcmbchina.manager.application.api.dto.response.MessageDTO;
import com.wlbcmbchina.manager.application.api.dto.response.PageDTO;
import com.wlbcmbchina.manager.application.assembler.MessageAssembler;
import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.MessageSortField;
import com.wlbcmbchina.manager.domain.message.model.MessageSortOrder;
import com.wlbcmbchina.manager.domain.message.model.PageResult;
import com.wlbcmbchina.manager.domain.message.support.MessageSupport;
import com.wlbcmbchina.manager.infrastructure.common.config.CipsProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Locale;

/**
 * CIPS 报文查询用例的应用服务实现。
 *
 * <p>Application 层负责“按什么顺序完成一次用例”：对象转换、输入规范化、事务边界、调用领域端口和组装响应；
 * 它不关心 HTTP 路由，也不依赖 MyBatis 的 {@code Page}、Mapper 或数据库表结构。</p>
 */
@Service
public class MessageApplicationServiceImpl implements MessageApplicationService {

    private final MessageSupport messageSupport;
    private final MessageAssembler messageAssembler;
    private final ZoneId businessZoneId;

    public MessageApplicationServiceImpl(MessageSupport messageSupport,
                                         MessageAssembler messageAssembler,
                                         CipsProperties cipsProperties) {
        this.messageSupport = messageSupport;
        this.messageAssembler = messageAssembler;
        this.businessZoneId = ZoneId.of(cipsProperties.getBusinessZoneId());
    }

    /**
     * 在同一只读事务边界内完成基础分页及当前页金额摘要补齐。
     *
     * <p>【4:开启只读事务】Controller 注入的是 Spring 代理对象；调用进入本方法前，事务拦截器先开启事务，
     * 正常返回后提交/清理，运行时异常则回滚。{@code readOnly = true} 是只读提示和意图声明，不是数据库权限控制。</p>
     */
    @Override
    @Transactional(readOnly = true)
    public PageDTO<MessageDTO> queryMessages(MessageQuery query) {
        // 【5:请求模型转领域条件】MapStruct 生成实现，复制同名字段；日期字段暂时忽略，交给下一步按业务时区处理。
        MessageQueryCriteria criteria = messageAssembler.toCriteria(query);

        // 【6:规范化查询条件】统一处理时区、空白、大小写和默认排序，Mapper 只接收可直接查询的条件。
        normalizeCriteria(criteria, query);

        // 【7:调用领域出站端口】应用层只依赖 MessageSupport 抽象，具体 MyBatis 实现在 infrastructure 层。
        PageResult<Message> page = messageSupport.queryPage(criteria);

        // 【15:领域结果转响应 DTO】隔离领域模型与接口协议，避免数据库/领域字段无意暴露给前端。
        return messageAssembler.toPageDTO(page);
    }

    /**
     * 将已校验的接口值规范化为稳定查询值。
     * 注意这里负责“等价格式归一”，不重复第 2 步的合法性判断。
     */
    private void normalizeCriteria(MessageQueryCriteria criteria, MessageQuery query) {
        criteria.setMsgDateFrom(toBusinessDate(query.getMsgDateFrom()));
        criteria.setMsgDateTo(toBusinessDate(query.getMsgDateTo()));
        criteria.setMsgType(trimToNull(criteria.getMsgType()));
        criteria.setMsgBusinessNo(trimToNull(criteria.getMsgBusinessNo()));
        criteria.setMsgId(trimToNull(criteria.getMsgId()));
        criteria.setTranId(trimToNull(criteria.getTranId()));
        criteria.setCurrency(toUpperCase(criteria.getCurrency()));
        criteria.setMsgChannel(toUpperCase(criteria.getMsgChannel()));
        criteria.setMsgOwnerDept(trimToNull(criteria.getMsgOwnerDept()));
        criteria.setMsgOwnerGroup(trimToNull(criteria.getMsgOwnerGroup()));
        criteria.setMainMsgId(trimToNull(criteria.getMainMsgId()));
        criteria.setMsgRelatedId(trimToNull(criteria.getMsgRelatedId()));
        criteria.setMsgEndId(trimToNull(criteria.getMsgEndId()));
        criteria.setMsgUetr(trimToNull(criteria.getMsgUetr()));
        if (criteria.getSortField() == null) {
            criteria.setSortField(MessageSortField.CREATE_TIME);
            criteria.setSortOrder(MessageSortOrder.DESC);
        }
    }

    /** 将带偏移量的前端时刻换算成 CIPS 配置时区中的自然日，避免直接截断 UTC 日期导致跨日。 */
    private java.time.LocalDate toBusinessDate(OffsetDateTime value) {
        if (value == null) {
            return null;
        }
        return value.atZoneSameInstant(businessZoneId).toLocalDate();
    }

    /** 将代码类文本去除空白并按固定 Locale 转成大写，避免服务器默认 Locale 导致不一致。 */
    private String toUpperCase(String value) {
        String normalized = trimToNull(value);
        return normalized == null ? null : normalized.toUpperCase(Locale.ROOT);
    }

    /** 将空白字符串统一为 null，让 MyBatis 的动态 SQL 可以只判断一种“未填写”状态。 */
    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
