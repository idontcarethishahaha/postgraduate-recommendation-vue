package org.example.springmvcexamples.dox;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author wuwenjin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    public static final String USER = "FeSo";
    public static final String ADMIN = "Cahy";

    private String id;
    private String name;
    private String account;
    //被 transient 修饰的字段不会被序列化
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private LocalDateTime createTime;

    private String role;
}
