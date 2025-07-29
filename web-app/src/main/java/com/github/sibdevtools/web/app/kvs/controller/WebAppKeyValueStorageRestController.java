package com.github.sibdevtools.web.app.kvs.controller;

import com.github.sibdevtools.common.api.rs.StandardBodyRs;
import com.github.sibdevtools.common.api.rs.StandardRs;
import com.github.sibdevtools.session.api.rq.SetValueRq;
import com.github.sibdevtools.session.api.service.KeyValueStorageService;
import com.github.sibdevtools.web.app.kvs.api.GetValuePlRs;
import com.github.sibdevtools.web.app.kvs.api.SetValuePlRq;
import com.github.sibdevtools.web.app.kvs.api.ValueHolderRs;
import com.github.sibdevtools.web.app.kvs.api.ValueMetaRs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.chrono.ChronoZonedDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping(
        path = "/web/app/key-value-storage/rest/api",
        produces = MediaType.APPLICATION_JSON_VALUE
)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class WebAppKeyValueStorageRestController {
    private final Base64.Encoder encoder = Base64.getEncoder();

    private final KeyValueStorageService keyValueStorageService;

    @GetMapping(
            path = "/spaces/",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardBodyRs<ArrayList<String>> spaces(
    ) {
        val spaces = keyValueStorageService.getSpaces();
        return new StandardBodyRs<>(new ArrayList<>(spaces));
    }

    @GetMapping(
            path = "/spaces/{space}/",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardBodyRs<ArrayList<String>> keys(
            @PathVariable("space") String space
    ) {
        val keys = keyValueStorageService.getKeys(space);
        return new StandardBodyRs<>(new ArrayList<>(keys));
    }

    @DeleteMapping(
            path = "/spaces/{space}/",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardRs deleteSpace(
            @PathVariable("space") String space
    ) {
        keyValueStorageService.delete(space);
        return new StandardRs();
    }

    @PostMapping(
            path = "/spaces/{space}/{key}/",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardBodyRs<ValueMetaRs> setValue(
            @PathVariable("space") String space,
            @PathVariable("key") String key,
            @RequestBody SetValuePlRq plRq
    ) {
        val expiredAt = plRq.expiredAt();
        val rq = SetValueRq.builder()
                .space(space)
                .key(key)
                .value(plRq.value())
                .expiredAt(expiredAt == null ? null : ZonedDateTime.ofInstant(Instant.ofEpochMilli(expiredAt), ZoneOffset.UTC))
                .build();
        val rs = keyValueStorageService.set(rq);
        val meta = rs.getBody();
        val rsExpiredAt = Optional.ofNullable(meta.getExpiredAt())
                .map(ChronoZonedDateTime::toInstant)
                .map(Instant::toEpochMilli)
                .orElse(null);
        val metaRs = ValueMetaRs.builder()
                .createdAt(meta.getCreatedAt().toInstant().toEpochMilli())
                .modifiedAt(meta.getModifiedAt().toInstant().toEpochMilli())
                .expiredAt(rsExpiredAt)
                .build();
        return new StandardBodyRs<>(metaRs);
    }

    @GetMapping(
            path = "/spaces/{space}/{key}/",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public GetValuePlRs getValue(
            @PathVariable("space") String space,
            @PathVariable("key") String key
    ) {
        val rs = keyValueStorageService.get(space, key)
                .map(StandardBodyRs::getBody)
                .map(it -> {
                            val meta = it.getMeta();
                            val expiredAt = Optional.ofNullable(meta.getExpiredAt())
                                    .map(ChronoZonedDateTime::toInstant)
                                    .map(Instant::toEpochMilli)
                                    .orElse(null);
                            return ValueHolderRs.builder()
                                    .value(it.getValue() == null ? null : encoder.encodeToString(it.getValue()))
                                    .meta(
                                            ValueMetaRs.builder()
                                                    .createdAt(meta.getCreatedAt().toInstant().toEpochMilli())
                                                    .modifiedAt(meta.getModifiedAt().toInstant().toEpochMilli())
                                                    .expiredAt(expiredAt)
                                                    .build()
                                    )
                                    .build();
                        }
                ).orElse(null);
        return new GetValuePlRs(rs);
    }

    @DeleteMapping(
            path = "/spaces/{space}/{key}/",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardRs deleteKey(
            @PathVariable("space") String space,
            @PathVariable("key") String key
    ) {
        keyValueStorageService.delete(space, key);
        return new StandardRs();
    }

}
