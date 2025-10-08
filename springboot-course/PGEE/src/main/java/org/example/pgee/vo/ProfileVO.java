package org.example.pgee.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @author wuwenjin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileVO {
    // 用户基本信息
    private String studentId;
    private String name;
    private String college;
    private String major;

    // 成绩信息
    private BigDecimal weightedScore;
    private Integer majorRank;
    private String scoreStatus;

    // 申报统计
    private Integer pendingCount;
    private Integer approvedCount;
    private Integer rejectedCount;
    private Integer totalApplications;

    // 综合分数
    private BigDecimal totalScore;
}
