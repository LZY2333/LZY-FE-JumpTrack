package com.wlbcmbchina.manager.application.api;

import com.wlbcmbchina.manager.application.api.dto.request.MessageQuery;
import com.wlbcmbchina.manager.application.api.dto.response.MessageDTO;
import com.wlbcmbchina.manager.application.api.dto.response.PageDTO;

/**
 * CIPS 报文应用服务（入站端口）。
 *
 * <p>接口向 Controller 暴露稳定的用例能力，使 Web 层依赖抽象而非实现；实现类负责业务流程编排。</p>
 */
public interface MessageApplicationService {

    /** 【3:调用应用用例】按页面筛选条件分页查询报文。 */
    PageDTO<MessageDTO> queryMessages(MessageQuery query);
}
