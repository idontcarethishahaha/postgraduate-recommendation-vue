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

        // 验证叶子节点逻辑 - 新增的验证逻辑
        if (Boolean.TRUE.equals(dto.getIsLeaf()) && dto.getParentId() != null) {
            // 检查父节点是否存在且是否为叶子节点
            IndicatorPoint parent = indicatorPointRepository.findById(dto.getParentId())
                    .orElseThrow(() -> XException.builder()
                            .number(Code.ERROR)
                            .message("父节点不存在")
                            .build());

            if (Boolean.TRUE.equals(parent.getIsLeaf())) {
                throw XException.builder()
                        .number(Code.ERROR)
                        .message("不能在叶子节点下添加子节点")
                        .build();
            }
        }

        // 设置默认的叶子节点状态
        Boolean isLeaf = dto.getIsLeaf() != null ? dto.getIsLeaf() : true;

        IndicatorPoint point = IndicatorPoint.builder()
                .majorCategoryId(dto.getMajorCategoryId())
                .name(dto.getName())
                .level(level)
                .description(dto.getDescription())
                .maxScore(dto.getMaxScore())
                .itemUpperLimit(dto.getItemUpperLimit())
                .parentId(dto.getParentId())
                .isLeaf(isLeaf)  // 使用传入的isLeaf值，默认为true
                .build();

        IndicatorPoint saved = indicatorPointRepository.save(point);

        // 如果父节点存在且新节点不是叶子节点，更新父节点为非叶子节点
        if (saved.getParentId() != null && Boolean.FALSE.equals(saved.getIsLeaf())) {
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

        // 验证叶子节点状态变更 - 新增的验证逻辑
        if (Boolean.TRUE.equals(dto.getIsLeaf()) && !Boolean.TRUE.equals(point.getIsLeaf())) {
            // 检查是否有子节点
            if (indicatorPointRepository.existsByParentId(id)) {
                throw XException.builder()
                        .number(Code.ERROR)
                        .message("该指标点存在子节点，不能改为叶子节点")
                        .build();
            }
        }

        point.setName(dto.getName());
        point.setDescription(dto.getDescription());
        point.setMaxScore(dto.getMaxScore());
        point.setItemUpperLimit(dto.getItemUpperLimit());
        point.setIsLeaf(dto.getIsLeaf());  // 更新叶子节点状态

        IndicatorPoint updated = indicatorPointRepository.save(point);

        // 如果从非叶子节点变为叶子节点，需要检查是否有子节点
        if (Boolean.TRUE.equals(dto.getIsLeaf()) && indicatorPointRepository.existsByParentId(id)) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该指标点存在子节点，不能设置为叶子节点")
                    .build();
        }

        return updated;
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
                .isLeaf(point.getIsLeaf())  // 包含叶子节点信息
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

    public List<IndicatorPoint> getChildren(Long parentId) {
        return indicatorPointRepository.findByParentId(parentId);
    }
}