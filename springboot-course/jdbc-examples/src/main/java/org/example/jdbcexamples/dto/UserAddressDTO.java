package org.example.jdbcexamples.dto;

/*
 * @author wuwenjin
 */
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.jdbcexamples.dox.Address;
import org.example.jdbcexamples.dox.User;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressDTO {
    private User user;
    private List<Address> addresses;
    // 行映射无法满足需求，因为User每一行出现了冗余，做一个结果集的映射UserMapper
}