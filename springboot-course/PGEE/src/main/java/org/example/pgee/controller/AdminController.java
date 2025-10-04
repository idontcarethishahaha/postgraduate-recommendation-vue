package org.example.pgee.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.College;
import org.example.pgee.dox.User;
import org.example.pgee.dto.CollegeAddDTO;
import org.example.pgee.dto.CollegeUpdateDTO;
import org.example.pgee.dto.CounselorAddDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.service.CollegeService;
import org.example.pgee.service.UserService;
import org.example.pgee.vo.CounselorVO;
import org.example.pgee.vo.ResultVO;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CollegeService collegeService;

    // 重置用户密码
    @PutMapping("admin/users/{account}/password")
    public ResultVO putPassword(@PathVariable String account) {
        userService.updateUserPassword(account);
        return ResultVO.ok();
    }

    // 查询用户
    @GetMapping("admin/users")
    public ResultVO getUsers() {
        List<User> users = userService.listUsers();

        // 转换用户ID为String
        List<Map<String, Object>> result = users.stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId().toString());
                    map.put("name", user.getName());
                    map.put("account", user.getAccount());
                    map.put("tel", user.getTel());
                    map.put("role", user.getRole());
                    map.put("collegeId", user.getCollegeId() != null ? user.getCollegeId().toString() : null);
                    map.put("createTime", user.getCreateTime());
                    return map;
                })
                .collect(Collectors.toList());

        return ResultVO.success(result);
    }

    //---------------------------------------------------------------------------------------------------
    // 学院管理

    // 获取所有学院
    @GetMapping("admin/colleges")
    public ResultVO getColleges() {
        List<College> colleges = collegeService.listAllColleges();

        // 转换ID为String返回给前端
        List<Map<String, Object>> result = colleges.stream()
                .map(college -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", college.getId().toString());
                    map.put("name", college.getName());
                    map.put("createTime", college.getCreateTime());
                    map.put("updateTime", college.getUpdateTime());
                    return map;
                })
                .collect(Collectors.toList());

        return ResultVO.success(result);
    }

    // 添加学院
    @PostMapping("admin/colleges")
    public ResultVO postCollege(@RequestBody CollegeAddDTO collegeAddDTO) {
        collegeService.addCollege(collegeAddDTO);
        return ResultVO.ok();
    }

    // 编辑学院信息
    @PutMapping("admin/colleges/{collegeId}")
    public ResultVO updateCollege(@PathVariable String collegeId,
                                  @RequestBody CollegeUpdateDTO updateDTO) {
        try {
            Long id = Long.parseLong(collegeId);
            collegeService.updateCollege(id, updateDTO);
            return ResultVO.ok();
        } catch (NumberFormatException e) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院ID格式错误")
                    .build();
        }
    }

    // 删除学院
    @DeleteMapping("admin/colleges/{collegeId}")
    public ResultVO deleteCollege(@PathVariable String collegeId) {
        try {
            Long id = Long.parseLong(collegeId);
            collegeService.deleteCollege(id);
            return ResultVO.ok();
        } catch (NumberFormatException e) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院ID格式错误")
                    .build();
        }
    }

    // 获取学院管理员列表
    @GetMapping("admin/colleges/{collegeId}/collegeadmins")
    public ResultVO getCollegeAdmins(@PathVariable String collegeId) {
        try {
            Long id = Long.parseLong(collegeId);
            List<User> admins = userService.getCollegeAdmins(id);

            // 转换用户ID为String
            List<Map<String, Object>> result = admins.stream()
                    .map(user -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", user.getId().toString());
                        map.put("name", user.getName());
                        map.put("account", user.getAccount());
                        map.put("tel", user.getTel());
                        map.put("createTime", user.getCreateTime());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResultVO.success(result);
        } catch (NumberFormatException e) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院ID格式错误")
                    .build();
        }
    }

    // 移除学院管理员
    @DeleteMapping("admin/colleges/{collegeId}/collegeadmins/{userId}")
    public ResultVO removeCollegeAdmin(@PathVariable String collegeId,
                                       @PathVariable String userId) {
        try {
            Long collegeIdLong = Long.parseLong(collegeId);
            Long userIdLong = Long.parseLong(userId);
            userService.removeCollegeAdmin(collegeIdLong, userIdLong);
            return ResultVO.ok();
        } catch (NumberFormatException e) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("ID格式错误")
                    .build();
        }
    }

    // 添加学院级管理员
    @PostMapping("admin/colleges/{collegeId}/collegeadmins")
    public ResultVO addCollegeAdmin(@PathVariable String collegeId,
                                    @RequestBody Map<String, Object> userData) {
        try {
            Long collegeIdLong = Long.parseLong(collegeId);

            User user = User.builder()
                    .name((String) userData.get("name"))
                    .account((String) userData.get("account"))
                    .tel((String) userData.get("tel"))
                    .password((String) userData.get("password"))
                    .build();

            userService.addCollegeAdmin(collegeIdLong, user);
            return ResultVO.ok();
        } catch (NumberFormatException e) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院ID格式错误")
                    .build();
        }
    }

//    // 重置学院管理员密码
//    @PutMapping("admin/colleges/{collegeId}/collegeadmins/{userId}/password")
//    public ResultVO resetCollegeAdminPassword(@PathVariable String collegeId,
//                                              @PathVariable String userId) {
//        try {
//            Long collegeIdLong = Long.parseLong(collegeId);
//            Long userIdLong = Long.parseLong(userId);
//
//            userService.validateCollegeAdmin(collegeIdLong, userIdLong);
//            User user = userService.getUserById(userIdLong);
//            userService.updateUserPassword(user.getAccount());
//
//            return ResultVO.ok();
//        } catch (NumberFormatException e) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("ID格式错误")
//                    .build();
//        }
//    }

    //----------------------------------------------------------------------------------------------
    // 学院管理员为类别添加辅导员
    @PostMapping("collegeadmin/counselors")
    public ResultVO addCounselor(@RequestBody CounselorAddDTO counselorAddDTO, HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }
        userService.addCounselor(cid, counselorAddDTO);
        return ResultVO.ok();
    }

    // 学院管理员查询本学院的辅导员列表
    @GetMapping("collegeadmin/counselors")
    public ResultVO getCounselors(HttpServletRequest request) {
        Long collegeId = (Long) request.getAttribute("cid");
        if (collegeId == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }
        List<CounselorVO> counselors = userService.getCounselorsWithCategory(collegeId);
        return ResultVO.success(counselors);
    }
}