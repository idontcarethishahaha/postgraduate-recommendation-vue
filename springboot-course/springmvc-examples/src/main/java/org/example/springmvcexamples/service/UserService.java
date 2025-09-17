package org.example.springmvcexamples.service;

import org.example.springmvcexamples.dox.User;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author wuwenjin
 */

@Service
public class UserService {// 和用户的业务相关操作，权限校验属于控制层

    // 模拟一个数据库
    private static final List<User> USERS = create();

    private static List<User> create(){
        User u = User.builder()
                .id("1")
                .name("wuwenjin")
                .account("202")
                .role(User.ADMIN)
                .password("$2a$10$XPz7Kp1kF8NU3vewqqPGn.feT7UPvhoZolvJ1JRi57s16XKMWz9OW")
                .build();
        User u2 = User.builder()
                .id("222")
                .name("tomato")
                .account("110")
                .role(User.USER)
                .password("$2a$10$XPz7Kp1kF8NU3vewqqPGn.feT7UPvhoZolvJ1JRi57s16XKMWz9OW")
                .build();
        return List.of(u,u2);// 暂时 不可变集合
    }

    public List<User> listUsers() {
        return USERS;
    }

    public User getUserByAccount(String account) {
        return USERS.stream()
                .filter(u -> u.getAccount().equals(account))
                .findFirst()
                .orElse(null);// 没有则返回空
    }
}
