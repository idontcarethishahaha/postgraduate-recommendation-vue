package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.College;
import org.example.pgee.dox.Major;
import org.example.pgee.dox.MajorCategory;
import org.example.pgee.dto.*;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.CollegeRepository;
import org.example.pgee.repository.MajorCategoryRepository;
import org.example.pgee.repository.MajorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeService {
    private final CollegeRepository collegeRepository;
    private final MajorCategoryRepository majorCategoryRepository;
    private final MajorRepository majorRepository;

    // 添加学院
    @Transactional
    public void addCollege(CollegeAddDTO collegeAddDTO) {
        boolean nameExists = collegeRepository.existsByName(collegeAddDTO.getName());
        if (nameExists) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院名称已存在")
                    .build();
        }

        College college = College.builder()
                .name(collegeAddDTO.getName())
                .build();
        collegeRepository.save(college);
    }

    // 查询所有学院
    public List<College> listAllColleges() {
        List<College> colleges = new ArrayList<>();
        collegeRepository.findAll().forEach(colleges::add);
        return colleges;
    }

    // 删除学院
    @Transactional
    public void deleteCollege(Long id) {
        if (!collegeRepository.existsById(id)) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("学院不存在")
                    .build();
        }
        collegeRepository.deleteById(id);
    }

//    // 为学院添加类别
//    @Transactional
//    public void addMajorCategory(MajorCategoryAddDTO majorCategoryAddDTO) {
//        // 学院是否存在
//        collegeRepository.findById(majorCategoryAddDTO.getCollegeId())
//                .orElseThrow(() -> XException.builder()
//                        .number(Code.ERROR)
//                        .message("学院不存在，无法添加专业类别")
//                        .build());
//
//        // 该学院下是否已存在同名类别
//        boolean nameExists = majorCategoryRepository.existsByCollegeIdAndName(
//                majorCategoryAddDTO.getCollegeId(),
//                majorCategoryAddDTO.getName()
//        );
//        if (nameExists) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("该学院下已存在同名类别")
//                    .build();
//        }
//
//        MajorCategory majorCategory = MajorCategory.builder()
//                .collegeId(majorCategoryAddDTO.getCollegeId())
//                .name(majorCategoryAddDTO.getName())
//                .calculationRule(majorCategoryAddDTO.getCalculationRule())
//                .build();
//        majorCategoryRepository.save(majorCategory);
//    }

    // 为学院添加类别 - 现在完全从token获取学院ID
    @Transactional
    public void addMajorCategory(MajorCategoryAddDTO majorCategoryAddDTO, Long collegeId) {
        // 学院是否存在（使用从token获取的collegeId）
        collegeRepository.findById(collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院不存在，无法添加专业类别")
                        .build());

        // 该学院下是否已存在同名类别
        boolean nameExists = majorCategoryRepository.existsByCollegeIdAndName(
                collegeId,  // 使用从token获取的collegeId
                majorCategoryAddDTO.getName()
        );
        if (nameExists) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该学院下已存在同名类别")
                    .build();
        }

        MajorCategory majorCategory = MajorCategory.builder()
                .collegeId(collegeId)  // 使用从token获取的collegeId
                .name(majorCategoryAddDTO.getName())
                .calculationRule(majorCategoryAddDTO.getCalculationRule())
                .build();
        majorCategoryRepository.save(majorCategory);
    }

    // 查询某学院下的所有类别
//    public List<MajorCategory> listAllMajorCategories(Long cid) {
//        List<MajorCategory> majorCategories = new ArrayList<>();
//        majorCategoryRepository.findAll().forEach(majorCategories::add);
//        return majorCategories;
//    }

    public List<MajorCategory> listAllMajorCategories(Long cid) {
        // 假设MajorCategory实体有collegeId字段，关联学院ID
        // 调用Repository按学院ID查询（需在MajorCategoryRepository中定义方法）
        return majorCategoryRepository.findByCollegeId(cid);
    }

    // 删除学院下的某个类别
