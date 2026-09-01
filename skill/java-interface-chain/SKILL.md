---
name: java-interface-chain
description: 用户要求“输出某接口实现链”或“生成某接口完整实现链”时调用。按 Spring Boot 2、Java 8、Lombok、DDD 四层架构生成从底层到顶层的完整 Markdown 文件。
---

# Java 后端接口实现链

- 默认技术栈：Spring Boot 2、Java 8、Lombok、MyBatis/MyBatis-Plus、PageHelper；校验使用 `javax.validation`，只使用 Java 8 API。
- Lombok 默认用法：Spring Bean 使用 `@RequiredArgsConstructor` 完成构造器注入；DTO/PO 按需使用 `@Getter`、`@Setter`；不可变 valueobject 使用 `@Getter`、`final` 字段和构造函数，不使用 `@Data`、不提供 Setter。
- 遵循全局 `AGENTS.md` 的 DDD 与 `infrastructure/common` 跨层共享规范。
- 保留 `IXxxAssembler` 与 `XxxAssembler`；DTO ↔ domain 由 Assembler 转换，domain ↔ PO 由 PersistenceConverter 转换。
- `ApiResult<T>` 仅在 Controller 包装；PageHelper/PageInfo 仅在 infrastructure；Mapper 返回 `List<XxxPO>`。
- 按 SQL/数据库 → infrastructure → domain → application → adapter 的顺序输出。
- 每个代码块是一个完整文件；Java 首行写 `// 文件位置/文件名`，XML 首行写 `<!-- // 文件位置/文件名 -->`。
- 自动生成带 YAML frontmatter 的 Markdown 文件，按全局记录规则保存并返回可点击路径。
- 未确认的包名、表字段和公共类型路径必须标注为假设。
