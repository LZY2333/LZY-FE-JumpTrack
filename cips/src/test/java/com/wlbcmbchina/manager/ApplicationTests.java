package com.wlbcmbchina.manager;

import com.wlbcmbchina.manager.domain.message.model.MessageBusinessType;
import com.wlbcmbchina.manager.domain.message.model.MessageDirection;
import com.wlbcmbchina.manager.domain.message.model.MessageQueryCriteria;
import com.wlbcmbchina.manager.domain.message.model.MessageSortField;
import com.wlbcmbchina.manager.domain.message.model.MessageSortOrder;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** 应用上下文与 MyBatis XML 装配测试。 */
@SpringBootTest
class ApplicationTests {

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    @Test
    void contextLoads() {
        // 上下文成功启动即完成配置、Mapper XML 和 MapStruct Bean 的联合校验。
    }

    @Test
    void mixedBusinessPageSqlShouldNotJoinBusinessDetailTables() {
        MessageQueryCriteria criteria = baseCriteria();

        String sql = boundSql(criteria);

        assertThat(sql).contains("PSSST_ENT_BASIC_INFO", "PSSST_TRN_IN_MASTER")
                .doesNotContain("PSSST_ENT_PAY_INFO", "PSSST_ENT_BILL_INFO", "PSSST_ENT_QUERY_GPI");
    }

    @Test
    void amountFilterSqlShouldOnlyAccessSelectedBusinessTable() {
        MessageQueryCriteria criteria = baseCriteria();
        criteria.setBusinessType(MessageBusinessType.PAY);
        criteria.setAmountFrom(new BigDecimal("1000.00"));

        String sql = boundSql(criteria);

        assertThat(sql).contains("PSSST_ENT_PAY_INFO", "CAST(TRIM(pay.REMIT_AMOUNT) AS DECIMAL(18, 2))")
                .doesNotContain("PSSST_ENT_BILL_INFO", "PSSST_ENT_QUERY_GPI");
    }

    private String boundSql(MessageQueryCriteria criteria) {
        Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put("criteria", criteria);
        BoundSql boundSql = sqlSessionFactory.getConfiguration()
                .getMappedStatement("com.wlbcmbchina.manager.infrastructure.message.dao.mapper.MessageMapper.selectMessagePage")
                .getBoundSql(parameters);
        return boundSql.getSql().replaceAll("\\s+", " ").trim();
    }

    private MessageQueryCriteria baseCriteria() {
        MessageQueryCriteria criteria = new MessageQueryCriteria();
        criteria.setMsgDirection(MessageDirection.IN);
        criteria.setCurrent(1);
        criteria.setPageSize(10);
        criteria.setSortField(MessageSortField.CREATE_TIME);
        criteria.setSortOrder(MessageSortOrder.DESC);
        return criteria;
    }
}
