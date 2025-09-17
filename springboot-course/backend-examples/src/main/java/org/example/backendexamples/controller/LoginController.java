package org.example.backendexamples.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backendexamples.component.JWTComponent;
import org.example.backendexamples.dox.User;
import org.example.backendexamples.exception.Code;
import org.example.backendexamples.service.UserService;
import org.example.backendexamples.vo.ResultVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


/**
 * @author wuwenjin
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/")
public class LoginController {

    private final UserService userService;

    // 要加final 以构造函数的方式注入
    private final PasswordEncoder passwordEncoder; // 注入组件
    private final JWTComponent jwtComponent;
    /*
        也可以写 /api 和 /login
         */
    @PostMapping("login")//请求体反序列化为User，这里用一个Map也行
    public ResultVO login(@RequestBody User user, HttpServletResponse response) {
        User userR = userService.getUser(user.getAccount());
        if (userR == null || !passwordEncoder.matches(user.getPassword(), userR.getPassword())) {
            return ResultVO.error(Code.LOGIN_ERROR);
        }
        //log.info("login success");
        // token 需要返给前端
        String token = jwtComponent.encode(Map.of("uid",userR.getId(),
                "role",userR.getRole()));//发出请求的值
        //log.debug("token:{}", token);
        response.setHeader("token",token);
        response.setHeader("role",userR.getRole());//返回的是渲染的角色，和发出请求可以是不同的值
        return ResultVO.success(userR);
    }
}
//user.getPassword() 用户本次登录输入的,userR是从数据库里查出来的真正的用户得到信息