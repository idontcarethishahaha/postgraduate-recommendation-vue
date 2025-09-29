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

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/")
public class LoginController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JWTComponent jwtComponent;

    @PostMapping("open/login")
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

//        // 获取用户对象
//        User userR = userOpt.get();
//
//        // 生成JWT token
//        String token = jwtComponent.encode(Map.of(
//                "uid", userR.getId(),
//                "role", userR.getRole(),
//                "college_id",userR.getCollegeId()
//        ));
//
//        // 设置响应头
//        response.setHeader("token", token);
//        response.setHeader("role", userR.getRole());
//        response.setHeader("college_id", String.valueOf(userR.getCollegeId()));
//
//        return ResultVO.success(userR);
        User userR = userOpt.get();
        String role = userR.getRole();

        // 构建Token参数Map（基于角色动态添加字段）
        Map<String, Object> claims = new HashMap<>();
        // 所有角色都必须包含的基础字段
        claims.put("uid", userR.getId());
        claims.put("role", role);

//        // 根据角色添加额外字段（按需添加，避免Token过大）
//        switch (role) {
//            case "SUPER_ADMIN": // 超级管理员：仅基础字段
//                break;
//            case "COLLEGE_ADMIN": // 学院管理员：需要学院ID
//                claims.put("college_id", userR.getCollegeId());
//                break;
//            case "COUNSELOR": // 辅导员：需要学院ID + 类别ID
//                claims.put("college_id", userR.getCollegeId());
//                claims.put("major_category_id", userR.getMajorCategoryId()); // 假设User有该字段
//                break;
//            case "STUDENT": // 学生：需要学院ID + 专业ID
//                claims.put("college_id", userR.getCollegeId());
//                claims.put("major_id", userR.getMajorId()); // 假设User有该字段
//                break;
//            default:
//                // 其他角色按需扩展
//        }

        // 生成Token（包含动态字段）
        String token = jwtComponent.encode(claims);

        // 设置响应头（可选，前端若需要可放，但核心依赖Token）
        response.setHeader("token", token);
        response.setHeader("role", role);

        return ResultVO.success(userR);
    }
}