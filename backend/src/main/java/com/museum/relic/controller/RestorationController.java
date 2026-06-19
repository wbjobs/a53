package com.museum.relic.controller;

import com.museum.relic.dto.RestorationRequest;
import com.museum.relic.dto.RestorationResponse;
import com.museum.relic.service.RestorationService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restorations")
@RequiredArgsConstructor
public class RestorationController {

    private final RestorationService restorationService;

    @PostMapping
    public ResponseEntity<RestorationResponse> create(@Valid @RequestBody RestorationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restorationService.createRecord(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestorationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restorationService.getRecordById(id));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPaged(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(restorationService.getAllRecordsPaged(page, size));
    }

    @GetMapping("/relic/{relicId}")
    public ResponseEntity<List<RestorationResponse>> getByRelicId(@PathVariable Long relicId) {
        return ResponseEntity.ok(restorationService.getRecordsByRelicId(relicId));
    }

    @GetMapping("/relic-no/{relicNo}")
    public ResponseEntity<List<RestorationResponse>> getByRelicNo(@PathVariable String relicNo) {
        return ResponseEntity.ok(restorationService.getRecordsByRelicNo(relicNo));
    }

    @GetMapping("/restorer/{restorerId}")
    public ResponseEntity<List<RestorationResponse>> getByRestorerId(
            @PathVariable Long restorerId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(restorationService.getRecordsByRestorerId(restorerId));
    }
}
