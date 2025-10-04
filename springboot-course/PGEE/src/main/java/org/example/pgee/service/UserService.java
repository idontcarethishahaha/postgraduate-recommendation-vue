package org.example.pgee.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.pgee.dox.CounselorInfo;
import org.example.pgee.dox.MajorCategory;
import org.example.pgee.dox.StudentInfo;
import org.example.pgee.dox.User;
import org.example.pgee.dto.CounselorAddDTO;
import org.example.pgee.dto.StudentRegisterDTO;
import org.example.pgee.exception.Code;
import org.example.pgee.exception.XException;
import org.example.pgee.repository.*;
import org.example.pgee.vo.CounselorVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author wuwenjin
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CollegeRepository collegeRepository;

    private final CounselorInfoRepository counselorInfoRepository;
    private final StudentInfoRepository studentInfoRepository;
    private final MajorCategoryRepository majorCategoryRepository;

    public Optional<User> getUser(String account) {
        return userRepository.findByAccount(account);
    }

    // 用户集合 - 返回包含String ID的用户列表
    public List<User> listUsers(){
        return userRepository.findAll();
    }

    // 根据用户ID查询辅导员信息
    public Optional<CounselorInfo> getCounselorInfo(Long userId) {
        return counselorInfoRepository.findByUserId(userId);
    }

    // 根据用户ID查询学生信息
    public Optional<StudentInfo> getStudentInfo(Long userId) {
        return studentInfoRepository.findByUserId(userId);
    }

    // 重置用户密码
    @Transactional
    public void updateUserPassword(String account) {
        User user = userRepository.findByAccount(account)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build());
        user.setPassword(passwordEncoder.encode(account));
        userRepository.save(user);
    }

    @Transactional
    public void updateUserPasswordById(Long uid, String password){
        User user = userRepository.findById(uid).orElse(null);
        if(user == null){
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("用户不存在")
                    .build();
        }
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    //-----------------------------------------------------------------------------------
    // 添加学院管理员
    @Transactional
    public void addCollegeAdmin(Long collegeId, User user) {
        collegeRepository.findById(collegeId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院不存在")
                        .build());

        if (userRepository.findByAccount(user.getAccount()).isPresent()) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("账号已存在")
                    .build();
        }

        // 设置角色和学院
        user.setRole(User.COLLEGE_ADMIN);
        user.setCollegeId(collegeId);

        // 设置默认密码
        String password = user.getPassword() != null ? user.getPassword() : user.getAccount();
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);
    }

    // 获取学院管理员列表
    public List<User> getCollegeAdmins(Long collegeId) {
        return userRepository.findByCollegeIdAndRole(collegeId, User.COLLEGE_ADMIN);
    }

    // 移除学院管理员
    @Transactional
    public void removeCollegeAdmin(Long collegeId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build());

        // 验证用户是否属于该学院且是学院管理员
        if (!user.getCollegeId().equals(collegeId) || !User.COLLEGE_ADMIN.equals(user.getRole())) {
            throw XException.builder()
                    .code(Code.FORBIDDEN)
                    .build();
        }

        userRepository.delete(user);
    }

    // 验证用户是否为指定学院的学院管理员
    public void validateCollegeAdmin(Long collegeId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build());

        if (!User.COLLEGE_ADMIN.equals(user.getRole()) ||
                !collegeId.equals(user.getCollegeId())) {
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("该用户不是指定学院的学院管理员")
                    .build();
        }
    }

    // 根据ID获取用户
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("用户不存在")
                        .build());
    }

    //-----------------------------------------------------------------------------------
    // 添加辅导员
    @Transactional
    public void addCounselor(Long collegeId, CounselorAddDTO counselorAddDTO) {
        //检查账号是否已存在
        if(userRepository.existsByAccount(counselorAddDTO.getAccount())){
            throw XException.builder()
                    .number(Code.ERROR)
                    .message("账号已存在")
                    .build();
        }

        // 验证专业类别是否存在且属于当前学院
        MajorCategory category = majorCategoryRepository.findById(counselorAddDTO.getMajorCategoryId())
                .orElseThrow(() -> XException.builder()
                        .number(Code.ERROR)
                        .message("学院下不存在该类别")
                        .build());

        if (!category.getCollegeId().equals(collegeId)) {
            throw XException.builder()
                    .code(Code.FORBIDDEN)//无权操作其他学院
                    .build();
        }

        // 创建用户
        User user = User.builder()
                .name(counselorAddDTO.getName())
                .account(counselorAddDTO.getAccount())
                .tel(counselorAddDTO.getTel())
                .role(User.COUNSELOR)
                .collegeId(collegeId)
                .build();
        //设置默认密码
        String password = user.getPassword() != null ? user.getPassword() : user.getAccount();
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(user);

        // 创建辅导员信息关联
        CounselorInfo counselorInfo = CounselorInfo.builder()
                .userId(savedUser.getId())
                .majorCategoryId(counselorAddDTO.getMajorCategoryId())
                .build();

        counselorInfoRepository.save(counselorInfo);
    }

    // 学院管理员查询辅导员及其类别信息
    @Transactional(readOnly = true)
    public List<CounselorVO> getCounselorsWithCategory(Long collegeId) {
        try {
            // 查询该学院的所有辅导员信息记录
            List<CounselorInfo> counselorInfos = counselorInfoRepository.findCounselorsByCollegeAndRole(collegeId, User.COUNSELOR);

            if (counselorInfos.isEmpty()) {
                return Collections.emptyList();
            }

            List<CounselorVO> result = new ArrayList<>();

            for (CounselorInfo counselorInfo : counselorInfos) {
                // 查询辅导员用户信息
                User user = userRepository.findById(counselorInfo.getUserId())
                        .orElse(null);
                if (user == null) {
                    continue; // 如果用户不存在，跳过
                }

                // 查询专业类别信息
                String categoryName = "未分配";
                Optional<MajorCategory> category = majorCategoryRepository.findById(counselorInfo.getMajorCategoryId());
                if (category.isPresent()) {
                    categoryName = category.get().getName();
                }

                result.add(CounselorVO.builder()
                        .name(user.getName())
                        .tel(user.getTel())
                        .categoryName(categoryName)
                        .build());
            }

            return result;
        } catch (Exception e) {
            throw new RuntimeException("查询辅导员列表失败", e);
        }
    }

    //-------------------------------------------------------------------------------
    //注册学生用的
    @Transactional
    public void registerStudent(StudentRegisterDTO registerDTO) {
        // 检查账号（学号）是否已存在
        if (userRepository.findByAccount(registerDTO.getAccount()).isPresent()) {
            throw XException.builder().number(Code.ERROR).message("账号已存在").build();
        }

        // 创建用户
        User user = User.builder()
                .name(registerDTO.getName())
                .account(registerDTO.getAccount()) // 学号作为账号
                .tel(registerDTO.getTel())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(User.STUDENT) // 使用常量
                .collegeId(registerDTO.getCollegeId())
                .build();

        User savedUser = userRepository.save(user);

        // 创建学生信息关联
        StudentInfo studentInfo = StudentInfo.builder()
                .userId(savedUser.getId())
                .majorId(registerDTO.getMajorId())
                .build();

        studentInfoRepository.save(studentInfo);
    }
    //------------------------------------------------------------------------------
}