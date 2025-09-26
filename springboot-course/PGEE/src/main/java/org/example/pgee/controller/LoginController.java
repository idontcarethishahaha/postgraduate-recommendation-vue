package org.example.pgee.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.pgee.component.JWTComponent;
import org.example.pgee.dox.User;
import org.example.pgee.exception.Code;
import org.example.pgee.service.UserService;
import org.example.pgee.vo.ResultVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/open/")
public class LoginController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JWTComponent jwtComponent;

    @PostMapping("login")
    public ResultVO login(@RequestBody User user, HttpServletResponse response) {
        // 处理用户查询
        Optional<User> userOpt = userService.getUser(user.getAccount());

        // 验证用户存在且密码正确
        boolean isValidUser = userOpt.map(u -> passwordEncoder.matches(user.getPassword(), u.getPassword()))
                .orElse(false);

        if (!isValidUser) {
            log.warn("登录失败，账号或密码错误: {}", user.getAccount());
            return ResultVO.error(Code.LOGIN_ERROR);
        }

        // 获取用户对象
        User userR = userOpt.get();

        // 生成JWT token
        String token = jwtComponent.encode(Map.of(
                "uid", userR.getId(),
                "role", userR.getRole()
                // "college_id",userR.getCollegeId()
        ));

        // 设置响应头
        response.setHeader("token", token);
        response.setHeader("role", userR.getRole());

        return ResultVO.success(userR);
    }
}