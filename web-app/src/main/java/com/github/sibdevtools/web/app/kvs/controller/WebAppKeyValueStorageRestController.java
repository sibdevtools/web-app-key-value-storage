package com.github.sibdevtools.web.app.kvs.controller;

import com.github.sibdevtools.common.api.rs.StandardBodyRs;
import com.github.sibdevtools.common.api.rs.StandardRs;
import com.github.sibdevtools.session.api.rq.SetValueRq;
import com.github.sibdevtools.session.api.service.KeyValueStorageService;
import com.github.sibdevtools.web.app.kvs.api.SetValuePlRq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;

@Slf4j
@RestController
@RequestMapping(
        path = "/web/app/key-value-storage/rest/api",
        produces = MediaType.APPLICATION_JSON_VALUE
)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class WebAppKeyValueStorageRestController {
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
    public StandardRs setValue(
            @PathVariable("space") String space,
            @PathVariable("key") String key,
            @RequestBody SetValuePlRq plRq
    ) {
        val rq = SetValueRq.builder()
                .space(space)
                .key(key)
                .value(plRq.value())
                .expiredAt(ZonedDateTime.ofInstant(Instant.ofEpochMilli(plRq.expiredAt()), ZoneOffset.UTC))
                .build();
        keyValueStorageService.set(rq);
        return new StandardRs();
    }


}
