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
        if(User.ADMIN.equals(request.getAttribute("role"))) {
            return true;
        }
        throw XException
                .builder()
                .code(Code.FORBIDDEN)//无权限异常
                .build();
    }
}