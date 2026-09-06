package com.wlbcmbchina.manager.infrastructure.message.dao.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessageBusinessSummaryPO;
import com.wlbcmbchina.manager.infrastructure.message.dao.po.MessagePO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 报文列表读模型 Mapper。
 *
 * <p>运行时对象由 MyBatis 创建：Java 方法通过 namespace + 方法名绑定 XML 中同名 SQL，调用者不需要手写实现类。</p>
 */
public interface MessageMapper {

    /** 【9:基础分页查询】从基本信息表和指定方向主表分页查询公共字段。 */
    IPage<MessagePO> selectMessagePage(Page<MessagePO> page,
                                       @Param("criteria") MessageQueryCriteria criteria);

    /** 【12:支付摘要批量查询】使用当前页支付报文 ID 批量读取，避免 N+1。 */
    List<MessageBusinessSummaryPO> selectPaymentSummaries(@Param("messageIds") List<String> messageIds);

    /** 【12:账单摘要批量查询】使用当前页账单报文 ID 批量读取，避免 N+1。 */
    List<MessageBusinessSummaryPO> selectBillSummaries(@Param("messageIds") List<String> messageIds);

    /** 【12:查询查复摘要批量查询】使用当前页查询查复报文 ID 批量读取，避免 N+1。 */
    List<MessageBusinessSummaryPO> selectQuerySummaries(@Param("messageIds") List<String> messageIds);
}
