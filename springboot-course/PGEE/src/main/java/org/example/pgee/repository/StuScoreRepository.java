package org.example.pgee.repository;

import org.example.pgee.dox.StuScore;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author wuwenjin
 */
@Repository
public interface StuScoreRepository extends CrudRepository<StuScore, Long> {

    // 根据用户ID查找成绩记录
    Optional<StuScore> findByUserId(Long userId);

    // 检查用户是否已有待审核的成绩
    @Query("SELECT COUNT(*) FROM stu_score WHERE user_id = :userId AND status = 0")
    boolean existsPendingByUserId(@Param("userId") Long userId);

    // 更新成绩状态
    @Query("UPDATE stu_score SET status = :status WHERE id = :id AND user_id = :userId")
    boolean updateStatus(@Param("id") Long id, @Param("userId") Long userId, @Param("status") Integer status);
}