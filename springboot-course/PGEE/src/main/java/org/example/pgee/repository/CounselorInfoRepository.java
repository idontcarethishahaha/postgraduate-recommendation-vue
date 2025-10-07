package org.example.pgee.repository;

import org.example.pgee.dox.CounselorInfo;
import org.springframework.data.jdbc.repository.query.Query;  // 保持 JDBC
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CounselorInfoRepository extends CrudRepository<CounselorInfo, Long> {
    Optional<CounselorInfo> findByUserId(Long userId);
    boolean existsByMajorCategoryId(Long majorCategoryId);
    // 新增的删除方法
    void deleteByUserId(Long userId);

    // 对于 Spring Data JDBC，使用简单查询 + 应用层处理
    @Query("SELECT * FROM counselor_info ci WHERE ci.user_id IN " +
            "(SELECT id FROM user WHERE college_id = :collegeId AND role = :role)")
    List<CounselorInfo> findCounselorsByCollegeAndRole(@Param("collegeId") Long collegeId,
                                                       @Param("role") String role);
}