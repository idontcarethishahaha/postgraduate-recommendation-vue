package org.example.pgee.repository;

import org.example.pgee.dox.ApplicationEvidence;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author wuwenjin
 */
@Repository
public interface ApplicationEvidenceRepository extends CrudRepository<ApplicationEvidence, Long> {

    // 根据申报ID查找所有证明材料
    List<ApplicationEvidence> findByApplicationId(Long applicationId);

    // 根据申报ID删除证明材料
    void deleteByApplicationId(Long applicationId);
}
