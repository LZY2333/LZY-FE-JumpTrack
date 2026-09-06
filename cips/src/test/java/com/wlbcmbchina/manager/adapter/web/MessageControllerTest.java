package com.wlbcmbchina.manager.adapter.web;

import com.wlbcmbchina.manager.application.api.MessageApplicationService;
import com.wlbcmbchina.manager.application.api.dto.response.MessageDTO;
import com.wlbcmbchina.manager.application.api.dto.response.PageDTO;
import com.wlbcmbchina.manager.infrastructure.common.advice.DefaultExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** 报文查询接口契约与校验测试。 */
class MessageControllerTest {

    private MockMvc mockMvc;

    private MessageApplicationService messageApplicationService;

    @BeforeEach
    void setUp() {
        messageApplicationService = mock(MessageApplicationService.class);
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new MessageController(messageApplicationService))
                .setControllerAdvice(new DefaultExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void shouldReturnPagedMessages() throws Exception {
        when(messageApplicationService.queryMessages(any()))
                .thenReturn(new PageDTO<MessageDTO>(Collections.<MessageDTO>emptyList(), 1, 10, 0));

        mockMvc.perform(post("/api/example/v1/messages/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"msgDirection\":\"IN\",\"current\":1,\"pageSize\":10}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnCode").value("SUC0000"))
                .andExpect(jsonPath("$.body.list").isArray())
                .andExpect(jsonPath("$.body.current").value(1))
                .andExpect(jsonPath("$.body.pageSize").value(10))
                .andExpect(jsonPath("$.body.total").value(0));
    }

    @Test
    void shouldRequireBusinessTypeForAmountFilter() throws Exception {
        mockMvc.perform(post("/api/example/v1/messages/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"msgDirection\":\"IN\",\"amountFrom\":1000,\"current\":1,\"pageSize\":10}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.returnCode").value("ERR0400"))
                .andExpect(jsonPath("$.errorMsg").value(
                        "Business Type is required for refTxn20, amount or currency"));

        verify(messageApplicationService, never()).queryMessages(any());
    }

    @Test
    void shouldRejectDirectionSpecificStatusMismatch() throws Exception {
        mockMvc.perform(post("/api/example/v1/messages/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"msgDirection\":\"OU\",\"msgRecvStatus\":\"C01\",\"current\":1,\"pageSize\":10}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.returnCode").value("ERR0400"))
                .andExpect(jsonPath("$.errorMsg").value("msgRecvStatus is only available for IN messages"));
    }
}
