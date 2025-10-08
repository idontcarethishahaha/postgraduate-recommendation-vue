//package org.example.pgee.controller;
//
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import org.example.pgee.dox.Application;
//import org.example.pgee.dox.IndicatorPoint;
//import org.example.pgee.dox.StuScore;
//import org.example.pgee.dto.*;
//import org.example.pgee.service.StudentService;
//import org.example.pgee.vo.ApplicationVO;
//import org.example.pgee.vo.ProfileVO;
//import org.example.pgee.vo.ResultVO;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/student")
//@RequiredArgsConstructor
//public class StudentController {
//
//    private final StudentService studentService;
//
//    // ==================== 加权成绩接口 ====================
//
//    @PostMapping("/score")
//    public ResultVO submitScore(@RequestBody StudentScoreDTO dto, HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        StudentScore score = studentService.submitScore(dto, userId);
//        return ResultVO.success(score);
//    }
//
//    @PutMapping("/score")
//    public ResultVO updateScore(@RequestBody StudentScoreDTO dto, HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        StudentScore score = studentService.updateScore(dto, userId);
//        return ResultVO.success(score);
//    }
//
//    @GetMapping("/score")
//    public ResultVO getScore(HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        StudentScore score = studentService.getScore(userId);
//        return ResultVO.success(score);
//    }
//
//    // ==================== 材料申报接口 ====================
//
//    @PostMapping("/applications")
//    public ResultVO submitApplication(@RequestBody ApplicationDTO dto, HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        Application application = studentService.submitApplication(dto, userId);
//        return ResultVO.success(application);
//    }
//
//    @GetMapping("/applications")
//    public ResultVO getApplications(HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        List<ApplicationVO> applications = studentService.getApplications(userId);
//        return ResultVO.success(applications);
//    }
//
//    // ==================== 指标点查询接口 ====================
//
//    @GetMapping("/indicators/first-level")
//    public ResultVO getFirstLevelIndicators(HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        List<IndicatorPoint> indicators = studentService.getFirstLevelIndicators(userId);
//        return ResultVO.success(indicators);
//    }
//
//    @GetMapping("/indicators/{parentId}/leaves")
//    public ResultVO getLeafIndicators(@PathVariable Long parentId) {
//        List<IndicatorPoint> indicators = studentService.getLeafIndicators(parentId);
//        return ResultVO.success(indicators);
//    }
//
//    // ==================== 个人中心接口 ====================
//
//    @GetMapping("/profile")
//    public ResultVO getProfile(HttpServletRequest request) {
//        Long userId = (Long) request.getAttribute("uid");
//        ProfileVO profile = studentService.getProfile(userId);
//        return ResultVO.success(profile);
//    }
//}