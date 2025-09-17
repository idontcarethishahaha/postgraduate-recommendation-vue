package org.example.backendexamples.controller;

import lombok.RequiredArgsConstructor;
import org.example.backendexamples.dox.User;
import org.example.backendexamples.service.UserService;
import org.example.backendexamples.vo.ResultVO;
import org.springframework.web.bind.annotation.*;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/user/")
@RequiredArgsConstructor
public class UserController {
    // 注入业务层，不注入持久层，单向依赖
    private final UserService userService;

    // 用户可以更新自己的密码
    @PatchMapping("password")
    public ResultVO patchPassword(@RequestBody User user, @RequestAttribute("uid") String uid) {
        userService.updateUserPasswordById(uid,user.getPassword()); // uid，以及新的密码
        return ResultVO.ok();
    }
}
