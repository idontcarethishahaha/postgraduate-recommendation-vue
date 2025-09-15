package org.example.jdbcexamples.repository;


import org.example.jdbcexamples.dox.Address;
import org.example.jdbcexamples.dto.AddressUserDTO;
import org.example.jdbcexamples.mapper.AddressRowMapper;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * @author wuwenjin
 */
// 持久层的组件声明为接口
public interface AddressRepository extends CrudRepository<Address, String> {

    //这个@Query注释掉也一样能查找
    @Query("""
          select * from address a 
          where a.user_id=:userId
           """)
    List<Address> findByUserId(String userId);

    // rowMapper行映射
    @Query(value="select * from address a,user u where a.user_id=u.id and a.id=:aid",
            rowMapperClass = AddressRowMapper.class)
    AddressUserDTO findByAId(String aid);
}