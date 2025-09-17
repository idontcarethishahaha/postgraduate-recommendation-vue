package org.example.backendexamples.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backendexamples.dox.User;
import org.example.backendexamples.exception.Code;
import org.example.backendexamples.exception.XException;
import org.example.backendexamples.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author wuwenjin
 */
// 业务层组件，存放与User相关的一系列操作
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;// 密码的组件

    public User getUser(String account){
        return userRepository.findByAccount(account);
    }

    // 权限由controller层面负责，在入口使用拦截器
    // 管理员重置密码
    @Transactional
    public void updateUserPassword(String account){// 管理员基于账号更新
        User user = userRepository.findByAccount(account);
        if(user == null){
           throw XException.builder()
                   .number(Code.ERROR).
                   message("用户不存在")
                   .build();
        }
        user.setPassword(passwordEncoder.encode(account));// 将密码重置为account
        userRepository.save(user);
    }

    @Transactional
    public void updateUserPasswordById(String uid, String password){
        log.debug(uid);
        log.debug(password);
        User user = userRepository.findById(uid).orElse(null);
        if(user == null){
            throw XException.builder()
                    .number(Code.ERROR).
                    message("用户不存在")
                    .build();
        }
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    // 管理员添加用户
    @Transactional
    public void addUser(User user){
        user.setPassword(passwordEncoder.encode(user.getAccount()));// 基于用户账号编码默认密码，账号和密码是同一个
        userRepository.save(user);
    }

    public List<User> listUsers(){
        return userRepository.findAll();
    }
}
