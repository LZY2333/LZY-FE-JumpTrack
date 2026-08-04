package com.cmbwlb.cus.adapter.controller;

import com.cmbwlb.cus.Application;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = Application.class)
@AutoConfigureMockMvc
class TaskControllerIntegrationTest {

    private static final String ENDPOINT = "/api/cies/v1/task/getTasks";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnFirstPageWithStableDefaultOrder() throws Exception {
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"current\":1,\"pageSize\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.pageSize").value(2))
                .andExpect(jsonPath("$.data.total").value(6))
                .andExpect(jsonPath("$.data.list.length()").value(2))
                .andExpect(jsonPath("$.data.list[0].taskId")
                        .value("TK2026080300000006"));
    }

    @Test
    void shouldFilterByStatus() throws Exception {
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"current\":1,\"pageSize\":10,\"status\":\"S01\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(2))
                .andExpect(jsonPath("$.data.list[0].taskStatus").value("S01"))
                .andExpect(jsonPath("$.data.list[1].taskStatus").value("S01"));
    }

    @Test
    void shouldIncludeTheWholeEndDate() throws Exception {
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"current\":1,\"pageSize\":100,"
                                + "\"createTimeTo\":\"2026-08-01\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(4))
                .andExpect(jsonPath("$.data.list[0].taskId")
                        .value("TK2026080100000004"));
    }

    @Test
    void shouldApplyWhitelistedAscendingSort() throws Exception {
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"current\":1,\"pageSize\":10,"
                                + "\"sortField\":\"transactionTime\","
                                + "\"sortOrder\":\"asc\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.list[0].taskId")
                        .value("TK2026073000000001"));
    }

    @Test
    void shouldRejectInvalidRequest() throws Exception {
        mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"current\":0,\"pageSize\":101,"
                                + "\"status\":\"S99\","
                                + "\"sortField\":\"taskId\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PARAM_ERROR"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }
}
