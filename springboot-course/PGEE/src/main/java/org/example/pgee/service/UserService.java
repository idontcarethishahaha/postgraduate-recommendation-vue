package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.pgee.dox.User;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.CollegeRepository;
import org.example.pgee.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * @author wuwenjin
 */
// 业务层组件，存放与User相关的一系列操作
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CollegeRepository collegeRepository;

    public Optional<User> getUser(String account) {
        return userRepository.findByAccount(account);
    }

    // 添加学院管理员
    @Transactional
    public void addCollegeAdmin(Long collegeId,User user) {
        // 验证学院是否存在
        collegeRepository.findById(collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院不存在")
                        .build());

        // 验证账号是否已存在
        if (userRepository.findByAccount(user.getAccount()).isPresent()) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("账号已存在")
                    .build();
        }

        // 设置角色和学院
        user.setRole(User.COLLEGE_ADMIN);
        user.setCollegeId(collegeId);

        // 设置默认密码
        String password = user.getPassword() != null ? user.getPassword() : user.getAccount();
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);
    }

    @Transactional
    public void updateUserPasswordById(Long uid, String password){
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

    // 权限由controller层面负责，在入口使用拦截器
    @Transactional
    public void updateUserPassword(String account) {
        userRepository.findByAccount(account)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build())
                .setPassword(passwordEncoder.encode(account));
    }

    public List<User> listUsers(){
        return userRepository.findAll();
    }

}