//    @Transactional
//    public void deleteMajorCategory(Long mcid) {
//        if (!majorCategoryRepository.existsById(mcid)) {
//            throw XException.builder()
//                    .number(Code.ERROR)
//                    .message("此类别不存在")
//                    .build();
//        }
//        majorCategoryRepository.deleteById(mcid);
//    }

    // 删除学院下的某个类别（增加学院权限验证
    @Transactional
    public void deleteMajorCategory(Long mcid, Long collegeId) {
        // 先查询类别是否存在且属于当前学院
        MajorCategory category = majorCategoryRepository.findById(mcid)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("类别不存在")
                        .build());

        // 验证类别是否属于当前学院
        if (!category.getCollegeId().equals(collegeId)) {
            throw XException.builder()
                    .code(Code.FORBIDDEN) // 403无权限异常
                    .build();
        }

        // 可选：检查类别下是否有专业，如果有则不允许删除
        // boolean hasMajors = majorRepository.existsByMajorCategoryId(mcid);
        // if (hasMajors) {
        //     throw XException.builder()
        //             .number(Code.ERROR)
        //             .message("该类别下存在专业，无法删除")
        //             .build();
        // }

        majorCategoryRepository.deleteById(mcid);
    }

    // 修改类别信息
    @Transactional
    public void updateMajorCategory(Long mcid, MajorCategoryUpdateDTO updateDTO, Long collegeId) {
        // 查询类别是否存在且属于当前学院
        MajorCategory category = majorCategoryRepository.findById(mcid)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("类别不存在")
                        .build());

        // 验证类别是否属于当前学院
        if (!category.getCollegeId().equals(collegeId)) {
            throw XException.builder()
                    .code(Code.FORBIDDEN)
                    .build();
        }

        // 检查名称是否重复（排除自身）
        if (updateDTO.getName() != null && !updateDTO.getName().equals(category.getName())) {
            boolean nameExists = majorCategoryRepository.existsByCollegeIdAndName(
                    collegeId, updateDTO.getName());
            if (nameExists) {
                throw XException.builder()
                        .number(Code.ERROR)
                        .message("该学院下已存在同名类别")
                        .build();
            }
            category.setName(updateDTO.getName());
        }

        // 更新计算规则
        if (updateDTO.getCalculationRule() != null) {
            category.setCalculationRule(updateDTO.getCalculationRule());
        }

        majorCategoryRepository.save(category);
    }

    @Transactional
    public void addMajor(MajorAddDTO majorAddDTO, Long collegeId) {
        // 验证类别是否存在且属于当前学院
        MajorCategory category = majorCategoryRepository.findById(majorAddDTO.getMajorCategoryId())
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("专业类别不存在")
                        .build());

        // 验证类别是否属于当前学院
        if (!category.getCollegeId().equals(collegeId)) {
            throw XException.builder()
                    .code(Code.FORBIDDEN)
                    .build();
        }

        // 检查同一类别下是否已存在同名专业
        boolean nameExists = majorRepository.existsByMajorCategoryIdAndName(
                majorAddDTO.getMajorCategoryId(),
                majorAddDTO.getName()
        );
        if (nameExists) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该类别下已存在同名专业")
                    .build();
        }

        Major major = Major.builder()
                .name(majorAddDTO.getName())
                .majorCategoryId(majorAddDTO.getMajorCategoryId())
                .collegeId(collegeId) // 设置学院ID
                .build();

        majorRepository.save(major);
    }

    // 查询某类别下的所有专业
    public List<Major> listMajorsByCategory(Long majorCategoryId, Long collegeId) {
        // 先验证类别是否属于当前学院
        MajorCategory category = majorCategoryRepository.findById(majorCategoryId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("专业类别不存在")
                        .build());

        if (!category.getCollegeId().equals(collegeId)) {
            throw XException.builder()
                    .code(Code.FORBIDDEN)
                    .build();
        }

        return majorRepository.findByMajorCategoryId(majorCategoryId);
    }

    // 查询学院下的所有专业
    public List<Major> listAllMajors(Long collegeId) {
        return majorRepository.findByCollegeId(collegeId);
    }

    // 修改专业信息
    @Transactional
    public void updateMajor(Long majorId, MajorUpdateDTO updateDTO, Long collegeId) {
        // 查询专业是否存在且属于当前学院
        Major major = majorRepository.findByIdAndCollegeId(majorId, collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("专业不存在或无权操作")
                        .build());

        // 检查名称是否重复（排除自身）
        if (updateDTO.getName() != null && !updateDTO.getName().equals(major.getName())) {
            boolean nameExists = majorRepository.existsByMajorCategoryIdAndName(
                    major.getMajorCategoryId(), updateDTO.getName());
            if (nameExists) {
                throw XException.builder()
                        .number(Code.ERROR)
                        .message("该类别下已存在同名专业")
                        .build();
            }
            major.setName(updateDTO.getName());
        }

        majorRepository.save(major);
    }

    // 删除专业
    @Transactional
    public void deleteMajor(Long majorId, Long collegeId) {
        // 查询专业是否存在且属于当前学院
        Major major = majorRepository.findByIdAndCollegeId(majorId, collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("专业不存在或无权操作")
                        .build());

        majorRepository.deleteById(majorId);
    }

}