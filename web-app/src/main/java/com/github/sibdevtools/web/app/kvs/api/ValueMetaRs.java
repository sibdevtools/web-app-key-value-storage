package com.github.sibdevtools.web.app.kvs.api;

import lombok.*;

import java.io.Serializable;
import java.time.ZonedDateTime;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValueMetaRs implements Serializable {
    private long createdAt;
    private long modifiedAt;
    private Long expiredAt;
    private long version;
}
