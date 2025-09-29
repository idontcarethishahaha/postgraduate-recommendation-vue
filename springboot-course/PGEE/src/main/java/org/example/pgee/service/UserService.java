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
    //.orElseThrow返回值为optional中的值，空值时抛异常，终止流程，有值时返回值
    @Transactional
    public void addCollegeAdmin(Long collegeId,User user) {
        collegeRepository.findById(collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院不存在")
                        .build());

        //.isPresent()返回值为boolean,判断查询结果是否有值，不终止流程，“不存在”正常继续，“已存在”不能继续
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

    // 重置用户密码
    // 权限由controller层面负责，在入口使用拦截器
    @Transactional
    public void updateUserPassword(String account) {
        User user = userRepository.findByAccount(account)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build());
        user.setPassword(passwordEncoder.encode(account));
        userRepository.save(user); // 显式保存，强制触发更新
    }

    // 用户集合
    public List<User> listUsers(){
        return userRepository.findAll();// CrudRepository接口的内置方法
    }

}