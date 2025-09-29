package org.example.pgee.repository;

import org.example.pgee.dox.College;
import org.example.pgee.dox.CounselorInfo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author wuwenjin
 */
@Repository
public interface CounselorInfoRepository extends CrudRepository<CounselorInfo, Long> {
    Optional<CounselorInfo> findByUserId(Long userId);
}
