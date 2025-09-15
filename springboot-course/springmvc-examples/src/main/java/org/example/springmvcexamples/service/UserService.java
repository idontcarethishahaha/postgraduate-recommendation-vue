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
                .password("123456")
                .build();
        return List.of(u);// 暂时 不可变集合
    }

    public List<User> listUsers() {
        return USERS;
    }

    // 模拟登录
    public User getUserByAccount(String account, String password) {
        return USERS.stream()
                .filter(u -> u.getAccount().equals(account))
                .filter(u -> u.getPassword().equals(password))
                .findFirst()
                .orElse(null);// 没有则返回空
    }

    public User getUserByAccount(String account) {
        return USERS.stream()
                .filter(u -> u.getAccount().equals(account))
                .findFirst()
                .orElse(null);// 没有则返回空
    }
}
