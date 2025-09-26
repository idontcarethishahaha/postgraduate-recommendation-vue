package org.example.pgee.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.pgee.dox.User;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String actualRole = (String) request.getAttribute("role");
        String expectedRole = User.ADMIN;

        if (expectedRole.equals(actualRole)) {
            return true;
        }
        throw XException.builder().code(Code.FORBIDDEN).message("无权限").build();
    }
}