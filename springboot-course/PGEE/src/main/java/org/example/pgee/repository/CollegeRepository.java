package org.example.pgee.repository;

import org.example.pgee.dox.College;
import org.springframework.data.repository.CrudRepository;

/*
 * @author wuwenjin
 */

public interface CollegeRepository extends CrudRepository<College, Long> {
    boolean existsByName(String name);

}