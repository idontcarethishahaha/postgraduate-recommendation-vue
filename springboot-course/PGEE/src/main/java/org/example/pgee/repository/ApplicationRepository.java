package org.example.pgee.repository;

import org.example.pgee.dox.Application;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author wuwenjin
 */
@Repository
public interface ApplicationRepository extends CrudRepository<Application, Long> {

    // 根据用户ID查找所有申报记录
    List<Application> findByUserId(Long userId);

    // 根据用户ID和状态查找申报记录
    List<Application> findByUserIdAndStatus(Long userId, String status);

    // 根据指标点ID查找申报记录
    List<Application> findByIndicatorId(Long indicatorId);

    // 统计用户各状态申报数量
    @Query("SELECT status, COUNT(*) FROM application WHERE user_id = :userId GROUP BY status")
    List<Object[]> countApplicationsByStatus(@Param("userId") Long userId);

    // 检查是否已申报过该指标点
    @Query("SELECT COUNT(*) FROM application WHERE user_id = :userId AND indicator_id = :indicatorId AND status != 'rejected'")
    boolean existsByUserIdAndIndicatorId(@Param("userId") Long userId, @Param("indicatorId") Long indicatorId);
}
