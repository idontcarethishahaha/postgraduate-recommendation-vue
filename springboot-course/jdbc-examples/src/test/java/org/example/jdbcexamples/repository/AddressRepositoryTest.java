package org.example.jdbcexamples.repository;

import lombok.extern.slf4j.Slf4j;
import org.example.jdbcexamples.dox.Address;
import org.example.jdbcexamples.dto.AddressUserDTO;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Slf4j
class AddressRepositoryTest {
    @Autowired
    private AddressRepository addressRepository;

    @Test
    void findByUserId() {//返回的是一个集合
        for(Address address : addressRepository.findByUserId("1416320051491954688")){
            log.debug("address: {}",address);//{}是占位符
        }
    }

    @Test
    void findByAId() {
        AddressUserDTO addressDTO = addressRepository.findByAId("1");
        log.debug("user: {}", addressDTO.getUser());
        log.debug("address: {}", addressDTO.getAddress());
    }
}
