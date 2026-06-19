package com.museum.relic.controller;

import com.museum.relic.dto.RelicRequest;
import com.museum.relic.dto.RelicResponse;
import com.museum.relic.service.RelicService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relics")
@RequiredArgsConstructor
public class RelicController {

    private final RelicService relicService;

    @PostMapping
    public ResponseEntity<RelicResponse> create(@Valid @RequestBody RelicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(relicService.createRelic(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RelicResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(relicService.getRelicById(id));
    }

    @GetMapping("/no/{relicNo}")
    public ResponseEntity<RelicResponse> getByNo(@PathVariable String relicNo) {
        return ResponseEntity.ok(relicService.getRelicByNo(relicNo));
    }

    @GetMapping
    public ResponseEntity<List<RelicResponse>> getAll() {
        return ResponseEntity.ok(relicService.getAllRelics());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RelicResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody RelicRequest request) {
        return ResponseEntity.ok(relicService.updateRelic(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        relicService.deleteRelic(id);
        return ResponseEntity.noContent().build();
    }
}
