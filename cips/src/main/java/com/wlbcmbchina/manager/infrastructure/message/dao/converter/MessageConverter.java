package com.wlbcmbchina.manager.infrastructure.message.dao.converter;

import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessageBusinessSummaryPO;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessagePO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * 【13:持久化模型转领域模型】合并 DAO 查询结果，阻止数据库读模型 {@link MessagePO} 越过基础设施边界。
 * MapStruct 在编译期生成实现，并由 Spring 注册为 Bean。
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MessageConverter {

    /** 合并公共字段与按类型批量查询的业务摘要；摘要为空时对应的金额、币种和交易号保持 null。 */
    @Mapping(target = "msgId", source = "message.msgId")
    @Mapping(target = "amount", source = "summary.amount")
    @Mapping(target = "currency", source = "summary.currency")
    @Mapping(target = "tranId", source = "summary.tranId")
    Message toDomain(MessagePO message, MessageBusinessSummaryPO summary);
}
