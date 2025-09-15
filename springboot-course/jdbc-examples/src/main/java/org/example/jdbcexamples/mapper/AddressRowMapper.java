package org.example.jdbcexamples.mapper;

import org.example.jdbcexamples.dox.Address;
import org.example.jdbcexamples.dox.User;
import org.example.jdbcexamples.dto.AddressUserDTO;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * @author wuwenjin
 */
// 映射规则
public class AddressRowMapper implements RowMapper<AddressUserDTO> {

    @Override
    public AddressUserDTO mapRow(ResultSet rs,int rowNum) throws SQLException{
        User user = User.builder()
                .id(rs.getString("u.id"))
                .name(rs.getString("u.name"))
                .createTime(rs.getObject("u.create_time", LocalDateTime.class))
                .updateTime(rs.getObject("u.update_time", LocalDateTime.class))
                .build();
        Address address = Address.builder()
                .id(rs.getString("a.id"))
                .detail(rs.getString("detail"))
                .userId(rs.getString("user_id"))
                .createTime(rs.getObject("a.create_time", LocalDateTime.class))
                .updateTime(rs.getObject("a.update_time", LocalDateTime.class))
                .build();
        return AddressUserDTO.builder()
                .user(user)
                .address(address)
                .build();
        //把两个对象封装到DTO里，手动的完成一个映射
    }

}
