package org.example.pgee.controller;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.User;
import org.example.pgee.service.UserService;
import org.example.pgee.vo.ResultVO;
import org.springframework.web.bind.annotation.*;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 用户可以更新自己的密码
    @PatchMapping("open/user/password")
    public ResultVO patchPassword(@RequestAttribute("uid") Long uid,@RequestBody User user) {
        userService.updateUserPasswordById(uid,user.getPassword());
        return ResultVO.ok();
    }
    //为了防止水平越权，如用户修改他人的密码，有的信息不应由前端传入，需要从token拿
}