package com.github.sibdevtools.web.app.kvs.api;

import java.io.Serializable;

/**
 * @author sibmaks
 * @since 0.0.1
 */
public record SetValuePlRq(
        Serializable value,
        long expiredAt
) {
}
