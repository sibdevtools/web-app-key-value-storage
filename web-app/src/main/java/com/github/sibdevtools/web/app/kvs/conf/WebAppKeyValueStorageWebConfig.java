package com.github.sibdevtools.web.app.kvs.conf;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.VersionResourceResolver;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Configuration
@EnableWebMvc
public class WebAppKeyValueStorageWebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/web/app/key-value-storage/ui/**")
                .addResourceLocations("classpath:/web/app/key-value-storage/static/")
                .resourceChain(true)
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/web/app/key-value-storage/ui/")
                .setViewName("forward:/web/app/key-value-storage/ui/index.html");
        registry.addViewController("/web/app/key-value-storage/ui/service/**")
                .setViewName("forward:/web/app/key-value-storage/ui/index.html");
    }
}
