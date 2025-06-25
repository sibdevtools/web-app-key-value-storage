package com.github.sibdevtools.web.app.kvs.api;

import lombok.*;

import java.io.Serializable;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValueHolderRs implements Serializable {
    private Object value;
    private ValueMetaRs meta;
}
