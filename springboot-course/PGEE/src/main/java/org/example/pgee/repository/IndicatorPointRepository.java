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
}