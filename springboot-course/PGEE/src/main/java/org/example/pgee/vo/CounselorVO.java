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
public class CounselorVO {
    private String name;        // 姓名
    private String tel;         // 电话
    private String categoryName; // 类别名称
}
