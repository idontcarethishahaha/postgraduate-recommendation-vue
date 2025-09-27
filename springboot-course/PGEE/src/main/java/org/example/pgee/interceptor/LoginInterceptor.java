package org.example.pgee.interceptor;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.pgee.component.JWTComponent;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 • @author wuwenjin

 */
@Component
@RequiredArgsConstructor
public class LoginInterceptor implements HandlerInterceptor {

    // 注入token的组件
    private final JWTComponent jwtComponent;

    // ctrl + i
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("token");
        if(token == null){
            throw XException.builder().code(Code.UNAUTHORIZED).build(); // 未登录异常
        }
        // token 解密
        DecodedJWT decode = jwtComponent.decode(token);
        //String uid = decode.getClaim("uid").asString();
        Long uid = decode.getClaim("uid").asLong();
        String role = decode.getClaim("role").asString();
        request.setAttribute("uid", uid);
        request.setAttribute("role", role);
        return true;
    }
}