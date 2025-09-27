package org.example.pgee.component;

import lombok.RequiredArgsConstructor;
import org.example.pgee.interceptor.AdminInterceptor;
import org.example.pgee.interceptor.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author wuwenjin
 */
// 拦截器配置类

@Configuration //标记这是spring配置类
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
/*实现 WebMvcConfigurer 接口，重写 addInterceptors 方法来自定义 Spring MVC 的拦截器规则*/
    private final LoginInterceptor loginInterceptor;
    private final AdminInterceptor adminInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/api/**") // 拦截所有以 /api/ 开头的请求
                .excludePathPatterns("/api/open/login"); // 排除 /api/open/login 请求（登录接口无需拦截）

        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/api/admin/**");
    }
}