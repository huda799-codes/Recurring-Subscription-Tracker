package com.controller;

import com.util.FileHandler;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/files")
public class FileController {

    private final FileHandler fileHandler;

    public FileController() {
        fileHandler = new FileHandler();
    }

    @PostMapping("/report")
    public String saveReport(@RequestBody String data) {

        fileHandler.writeToFile(data);

        return "Report saved successfully";
    }
}