package org.example.backendexamples.controller;

import lombok.RequiredArgsConstructor;
import org.example.backendexamples.dox.User;
import org.example.backendexamples.interceptor.AdminInterceptor;
import org.example.backendexamples.service.UserService;
import org.example.backendexamples.vo.ResultVO;
import org.springframework.web.bind.annotation.*;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
public class AdminController {
    // 注入组件
    private final UserService userService;
    // 添加用户，发出post请求
    @PostMapping("users")
    public ResultVO postUser(@RequestBody User user) {
        userService.addUser(user); // 一旦出现异常，业务层面就抛出
        return ResultVO.ok();// 控制层面
    }

    // 重置密码只需要账号
    @PutMapping("users/{account}/password")
    public ResultVO putPassword(@PathVariable String account) {
        userService.updateUserPassword(account);
        return ResultVO.ok();
    }

    @GetMapping("users")
    public ResultVO getUsers() {
        return ResultVO.success(userService.listUsers());
    }
}
// 可以在持久层添加手写 update 的语句