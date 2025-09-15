package org.example.jdbcexamples.dto;
/*
 * @author wuwenjin
 */
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCountDTO {
    private String userId;
    private int count;
    private String name;
}
