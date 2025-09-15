package org.example.jdbcexamples.repository;

/*
 * @author wuwenjin
 */
import org.example.jdbcexamples.dox.User;
import org.example.jdbcexamples.dto.UserAddressDTO;
import org.example.jdbcexamples.dto.UserCountDTO;
import org.example.jdbcexamples.mapper.UserExtractor;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author wuwenjin
 */
// 它不是一个普通的接口，是Spring的持久层的组件
@Repository
public interface UserRepository extends CrudRepository<User, String> {

    // 查询语句，实现方法
    @Query(value = """
            select * from user u join address a
            on u.id=a.user_id
            where u.id=:uid
            """, resultSetExtractorClass = UserExtractor.class)
    UserAddressDTO findByUserId(String uid);

    @Query("""
            select u.id as user_id,u.name,count(a.user_id) as count
     from user u left join address a
     on u.id = a.user_id
     group by u.id
     order by count
     """)
    List<UserCountDTO> findCounts();
}
