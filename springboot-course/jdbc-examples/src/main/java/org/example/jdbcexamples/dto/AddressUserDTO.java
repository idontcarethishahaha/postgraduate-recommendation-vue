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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressUserDTO {
    private User user;
    private Address address;
}
