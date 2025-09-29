package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.College;
import org.example.pgee.dox.MajorCategory;
import org.example.pgee.dto.CollegeAddDTO;
import org.example.pgee.dto.MajorCategoryAddDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.CollegeRepository;
import org.example.pgee.repository.MajorCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeService {
    private final CollegeRepository collegeRepository;
    private final MajorCategoryRepository majorCategoryRepository;

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

    // 为学院添加类别
    @Transactional
    public void addMajorCategory(MajorCategoryAddDTO majorCategoryAddDTO) {
        // 学院是否存在
        collegeRepository.findById(majorCategoryAddDTO.getCollegeId())
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院不存在，无法添加专业类别")
                        .build());

        // 该学院下是否已存在同名类别
        boolean nameExists = majorCategoryRepository.existsByCollegeIdAndName(
                majorCategoryAddDTO.getCollegeId(),
                majorCategoryAddDTO.getName()
        );
        if (nameExists) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该学院下已存在同名类别")
                    .build();
        }

        MajorCategory majorCategory = MajorCategory.builder()
                .collegeId(majorCategoryAddDTO.getCollegeId())
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
    @Transactional
    public void deleteMajorCategory(Long mcid) {
        if (!majorCategoryRepository.existsById(mcid)) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("此类别不存在")
                    .build();
        }
        majorCategoryRepository.deleteById(mcid);
    }
}