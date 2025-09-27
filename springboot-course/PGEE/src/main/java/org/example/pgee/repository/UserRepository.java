package org.example.pgee.repository;

import org.example.pgee.dox.User;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author wuwenjin
 */
//持久层接口

@Repository
public interface UserRepository extends ListCrudRepository<User, Long> {
   // User findByAccount(String account);
   Optional<User> findByAccount(String account);
//   List<User> findByCollegeId(Long collegeId);
//   List<User> findByRole(String role);
//   boolean existsByAccount(String account);
}