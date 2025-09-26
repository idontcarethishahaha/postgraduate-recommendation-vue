package org.example.pgee.dto;

/*
 * @author wuwenjin
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 新增学院的DTO（仅含添加学院所需的字段）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeAddDTO {
    private String name;
}