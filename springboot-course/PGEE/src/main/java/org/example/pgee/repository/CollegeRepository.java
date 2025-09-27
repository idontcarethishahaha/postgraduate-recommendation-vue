package org.example.pgee.repository;

import org.example.pgee.dox.College;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/*
 * @author wuwenjin
 */
@Repository
public interface CollegeRepository extends CrudRepository<College, Long> {
    boolean existsByName(String name);
    //CrudRepository接口内置findById方法，返回值为Optional<T>类型
}