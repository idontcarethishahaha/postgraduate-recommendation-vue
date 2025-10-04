package org.example.pgee.repository;

import org.example.pgee.dox.College;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

/*
 * @author wuwenjin
 */
@Repository
public interface CollegeRepository extends ListCrudRepository<College, Long> {
    boolean existsByName(String name);
}