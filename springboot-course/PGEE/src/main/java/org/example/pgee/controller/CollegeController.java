package org.example.pgee.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.pgee.dto.MajorCategoryAddDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.service.CollegeService;
import org.example.pgee.vo.ResultVO;
import org.springframework.web.bind.annotation.*;

/**
 * @author wuwenjin
 */
@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class CollegeController {
    private final CollegeService collegeService;

    //学院管理员可以为学院添加类别  /api/collegeadmin/categories，POST请求
    @PostMapping("collegeadmin/categories")
    public ResultVO postMajorCategories(@RequestBody MajorCategoryAddDTO majorCategoryAddDTO) {
        collegeService.addMajorCategory(majorCategoryAddDTO);
        return ResultVO.ok();
    }

    // 查询自己所在的学院下已有的类别
//    @GetMapping("collegeadmin/categories/{cid}")
//    public ResultVO getMajorCategories(@PathVariable Long cid) {
//        return ResultVO.success(collegeService.listAllMajorCategories(cid));
//    }


    // 查询自己所在学院的类别（核心修改：从request取cid，URL无参数）
    @GetMapping("collegeadmin/categories") // URL移除{cid}
    public ResultVO getMajorCategories(HttpServletRequest request) {
        // 从request中获取拦截器解析的学院ID
        Long cid = (Long) request.getAttribute("cid");
        // 校验：确保学院管理员的Token中包含cid（增强安全性）
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).message("无权访问").build();
        }
        // 调用服务层查询该学院下的类别
        return ResultVO.success(collegeService.listAllMajorCategories(cid));
    }

    // 删除某个类别
    @DeleteMapping("collegeadmin/categories/{mcid}")
    public ResultVO deleteMajorCategory(@PathVariable Long mcid) {
        collegeService.deleteMajorCategory(mcid);
        return ResultVO.ok();
    }

    // 为类别添加专业

}
