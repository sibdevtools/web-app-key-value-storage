package com.github.sibdevtools.web.app.kvs.api;

/**
 * @author sibmaks
 * @since 0.0.1
 */
public record SetValuePlRq(
        byte[] value,
        Long expiredAt
) {
}
