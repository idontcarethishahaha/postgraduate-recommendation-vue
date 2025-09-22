/*还会继续修改，索引设计还需改进，可能还有一些要补充的*/

/* 学院表 */
create table if not exists college(
    id char(19) not null primary key ,
    name varchar(25) not null unique,
    index(id)
);

/* 专业类别表 */
create table if not exists major_category(
     id char(19) not null primary key ,
     name varchar(25) not null unique,
     create_time datetime not null default current_timestamp,
     update_time datetime not null default current_timestamp on update current_timestamp,

    index(id)
);

/* 专业表 */
create table if not exists major(
    id char(19) not null primary key ,
    name varchar(25) not null,
    college_id char(19) not null ,
    major_category_id char(19) not null,
    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index(id),
    index(college_id,major_category_id)/*某学院某专业类别的专业*/
);

/* 用户表 */
create table if not exists `user`
(
    id          char(19) not null primary key,
    name        varchar(45),
    college_id  char(19) not null,

    /*学生要选学院和专业，辅导员要选学院和类别，管理员要选学院*/
    /*全放在这里还是再分几张表？*/
    major_category_id char(19),
    major_id char(19),

    account     varchar(20) not null unique ,
    password    varchar(50) not null ,
    role        enum('student','counselor','admin') not null ,
    tel         char(11) not null ,
    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index(role),
    index(college_id),
    index(major_category_id),
    index(college_id,role)/*如查询某学院学生*/
);

/* 学生的基本信息 加权、排名、审核状态项数 */
create table if not exists stu_info(
    id char(19) not null primary key ,
    user_id char(19) not null unique ,
    major_id char(19) not null ,
    /* 这里的约束判断让别的部分来做？ */
    major_rank int check (major_rank >= 1 and major_rank <= 200),
    weighted_score decimal(5, 2) not null check (weighted_score > 0),

    application_number int unsigned default 0,
    pending_number int unsigned default 0,/*未审核数*/
    revision_number int unsigned default 0,/*需要修改的项数*/
    rejected_number int unsigned default 0,
    pass_number int unsigned default 0,

    rank_audited tinyint(1) not null default 0,/*排名是否被认定*/
    weighted_score_audited tinyint(1) not null default 0,/*加权成绩是否被认定*/

    calculated_score decimal(5, 2) not null default 0.0,/*折算后分数*/

    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index(user_id)
);

/* 指标点表 */
create table if not exists indicator_points(
    id bigint unsigned not null primary key ,
    major_category_id char(19) not null,/*根据专业大类划分*/
    name varchar(255) not null ,/*指标点名称（各级指标名）*/
    level int not null ,/*指标点层级（节点层级）*/
    code varchar(255) not null ,/*指标点代码*/
    indicator_description text,/*备注*/
    max_score decimal(4,2) default null,/*该指标点的最大分值，叶子节点设置*/
    item_upper_limit int unsigned not null default 0,/*本项目申报数量上限，叶子节点*/
    parent_id bigint unsigned default null,/*父级指标点id*/
    is_leaf tinyint(1) not null default 0,/*是否为叶子节点*/

    level_code varchar(50) not null,
    /*层级路径编码，如“1”代表1级“学术专长”，“1-1”代表2级“竞赛”，“1-1-1”代表3级“第一等级一等奖”*/

    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index(major_category_id, level, is_leaf),/*拉取某专业类别的一级指标（非叶子节点）,拉取 “某指标的子节点”*/
    index(parent_id, is_leaf)/*某父节点的所有子节点*/,

    /*拉取某父节点的所有子节点,该子节点能否申报、申报能得多少分、最多能申报几项*/
    index(parent_id, is_leaf, max_score, item_upper_limit)
);
/*
   1.拉取某专业类别的所有一级指标
   2.拉取某父节点的所有子节点
   3.判断某指标点是否为叶子节点
   4.拉取某指标点的完整路径
  */

/* 申报记录表 */
create table if not exists application(
    id char(19) not null primary key ,
    user_id char(19) not null ,/* 学生用户的id */

    /*学生仅申报最底层具体项（叶子节点），通过indicator_id反向获取完整指标路径
      parent_id递归查询 或 通过level_code获取路径*/
    indicator_id bigint unsigned not null,/*指标点id，必须是叶子节点*/

    status enum('pending','rejected','revision','pass') default 'pending',
    item_name varchar(255) not null ,/* 指标点项目名称 */
    is_leaf tinyint(1) not null default 0,/*是否为叶子节点*/
    description text,
    audit_comment text,/*审核意见*/
    audited_by char(19),/*审核人（辅导员）id*/
    award_score decimal(4,2) not null default 0,/*得到的认定分值*/
    create_time datetime not null default current_timestamp,
    update_time datetime not null default current_timestamp on update current_timestamp,

    index(status)/*查询项数*/,
    index(audited_by, status)/*辅导员查看*/,
    index(user_id, indicator_id, is_leaf)/*叶子节点才能提交*/
);

/* 证明材料表 */
create table if not exists application_evidences(
  id char(19) not null primary key ,
  application_id char(19) not null ,/*申报记录表的id*/
  file_name varchar(255) not null ,
  file_url varchar(255) not null,
  create_time datetime not null default current_timestamp,
  update_time datetime not null default current_timestamp on update current_timestamp,

  index(application_id)
);



