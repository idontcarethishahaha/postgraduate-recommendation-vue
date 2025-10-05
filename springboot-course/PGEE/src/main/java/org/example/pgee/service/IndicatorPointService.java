package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.pgee.dox.IndicatorPoint;
import org.example.pgee.dto.IndicatorPointDTO;
import org.example.pgee.dto.IndicatorPointTreeDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.IndicatorPointRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndicatorPointService {
    private final IndicatorPointRepository indicatorPointRepository;

    @Transactional
    public IndicatorPoint addIndicatorPoint(IndicatorPointDTO dto) {
        // 验证同级同名
        if (indicatorPointRepository.existsByParentIdAndName(dto.getParentId(), dto.getName())) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("同级下已存在同名指标点")
                    .build();
        }

        // 自动设置层级
        Integer level = dto.getParentId() == null ? 1 :
                indicatorPointRepository.findById(dto.getParentId())
                        .map(p -> p.getLevel() + 1)
                        .orElseThrow(() -> XException.builder()
                                .number(Code.ERROR)
                                .message("父节点不存在")
                                .build());

        IndicatorPoint point = IndicatorPoint.builder()
                .majorCategoryId(dto.getMajorCategoryId())
                .name(dto.getName())
                .level(level)
                .description(dto.getDescription())
                .maxScore(dto.getMaxScore())
                .itemUpperLimit(dto.getItemUpperLimit())
                .parentId(dto.getParentId())
                .isLeaf(true)
                .build();

        IndicatorPoint saved = indicatorPointRepository.save(point);

        // 如果父节点存在，更新父节点为非叶子节点
        if (saved.getParentId() != null) {
            indicatorPointRepository.updateLeafStatus(saved.getParentId(), false);
        }

        return saved;
    }

    @Transactional
    public IndicatorPoint updateIndicatorPoint(Long id, IndicatorPointDTO dto) {
        IndicatorPoint point = indicatorPointRepository.findById(id)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("指标点不存在")
                        .build());

        // 验证同级同名
        boolean existsSameName = indicatorPointRepository.findByParentId(dto.getParentId())
                .stream()
                .filter(p -> !p.getId().equals(id))
                .anyMatch(p -> p.getName().equals(dto.getName()));

        if (existsSameName) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("同级下已存在同名指标点")
                    .build();
        }

        point.setName(dto.getName());
        point.setDescription(dto.getDescription());
        point.setMaxScore(dto.getMaxScore());
        point.setItemUpperLimit(dto.getItemUpperLimit());

        return indicatorPointRepository.save(point);
    }

    @Transactional
    public void deleteIndicatorPoint(Long id) {
        IndicatorPoint point = indicatorPointRepository.findById(id)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("指标点不存在")
                        .build());

        // 检查是否有子节点
        if (indicatorPointRepository.existsByParentId(id)) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该指标点存在子节点，无法删除")
                    .build();
        }

        indicatorPointRepository.deleteById(id);

        // 检查父节点是否变成叶子节点
        if (point.getParentId() != null &&
                !indicatorPointRepository.existsByParentId(point.getParentId())) {
            indicatorPointRepository.updateLeafStatus(point.getParentId(), true);
        }
    }

    public List<IndicatorPointTreeDTO> getIndicatorTree(Long majorCategoryId) {
        // 1. 查询所有相关指标点
        List<IndicatorPoint> allPoints = indicatorPointRepository.findByMajorCategoryId(majorCategoryId);

        // 2. 构建父节点ID到子节点列表的映射
        Map<Long, List<IndicatorPoint>> childrenMap = allPoints.stream()
                .filter(point -> point.getParentId() != null)
                .collect(Collectors.groupingBy(IndicatorPoint::getParentId));

        // 3. 找出所有根节点（parentId为null的节点）
        return allPoints.stream()
                .filter(point -> point.getParentId() == null)
                .map(root -> convertToTreeDTO(root, childrenMap))
                .collect(Collectors.toList());
    }

    private IndicatorPointTreeDTO convertToTreeDTO(IndicatorPoint point,
                                                   Map<Long, List<IndicatorPoint>> childrenMap) {
        // 转换基础字段
        IndicatorPointTreeDTO dto = IndicatorPointTreeDTO.builder()
                .id(point.getId())
                .majorCategoryId(point.getMajorCategoryId())
                .name(point.getName())
                .level(point.getLevel())
                .description(point.getDescription())
                .maxScore(point.getMaxScore())
                .itemUpperLimit(point.getItemUpperLimit())
                .isLeaf(point.getIsLeaf())
                .createTime(point.getCreateTime())
                .updateTime(point.getUpdateTime())
                .build();

        // 递归构建子节点
        List<IndicatorPoint> children = childrenMap.get(point.getId());
        if (children != null && !children.isEmpty()) {
            dto.setChildren(children.stream()
                    .map(child -> convertToTreeDTO(child, childrenMap))
                    .collect(Collectors.toList()));
        } else {
            dto.setChildren(Collections.emptyList());
        }

        return dto;
    }

//    private void buildTree(IndicatorPoint parent, Map<Long, List<IndicatorPoint>> childrenMap) {
//        List<IndicatorPoint> children = childrenMap.get(parent.getId());
//        if (children != null) {
//            children.forEach(child -> {
//                buildTree(child, childrenMap);
//            });
//        }
//    }

    public List<IndicatorPoint> getChildren(Long parentId) {
        return indicatorPointRepository.findByParentId(parentId);
    }
}