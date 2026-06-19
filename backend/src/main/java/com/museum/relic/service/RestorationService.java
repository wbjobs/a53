package com.museum.relic.service;

import com.museum.relic.dto.RestorationRequest;
import com.museum.relic.dto.RestorationResponse;
import com.museum.relic.entity.Relic;
import com.museum.relic.entity.RestorationRecord;
import com.museum.relic.entity.User;
import com.museum.relic.repository.RelicRepository;
import com.museum.relic.repository.RestorationRecordRepository;
import com.museum.relic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestorationService {

    private final RestorationRecordRepository recordRepository;
    private final RelicRepository relicRepository;
    private final UserRepository userRepository;

    @Transactional
    public RestorationResponse createRecord(RestorationRequest request) {
        Relic relic = relicRepository.findById(request.getRelicId())
                .orElseThrow(() -> new RuntimeException("文物不存在"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User restorer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        RestorationRecord record = RestorationRecord.builder()
                .relic(relic)
                .restorer(restorer)
                .restorationDate(request.getRestorationDate())
                .materials(request.getMaterials())
                .operations(request.getOperations())
                .beforePhotoPath(request.getBeforePhotoPath())
                .afterPhotoPath(request.getAfterPhotoPath())
                .notes(request.getNotes())
                .build();

        record = recordRepository.save(record);
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public RestorationResponse getRecordById(Long id) {
        RestorationRecord record = recordRepository.findByIdWithFetch(id)
                .orElseThrow(() -> new RuntimeException("修复记录不存在"));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getRecordsByRelicId(Long relicId) {
        return recordRepository.findByRelicIdWithFetch(relicId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getRecordsByRelicNo(String relicNo) {
        Relic relic = relicRepository.findByRelicNo(relicNo)
                .orElseThrow(() -> new RuntimeException("文物不存在"));
        return getRecordsByRelicId(relic.getId());
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getRecordsByRestorerId(Long restorerId) {
        return recordRepository.findByRestorerIdWithFetch(restorerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllRecordsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "restorationDate"));
        Page<RestorationRecord> recordPage = recordRepository.findAllWithFetchPageable(pageable);

        List<RestorationResponse> content = recordPage.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("totalElements", recordPage.getTotalElements());
        response.put("totalPages", recordPage.getTotalPages());
        response.put("currentPage", recordPage.getNumber());
        response.put("pageSize", recordPage.getSize());
        return response;
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getAllRecords() {
        return recordRepository.findAllWithFetch()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RestorationResponse toResponse(RestorationRecord record) {
        return RestorationResponse.builder()
                .id(record.getId())
                .relicId(record.getRelic().getId())
                .relicNo(record.getRelic().getRelicNo())
                .relicName(record.getRelic().getName())
                .restorerId(record.getRestorer().getId())
                .restorerName(record.getRestorer().getRealName())
                .restorationDate(record.getRestorationDate())
                .materials(record.getMaterials())
                .operations(record.getOperations())
                .beforePhotoPath(record.getBeforePhotoPath())
                .afterPhotoPath(record.getAfterPhotoPath())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
