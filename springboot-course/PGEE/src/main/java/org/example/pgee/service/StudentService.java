//package org.example.pgee.service;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.example.pgee.dox.*;
//import org.example.pgee.dto.ApplicationDTO;
//import org.example.pgee.exception.Code;
//import org.example.pgee.exception.XException;
//import org.example.pgee.repository.*;
//import org.example.pgee.vo.ProfileVO;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
///**
// * @author wuwenjin
// */
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class StudentService {
//
//    private final StuScoreRepository stuScoreRepository;
//    private final ApplicationRepository applicationRepository;
//    private final ApplicationEvidenceRepository evidenceRepository;
//    private final IndicatorPointRepository indicatorPointRepository;
//    private final UserRepository userRepository;
//    private final StudentInfoRepository studentInfoRepository;
//    private final MajorRepository majorRepository;
//
//    // ==================== 指标点查询 ====================
//
//    public List<IndicatorPoint> getFirstLevelIndicators(Long userId) {
//        // 先获取学生的专业信息
//        StudentInfo studentInfo = studentInfoRepository.findByUserId(userId)
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("学生信息不存在")
//                        .build());
//
//        // 获取专业信息
//        Major major = majorRepository.findById(studentInfo.getMajorId())
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("专业信息不存在")
//                        .build());
//
//        // 根据专业类别ID查找指标点
//        return indicatorPointRepository.findFirstLevelByMajorCategoryId(major.getMajorCategoryId());
//    }
//
//    // 或者使用原来的方法（如果student_info表结构允许）
//    public List<IndicatorPoint> getFirstLevelIndicatorsAlternative(Long userId) {
//        return indicatorPointRepository.findFirstLevelByUserId(userId);
//    }
//
//    public List<IndicatorPoint> getLeafIndicators(Long parentId) {
//        return indicatorPointRepository.findLeafNodesByParentId(parentId);
//    }
//
//    // ==================== 其他方法保持不变 ====================
//
//    @Transactional
//    public Application submitApplication(ApplicationDTO dto, Long userId) {
//        // 验证指标点是否存在且是叶子节点
//        IndicatorPoint indicator = indicatorPointRepository.findById(dto.getIndicatorId())
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("指标点不存在")
//                        .build());
//
//        if (!Boolean.TRUE.equals(indicator.getIsLeaf())) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("只能申报叶子节点指标点")
//                    .build();
//        }
//
//        // 检查学生是否有权限申报该指标点（属于同一专业类别）
//        StudentInfo studentInfo = studentInfoRepository.findByUserId(userId)
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("学生信息不存在")
//                        .build());
//
//        Major major = majorRepository.findById(studentInfo.getMajorId())
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("专业信息不存在")
//                        .build());
//
//        if (!indicator.getMajorCategoryId().equals(major.getMajorCategoryId())) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("无权申报该专业类别的指标点")
//                    .build();
//        }
//
//        // 检查是否已申报过该指标点（排除被拒绝的）
//        if (applicationRepository.existsByUserIdAndIndicatorId(userId, dto.getIndicatorId())) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("已申报过该指标点，请勿重复申报")
//                    .build();
//        }
//
//        // 查找一级指标点（递归查找父节点直到一级）
//        Long firstIndicatorId = findFirstIndicatorId(indicator);
//
//        // 创建申报记录
//        Application application = Application.builder()
//                .userId(userId)
//                .firstIndicator(firstIndicatorId)
//                .indicatorId(dto.getIndicatorId())
//                .itemName(dto.getItemName())
//                .description(dto.getDescription())
//                .status("pending")
//                .build();
//
//        Application savedApplication = applicationRepository.save(application);
//
//        // 保存证明材料
//        if (dto.getEvidences() != null && !dto.getEvidences().isEmpty()) {
//            List<ApplicationEvidence> evidences = dto.getEvidences().stream()
//                    .map(evidence -> ApplicationEvidence.builder()
//                            .applicationId(savedApplication.getId())
//                            .fileName(evidence.getFileName())
//                            .fileUrl(evidence.getFileUrl())
//                            .build())
//                    .collect(Collectors.toList());
//
//            evidenceRepository.saveAll(evidences);
//        }
//
//        return savedApplication;
//    }
//
//    // ==================== 个人中心数据 ====================
//
//    public ProfileVO getProfile(Long userId) {
//        // 获取用户基本信息
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("用户不存在")
//                        .build());
//
//        // 获取学生详细信息
//        StudentInfo studentInfo = studentInfoRepository.findByUserId(userId)
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("学生信息不存在")
//                        .build());
//
//        Major major = majorRepository.findById(studentInfo.getMajorId())
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("专业信息不存在")
//                        .build());
//
//        // 获取成绩信息
//        StuScore score = stuScoreRepository.findByUserId(userId).orElse(null);
//
//        // 获取申报统计
//        List<Object[]> statusCounts = applicationRepository.countApplicationsByStatus(userId);
//        Map<String, Integer> statusMap = new HashMap<>();
//        int totalApplications = 0;
//
//        for (Object[] row : statusCounts) {
//            String status = (String) row[0];
//            Long count = (Long) row[1];
//            statusMap.put(status, count.intValue());
//            totalApplications += count.intValue();
//        }
//
//        // 计算综合分数
//        BigDecimal totalScore = calculateTotalScore(userId, score);
//
//        return ProfileVO.builder()
//                .studentId(user.getNumber())
//                .name(user.getName())
//                .college(user.getCollegeName())
//                .major(major.getName())
//                .weightedScore(score != null ? score.getWeightedScore() : null)
//                .majorRank(score != null ? score.getMajorRank() : null)
//                .scoreStatus(score != null ? (score.getStatus() == 1 ? "已认定" : "待审核") : "未提交")
//                .pendingCount(statusMap.getOrDefault("pending", 0))
//                .approvedCount(statusMap.getOrDefault("approved", 0))
//                .rejectedCount(statusMap.getOrDefault("rejected", 0))
//                .totalApplications(totalApplications)
//                .totalScore(totalScore)
//                .build();
//    }
//
//    // 其他方法保持不变...
//}