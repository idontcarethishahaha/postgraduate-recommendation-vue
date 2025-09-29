package org.example.pgee.dto;

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
public class MajorAddDTO {
    private Long collegeId;
    private Long majorCategoryId;
    private String name;
}
