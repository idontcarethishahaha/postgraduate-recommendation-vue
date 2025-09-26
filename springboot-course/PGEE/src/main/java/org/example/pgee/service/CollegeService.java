package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import org.example.pgee.dox.College;
import org.example.pgee.dto.CollegeAddDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.CollegeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeService {
    private final CollegeRepository collegeRepository;

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
        collegeRepository.findAll().forEach(colleges::add); // 遍历添加到 List
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
}