package org.example.springmvcexamples.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.springmvcexamples.service.UserService;
import org.example.springmvcexamples.dox.User;
import org.example.springmvcexamples.exception.Code;
import org.example.springmvcexamples.vo.ResultVO;
import org.springframework.web.bind.annotation.*;


/**
 * @author wuwenjin
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/")
public class LoginController {

    private final UserService userService;

    /*
        也可以写 /api 和 /login
         */
    @PostMapping("login")//请求体反序列化为User，这里用一个Map也行
    public ResultVO login(@RequestBody User user) {
        User userR = userService.getUserByAccount(user.getAccount(), user.getPassword());
        if (userR == null) {
            return ResultVO.error(Code.LOGIN_ERROR);
        }
        return ResultVO.success(userR);
    }
}