package com.wlbcmbchina.manager.domain.message.support;

import com.wlbcmbchina.manager.domain.message.model.Message;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.PageResult;

/**
 * 报文查询领域出站端口，隔离应用层与 MyBatis-Plus。
 *
 * <p>依赖方向从 application 指向 domain 抽象，再由 infrastructure 实现；替换数据库访问方案时，
 * 应用用例无须改成依赖某个 Mapper。</p>
 */
public interface MessageSupport {

    /** 【7:进入持久化端口】分页查询公共报文字段并补齐当前页业务金额摘要。 */
    PageResult<Message> queryPage(MessageQueryCriteria criteria);
}
