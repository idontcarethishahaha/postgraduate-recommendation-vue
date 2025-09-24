/*辅导员查看自己管理的专业*/
explain
select m.name, mc.name as category_name
from major m
         join major_category mc on m.major_category_id = mc.id
         join counselor_info ci on mc.id = ci.major_category_id
where ci.user_id = 002;

/*统计某个学生申报状态为'pending'的项数*/
explain
select
    count(*) as pending_count
from
    application
where
    user_id = 001
  and status = 'pending';

/*统计某学生所有“学术专长”相关的申报项目
关联指标点表，筛选属于“学术专长”一级指标的申报记录*/
select
    a.item_name,
    a.status,
    a.create_time,
    ip.name as indicator_name
from
    application a
        join
    indicator_points ip on a.indicator_id = ip.id
        join
    indicator_points first_level on/*递归查找叶子节点对应的一级指标（level=1）*/
        (ip.parent_id = first_level.id or
         exists (select 1 from indicator_points mid where mid.id = ip.parent_id and mid.parent_id = first_level.id))
where
    a.user_id = 001
  and first_level.name = '学术专长'
  and first_level.level = 1
order by
    a.create_time desc;
