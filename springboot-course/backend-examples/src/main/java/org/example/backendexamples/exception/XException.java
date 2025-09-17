package org.example.backendexamples.exception;

import lombok.*;
import org.example.backendexamples.exception.Code;

/**
 * @author wuwenjin
 */
// 自定义异常
// 继承自非受检异常 unchecked
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class XException extends RuntimeException {
    private Code code; // 通用

    private int number;
    private String message;

}
