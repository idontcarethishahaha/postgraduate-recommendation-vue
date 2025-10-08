package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.User;
import org.example.pgee.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author wuwenjin
 */
@Service
@RequiredArgsConstructor
public class InitService {

    //注入持久层组件
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional //事务
    @EventListener(ApplicationReadyEvent.class)
    public void init(){
        String account = "admin";
        long count = userRepository.count();
        if(count > 0){
            return;
        }
        User u = User.builder()
                .name("超级管理员")
                .collegeId(null)
                .account("admin")
                .password(passwordEncoder.encode(account))
                .role(User.ADMIN)
                .tel(null)
                .build();
        userRepository.save(u);
    }
}
