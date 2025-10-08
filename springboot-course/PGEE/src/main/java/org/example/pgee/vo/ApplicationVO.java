package org.example.pgee.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author wuwenjin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationVO {
    private Long id;
    private Long indicatorId;
    private String indicatorName;
    private String itemName;
    private String description;
    private String status;
    private LocalDateTime createTime;
    private List<EvidenceVO> evidences;
}
