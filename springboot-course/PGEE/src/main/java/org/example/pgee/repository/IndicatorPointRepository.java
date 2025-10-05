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

    @Modifying
    @Query("UPDATE indicator_points SET is_leaf = :isLeaf WHERE id = :id")
    void updateLeafStatus(@Param("id") Long id, @Param("isLeaf") boolean isLeaf);
}