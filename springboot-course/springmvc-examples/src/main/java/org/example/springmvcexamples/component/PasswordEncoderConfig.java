package org.example.springmvcexamples.component;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author wuwenjin
 */
//在 Spring 容器中生成并注册一个 PasswordEncoder 类型的组件（Bean）
/*
类上标注了 @Configuration，表明这是一个配置类，Spring 会扫描并解析其中的配置。

方法 passwordEncoder() 上标注了 @Bean，表示这个方法的返回值
（BCryptPasswordEncoder 实例，它是 PasswordEncoder 接口的实现类）
会被注册到 Spring 容器中。
 */
@Configuration
public class PasswordEncoderConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
