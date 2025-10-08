package org.example.pgee.repository;

import org.example.pgee.dox.Application;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author wuwenjin
 */
@Repository
public interface ApplicationRepository extends CrudRepository<Application, Long> {


}
