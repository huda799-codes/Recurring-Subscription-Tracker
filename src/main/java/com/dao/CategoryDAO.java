package com.dao;

import com.model.Category;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public class CategoryDAO {

    public List<Category> getAllCategories() {
        return Arrays.asList(Category.values());
    }
}