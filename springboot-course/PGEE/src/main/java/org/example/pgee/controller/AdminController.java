package org.example.pgee.controller;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dto.CollegeAddDTO;
import org.example.pgee.service.CollegeService;
import org.example.pgee.service.UserService;
import org.example.pgee.vo.ResultVO;
import org.springframework.web.bind.annotation.*;
import org.example.pgee.dox.User;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CollegeService collegeService;

    // 添加学院级管理员
    @PostMapping("admin/colleges/{collegeId}/collegeadmins")
    public ResultVO addCollegeAdmin(@PathVariable Long collegeId, @RequestBody User user) {
        // 设置学院ID和角色
        user.setCollegeId(collegeId);
        user.setRole(User.COLLEGE_ADMIN);

        userService.addCollegeAdmin(collegeId,user);
        return ResultVO.ok();
    }

/*
    // 添加用户
    @PostMapping("admin/users")
    public ResultVO postUser(@RequestBody User user) {
        userService.addUser(user);
        return ResultVO.ok();
    }
*/
    // 重置密码
    @PutMapping("admin/users/{account}/password")
    public ResultVO putPassword(@PathVariable String account) {
        userService.updateUserPassword(account);
        return ResultVO.ok();
    }

    // 查询用户
    @GetMapping("admin/users")
    public ResultVO getUsers() {
        return ResultVO.success(userService.listUsers());
    }

    // 学院管理
    //添加学院  /api/admin/colleges，POST请求
    @PostMapping("admin/colleges")
    public ResultVO postCollege(@RequestBody CollegeAddDTO collegeAddDTO) {
        // 调用服务层添加学院，业务异常由Service抛出
        collegeService.addCollege(collegeAddDTO);
        return ResultVO.ok();
    }

    // 查询所有学院  路径：/api/open/colleges，GET请求
    @GetMapping("open/colleges")
    public ResultVO getColleges() {
        return ResultVO.success(collegeService.listAllColleges());
    }

    // 删除学院
    @DeleteMapping("admin/colleges/{collegeid}")
    public ResultVO deleteCollege(@PathVariable Long collegeid) {
        collegeService.deleteCollege(collegeid);
        return ResultVO.ok();
    }
}
