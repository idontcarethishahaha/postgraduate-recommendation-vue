package org.example.pgee.repository;

import org.example.pgee.dox.Major;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * @author wuwenjin
 */
@Repository
public interface MajorRepository extends CrudRepository<Major, Long> {
    boolean existsByName(String name);
}
