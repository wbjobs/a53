package com.museum.relic.service;

import com.museum.relic.dto.RelicRequest;
import com.museum.relic.dto.RelicResponse;
import com.museum.relic.entity.Relic;
import com.museum.relic.entity.User;
import com.museum.relic.repository.RelicRepository;
import com.museum.relic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelicService {

    private final RelicRepository relicRepository;
    private final UserRepository userRepository;

    @Transactional
    public RelicResponse createRelic(RelicRequest request) {
        if (relicRepository.existsByRelicNo(request.getRelicNo())) {
            throw new RuntimeException("文物编号已存在");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userRepository.findByUsername(username).orElse(null);

        Relic relic = Relic.builder()
                .relicNo(request.getRelicNo())
                .name(request.getName())
                .era(request.getEra())
                .source(request.getSource())
                .material(request.getMaterial())
                .description(request.getDescription())
                .createdBy(creator)
                .build();

        relic = relicRepository.save(relic);
        return toResponse(relic);
    }

    @Transactional(readOnly = true)
    public RelicResponse getRelicById(Long id) {
        Relic relic = relicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文物不存在"));
        return toResponse(relic);
    }

    @Transactional(readOnly = true)
    public RelicResponse getRelicByNo(String relicNo) {
        Relic relic = relicRepository.findByRelicNo(relicNo)
                .orElseThrow(() -> new RuntimeException("文物不存在"));
        return toResponse(relic);
    }

    @Transactional(readOnly = true)
    public List<RelicResponse> getAllRelics() {
        return relicRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RelicResponse updateRelic(Long id, RelicRequest request) {
        Relic relic = relicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文物不存在"));

        if (!relic.getRelicNo().equals(request.getRelicNo())
                && relicRepository.existsByRelicNo(request.getRelicNo())) {
            throw new RuntimeException("文物编号已存在");
        }

        relic.setRelicNo(request.getRelicNo());
        relic.setName(request.getName());
        relic.setEra(request.getEra());
        relic.setSource(request.getSource());
        relic.setMaterial(request.getMaterial());
        relic.setDescription(request.getDescription());

        relic = relicRepository.save(relic);
        return toResponse(relic);
    }

    @Transactional
    public void deleteRelic(Long id) {
        if (!relicRepository.existsById(id)) {
            throw new RuntimeException("文物不存在");
        }
        relicRepository.deleteById(id);
    }

    private RelicResponse toResponse(Relic relic) {
        return RelicResponse.builder()
                .id(relic.getId())
                .relicNo(relic.getRelicNo())
                .name(relic.getName())
                .era(relic.getEra())
                .source(relic.getSource())
                .material(relic.getMaterial())
                .description(relic.getDescription())
                .createdAt(relic.getCreatedAt())
                .updatedAt(relic.getUpdatedAt())
                .build();
    }
}
