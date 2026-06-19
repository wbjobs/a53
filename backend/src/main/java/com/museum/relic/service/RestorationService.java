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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestorationService {

    private final RestorationRecordRepository recordRepository;
    private final RelicRepository relicRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;

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
        RestorationRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("修复记录不存在"));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getRecordsByRelicId(Long relicId) {
        return recordRepository.findByRelicIdOrderByRestorationDateDesc(relicId)
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
        return recordRepository.findByRestorerIdOrderByRestorationDateDesc(restorerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestorationResponse> getAllRecords() {
        return recordRepository.findAll()
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
