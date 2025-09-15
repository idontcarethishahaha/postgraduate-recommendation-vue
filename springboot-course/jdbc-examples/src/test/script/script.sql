explain
select * from address a
where a.user_id='1416320051491954688';


explain
select * from address a,user u
where a.user_id=u.id and a.id='1';

explain
select * from user u join address a
                          on u.id=a.user_id
where u.id='1416320051491954688';

/*右边显示个数，左边显示用户，左边一定有，左连接，左表的全部，右表取共同*/
select u.name,count(a.user_id) as count from user u left join address a
                                                              on u.id = a.user_id
group by u.id
order by count;

/*去掉地址个数为0的，取交集*/
select u.name,count(a.user_id) as count from user u join address a
                                                         on u.id = a.user_id
group by u.id
order by count;

select u.id as user_id,u.name,count(a.user_id) as count
from user u left join address a
                      on u.id = a.user_id
group by u.id
order by count