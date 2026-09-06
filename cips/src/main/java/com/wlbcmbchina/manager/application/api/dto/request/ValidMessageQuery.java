package com.wlbcmbchina.manager.application.api.dto.request;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/** 校验报文查询中跨字段的业务约束。 */
@Documented
@Target({TYPE, ANNOTATION_TYPE})
@Retention(RUNTIME)
@Constraint(validatedBy = MessageQueryValidator.class)
public @interface ValidMessageQuery {

    String message() default "Invalid message query";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
