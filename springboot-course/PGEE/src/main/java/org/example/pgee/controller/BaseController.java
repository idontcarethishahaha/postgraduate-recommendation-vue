package org.example.pgee.controller;

import jakarta.servlet.http.HttpServletRequest;

/**
 * @author wuwenjin
 */
public class BaseController {

    protected Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("uid");  // token简写
    }

    protected String getRole(HttpServletRequest request) {
        return (String) request.getAttribute("role");
    }

    protected Long getCollegeId(HttpServletRequest request) {
        return (Long) request.getAttribute("cid");  // token简写
    }

    // 可选：获取其他token字段的方法
    protected Long getMajorCategoryId(HttpServletRequest request) {
        return (Long) request.getAttribute("mcid");  // token简写
    }

    protected Long getMajorId(HttpServletRequest request) {
        return (Long) request.getAttribute("mid");   // token简写
    }
}