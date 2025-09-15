package org.example.jdbcexamples.mapper;

/*
 * @author wuwenjin
 */
import org.example.jdbcexamples.dox.Address;
import org.example.jdbcexamples.dox.User;
import org.example.jdbcexamples.dto.UserAddressDTO;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

// 按照整个结果集进行映射
public class UserExtractor implements ResultSetExtractor<UserAddressDTO> {

    @Override                        //结果集需要进行手动的遍历
    public UserAddressDTO extractData(ResultSet rs) throws SQLException, DataAccessException {

        // 没有必要每一次都创建User对象
        User user = null;
        List<Address> addresses = new ArrayList<Address>();// 可变集合
        while(rs.next()) {
            if(user == null) {// 如果为空则添加,不对已存在的User继续进行封装
                user = User.builder()
                        .id(rs.getString("u.id"))
                        .name(rs.getString("name"))
                        .build();
            }
            // address每一次都要进行封装
            Address address = Address.builder()
                    .id(rs.getString("a.id"))
                    .detail(rs.getString("a.detail"))
                    .userId(rs.getString("user_id"))
                    .build();
            addresses.add(address);
        }

        // 对结果集手动完成映射
        return UserAddressDTO
                .builder()
                .user(user)
                .addresses(addresses)
                .build();
    }
}
