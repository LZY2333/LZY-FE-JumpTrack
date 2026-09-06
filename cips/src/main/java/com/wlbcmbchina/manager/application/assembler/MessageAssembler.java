package com.wlbcmbchina.manager.application.assembler;

import com.wlbcmbchina.manager.application.api.dto.request.MessageQuery;
import com.wlbcmbchina.manager.application.api.dto.response.MessageDTO;
import com.wlbcmbchina.manager.application.api.dto.response.PageDTO;
import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * 应用层请求、领域对象与响应对象转换器。
 *
 * <p>MapStruct 在编译期生成普通 Java 映射代码；这里声明边界转换规则，业务编排不必堆积机械的 getter/setter。</p>
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface MessageAssembler {

    /** 【5:请求转查询条件】复制同名字段；业务日期必须由服务按配置时区转换，故在此显式忽略。 */
    @Mapping(target = "msgDateFrom", ignore = true)
    @Mapping(target = "msgDateTo", ignore = true)
    MessageQueryCriteria toCriteria(MessageQuery query);

    /** 【15:领域对象转 DTO】只把接口契约允许的字段交给 Web 层。 */
    MessageDTO toDTO(Message message);

    /** 【15:批量转换 DTO】MapStruct 复用 {@link #toDTO(Message)} 逐条转换。 */
    List<MessageDTO> toDTOs(List<Message> messages);

    /** 【15:组装分页 DTO】转换当前页记录，并保留领域分页元数据。 */
    default PageDTO<MessageDTO> toPageDTO(PageResult<Message> page) {
        return new PageDTO<MessageDTO>(toDTOs(page.getRecords()), page.getCurrent(), page.getPageSize(), page.getTotal());
    }
}
