package com.github.sibdevtools.web.app.kvs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Standalone application entry point
 *
 * @author sibmaks
 * @since 0.0.1
 */
@EntityScan(basePackages = "com.github.sibdevtools")
@EnableScheduling
@SpringBootApplication(scanBasePackages = {
        "com.github.sibdevtools.web.app.kvs.config",
        "com.github.sibdevtools"
})
public class StandaloneApplication {
    /**
     * Application entry point
     *
     * @param args arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(StandaloneApplication.class, args);
    }

}
