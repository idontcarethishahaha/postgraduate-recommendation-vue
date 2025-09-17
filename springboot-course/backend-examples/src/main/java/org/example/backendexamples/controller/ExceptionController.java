package org.example.backendexamples.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.backendexamples.exception.Code;
import org.example.backendexamples.vo.ResultVO;
import org.example.backendexamples.exception.Code;
import org.example.backendexamples.exception.XException;
import org.example.backendexamples.vo.ResultVO;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
/**
 * @author wuwenjin
 */
@Slf4j
@RestControllerAdvice
public class ExceptionController {

    // 一旦spring容器捕获该类型的异常，就交给这个方法来处理，并将其作为方法的参数
    @ExceptionHandler(XException.class)
    public ResultVO handleXException(XException e) {
        if (e.getCode() != null){
            return ResultVO.error(e.getCode());// 通用的
        }
        // 自定义的
        return ResultVO.error(e.getNumber(), e.getMessage()); // 方法重载
    }
    // 兜底处理
    @ExceptionHandler(Exception.class)
    public ResultVO handleException(Exception e) {
        return ResultVO.error(Code.ERROR, e.getMessage());
    }
}
// 封装，序列化，返给前端