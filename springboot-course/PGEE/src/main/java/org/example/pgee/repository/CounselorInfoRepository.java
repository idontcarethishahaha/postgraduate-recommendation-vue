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
    void deleteByUserId(Long userId);
}