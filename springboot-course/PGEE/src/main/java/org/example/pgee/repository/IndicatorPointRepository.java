package org.example.pgee.repository;

import org.example.pgee.dox.IndicatorPoint;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IndicatorPointRepository extends CrudRepository<IndicatorPoint, Long> {
    List<IndicatorPoint> findByMajorCategoryId(Long majorCategoryId);
    List<IndicatorPoint> findByParentId(Long parentId);
    boolean existsByParentIdAndName(Long parentId, String name);
    boolean existsByParentId(Long parentId);

    // 添加：根据父节点和名称查询（排除自身）
    @Query("SELECT * FROM indicator_points WHERE parent_id = :parentId AND name = :name AND id != :excludeId")
    boolean existsByParentIdAndNameAndIdNot(@Param("parentId") Long parentId,
                                            @Param("name") String name,
                                            @Param("excludeId") Long excludeId);

    @Modifying
    @Query("UPDATE indicator_points SET is_leaf = :isLeaf WHERE id = :id")
    void updateLeafStatus(@Param("id") Long id, @Param("isLeaf") boolean isLeaf);



    // 查找学生专业类别下的一级指标点
    @Query("SELECT ip.* FROM indicator_points ip " +
            "JOIN student_info si ON si.user_id = :userId " +
            "JOIN major m ON m.id = si.major_id " +
            "WHERE ip.major_category_id = m.major_category_id " +
            "AND ip.level = 1 AND ip.parent_id IS NULL " +
            "ORDER BY ip.sort_order")
    List<IndicatorPoint> findFirstLevelByUserId(@Param("userId") Long userId);

    // 根据专业类别ID查找一级指标点
    @Query("SELECT * FROM indicator_points " +
            "WHERE major_category_id = :majorCategoryId " +
            "AND level = 1 AND parent_id IS NULL " +
            "ORDER BY sort_order")
    List<IndicatorPoint> findFirstLevelByMajorCategoryId(@Param("majorCategoryId") Long majorCategoryId);

    // 查找一级指标点下的所有叶子节点
    @Query("SELECT * FROM indicator_points WHERE parent_id = :parentId AND is_leaf = true ORDER BY sort_order")
    List<IndicatorPoint> findLeafNodesByParentId(@Param("parentId") Long parentId);

    // 根据ID列表查找指标点
    @Query("SELECT * FROM indicator_points WHERE id IN (:ids)")
    List<IndicatorPoint> findByIdIn(@Param("ids") List<Long> ids);
}