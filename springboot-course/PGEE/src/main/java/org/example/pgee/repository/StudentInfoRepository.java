package org.example.pgee.repository;

import org.example.pgee.dox.StudentInfo;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

/**
 * @author wuwenjin
 */
public interface StudentInfoRepository extends CrudRepository<StudentInfo, Long> {
    Optional<StudentInfo> findByUserId(Long userId);
}
