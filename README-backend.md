## 研究生推免系统 - 后端
该模块是研究生推免系统的后端服务实现，基于**Spring Boot 生态**构建，为前端提供标准化的 RESTful API 接口，支撑多角色权限管控、推免流程管理、数据持久化等核心业务，兼顾安全性、可维护性与扩展性，适配企业级中后台系统开发规范。

## 核心技术栈
| 技术分类         | 技术名称 & 核心用途                                                                 |
|------------------|-------------------------------------------------------------------------------------|
| 基础框架         | Spring Boot：项目核心框架，实现自动配置、依赖注入，快速搭建后端服务<br>Spring MVC：Web层开发，处理HTTP请求（GET/POST/PUT/DELETE）、请求参数绑定（@PathVariable/@RequestBody等） |
| 数据持久化       | Spring Data JPA：简化数据库CRUD操作，支持自定义SQL、事务管理（@Transactional）<br>MySQL：关系型数据库，存储系统核心业务数据 |
| 安全与认证       | JWT (JSON Web Token)：无状态令牌认证，实现token生成、解密、过期校验，保障登录安全<br>BCrypt PasswordEncoder：密码加密存储，防止明文泄露 |
| 数据处理         | Java 8+ 特性：Lambda表达式、Stream流简化集合操作，LocalDateTime处理日期时间<br>Lombok：简化POJO代码（@Data/@Builder等），消除getter/setter冗余 |
| 接口与数据规范   | DTO/VO 分层设计：DTO（数据传输）、VO（视图返回）分离前后端交互格式<br>RESTful API：按资源操作设计接口，区分开放/管理员/学院管理员接口层级 |
| 异常与响应       | 全局异常处理：@ExceptionHandler兜底捕获异常，统一返回格式<br>自定义业务异常（XException）：区分权限/Token过期/数据不存在等错误类型<br>统一响应体（ResultVO）：封装状态码、消息、数据，规范前后端交互 |
| 工程化规范       | 注解驱动开发：@PostConstruct（初始化）、@RequiredArgsConstructor（构造器注入）等<br>日志处理：@Slf4j（Lombok日志注解）实现日志打印 |

## 核心特性
### 1. 安全认证与权限管控
- 基于JWT实现无状态登录认证，自定义Token生成/解密逻辑，支持过期校验；
- 密码BCrypt加密存储，杜绝明文泄露风险；
- 接口级权限校验：解析Token中的用户角色/ID信息，限制不同角色（管理员/学院管理员/学生）的数据操作范围，防止水平越权（如学院管理员仅能操作本院数据）。

### 2. 标准化接口设计
- 遵循RESTful API规范，GET/POST/PUT/DELETE分别对应查/增/改/删操作；
- 接口分层管理：开放接口（open/）、管理员接口（admin/）、学院管理员接口（collegeadmin/），清晰区分权限范围；
- DTO/VO分层：前端入参用DTO校验，后端返回用VO封装，隔离数据层与交互层。

### 3. 完善的异常处理体系
- 全局异常处理器捕获所有未处理异常，统一返回ResultVO格式；
- 自定义业务异常（XException）+ 状态码枚举（Code），精准区分错误类型，便于前端针对性处理；
- 密码、Token等敏感字段序列化控制（@JsonProperty(access = WRITE_ONLY)），防止数据泄露。

### 4. 高效的数据处理
- 基于Spring Data JPA简化数据库操作，自定义@Query注解处理复杂查询；
- Java 8+ Stream流、Lambda表达式优化集合处理逻辑，LocalDateTime + ZoneId解决时区/时间计算问题；
- 事务管理（@Transactional）保障核心业务（如审核流程）的数据一致性。

## 核心功能
- 认证授权：JWT登录、Token校验、密码加密；
- 角色管理：多角色权限隔离、接口级权限控制；
- 基础数据管理：学院、专业、推免方向等信息的CRUD；
- 推免流程：学生信息审核、审批状态更新、数据校验；
- 异常处理：全局异常兜底、自定义业务异常提示。

## 技术亮点
- 分层架构清晰：Controller（控制层）→ Service（业务层）→ Repository（持久层）→ Dox/DTO/VO（数据层），符合企业级开发规范；
- 安全防护完善：JWT加密、密码哈希、权限校验三层防护，杜绝越权与数据泄露；
- 异常体系标准化：统一响应格式 + 自定义异常，降低前后端联调成本；
- 代码简洁高效：Lombok、Stream流、Builder模式简化代码，提升可维护性。
