package org.example.pgee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author wuwenjin
 */
/*
为学院添加类别，需要学院的id,加上要添加的类别名
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MajorCategoryAddDTO {
    private Long collegeId;
    private String name;
    private String calculationRule;
}
