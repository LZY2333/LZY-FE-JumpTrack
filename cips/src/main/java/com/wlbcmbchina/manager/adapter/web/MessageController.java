package com.wlbcmbchina.manager.adapter.web;

import com.wlbcmbchina.manager.application.api.MessageApplicationService;
import com.wlbcmbchina.manager.application.api.dto.request.MessageQuery;
import com.wlbcmbchina.manager.application.api.dto.response.ApiResponse;
import com.wlbcmbchina.manager.application.api.dto.response.MessageDTO;
import com.wlbcmbchina.manager.application.api.dto.response.PageDTO;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

/**
 * 报文查询页面的 HTTP 适配器。
 *
 * <p>Adapter 层只负责 HTTP 协议相关工作：声明路由、接收请求 DTO、触发校验、调用应用用例并包装响应。
 * 它不应该编写 SQL、处理业务时区或拼装领域对象，否则同一用例将难以被定时任务、消息消费等入口复用。</p>
 */
@Validated
@RestController
@RequestMapping("/api/example/v1/messages")
public class MessageController {

    private final MessageApplicationService messageApplicationService;

    public MessageController(MessageApplicationService messageApplicationService) {
        this.messageApplicationService = messageApplicationService;
    }

    /**
     * 分页查询报文列表。
     *
     * <p>【1:请求路由与反序列化】Spring MVC 根据类级和方法级路径定位本方法，Jackson 将 JSON 请求体转换成
     * {@link MessageQuery}。JSON、枚举或日期格式错误时尚未进入方法体，直接走全局异常处理器。</p>
     *
     * <p>【2:请求参数校验】{@link Valid} 在进入方法体前触发字段约束和跨字段约束；约束之间默认不保证先后顺序，
     * 任一约束失败都会跳过后续业务调用并交给全局异常处理器。</p>
     *
     * <p>【3:进入 Web 适配器】校验通过后，Controller 只把请求委派给应用服务，不参与业务规则与数据库访问。</p>
     */
    @PostMapping("/query")
    public ApiResponse<PageDTO<MessageDTO>> queryMessages(@Valid @RequestBody MessageQuery query) {
        PageDTO<MessageDTO> page = messageApplicationService.queryMessages(query);

        // 【16:包装统一响应】应用服务返回后添加业务成功码。
        // 【17:响应序列化】方法返回后，Spring MVC 选择 JSON 消息转换器，由 Jackson 写入 HTTP 响应体。
        return ApiResponse.success(page);
    }
}
