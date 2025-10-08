package org.example.pgee.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author wuwenjin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceVO {
    private String fileName;
    private String fileUrl;
}
