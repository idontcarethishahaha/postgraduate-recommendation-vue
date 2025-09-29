package org.example.pgee.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.pgee.dto.MajorAddDTO;
import org.example.pgee.dto.MajorCategoryAddDTO;
import org.example.pgee.dto.MajorCategoryUpdateDTO;
import org.example.pgee.dto.MajorUpdateDTO;
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

//    //学院管理员可以为学院添加类别  /api/collegeadmin/categories，POST请求
//    @PostMapping("collegeadmin/categories")
//    public ResultVO postMajorCategories(@RequestBody MajorCategoryAddDTO majorCategoryAddDTO) {
//        collegeService.addMajorCategory(majorCategoryAddDTO);
//        return ResultVO.ok();
//    }

    // 学院管理员可以为学院添加类别(从token获取学院ID
    @PostMapping("collegeadmin/categories")
    public ResultVO postMajorCategories(@RequestBody MajorCategoryAddDTO majorCategoryAddDTO,
                                        HttpServletRequest request) {
        // 从request中获取拦截器解析的学院ID
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        // 直接传递学院ID到service，不依赖前端传递
        collegeService.addMajorCategory(majorCategoryAddDTO, cid);
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
            throw XException.builder().code(Code.FORBIDDEN).build();
        }
        // 调用服务层查询该学院下的类别
        return ResultVO.success(collegeService.listAllMajorCategories(cid));
    }

    // 删除某个类别
//    @DeleteMapping("collegeadmin/categories/{mcid}")
//    public ResultVO deleteMajorCategory(@PathVariable Long mcid) {
//        collegeService.deleteMajorCategory(mcid);
//        return ResultVO.ok();
//    }

    // 删除某个类别（增加学院权限验证
    @DeleteMapping("collegeadmin/categories/{mcid}")
    public ResultVO deleteMajorCategory(@PathVariable Long mcid, HttpServletRequest request) {
        // 从token获取学院ID，确保只能删除自己学院的类别
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        collegeService.deleteMajorCategory(mcid, cid);
        return ResultVO.ok();
    }

    // 修改类别
    @PutMapping("collegeadmin/categories/{mcid}")
    public ResultVO updateMajorCategory(@PathVariable Long mcid,
                                        @RequestBody MajorCategoryUpdateDTO updateDTO,
                                        HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        collegeService.updateMajorCategory(mcid, updateDTO, cid);
        return ResultVO.ok();
    }

    // 学院管理员为类别添加专业
    @PostMapping("collegeadmin/majors")
    public ResultVO addMajor(@RequestBody MajorAddDTO majorAddDTO, HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        collegeService.addMajor(majorAddDTO, cid);
        return ResultVO.ok();
    }

    // 查询某类别下的所有专业
    @GetMapping("collegeadmin/categories/{mcid}/majors")
    public ResultVO getMajorsByCategory(@PathVariable Long mcid, HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        return ResultVO.success(collegeService.listMajorsByCategory(mcid, cid));
    }

    // 查询学院下的所有专业
    @GetMapping("collegeadmin/majors")
    public ResultVO getAllMajors(HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        return ResultVO.success(collegeService.listAllMajors(cid));
    }

    // 修改专业信息
    @PutMapping("collegeadmin/majors/{mid}")
    public ResultVO updateMajor(@PathVariable Long mid,
                                @RequestBody MajorUpdateDTO updateDTO,
                                HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        collegeService.updateMajor(mid, updateDTO, cid);
        return ResultVO.ok();
    }

    // 删除专业
    @DeleteMapping("collegeadmin/majors/{mid}")
    public ResultVO deleteMajor(@PathVariable Long mid, HttpServletRequest request) {
        Long cid = (Long) request.getAttribute("cid");
        if (cid == null) {
            throw XException.builder().code(Code.FORBIDDEN).build();
        }

        collegeService.deleteMajor(mid, cid);
        return ResultVO.ok();
    }

    // 以专业来添加学生

}
