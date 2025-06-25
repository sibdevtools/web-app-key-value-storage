package com.github.sibdevtools.web.app.kvs.api;

import com.github.sibdevtools.common.api.dto.ErrorRsDto;
import com.github.sibdevtools.common.api.rs.StandardBodyRs;

/**
 * @author sibmaks
 * @since 0.0.1
 */
public class GetValuePlRs extends StandardBodyRs<ValueHolderRs> {

    public GetValuePlRs(ValueHolderRs body) {
        super(body);
    }

    public GetValuePlRs(ErrorRsDto error) {
        super(error);
    }
}
