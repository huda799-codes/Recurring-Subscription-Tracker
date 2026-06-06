package com.controller;

import com.services.GeminiService;
import com.services.GroqService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final GeminiService geminiService;
    private final GroqService groqService;

    public AIController(GeminiService geminiService,
                        GroqService groqService) {

        this.geminiService = geminiService;
        this.groqService = groqService;
    }

    @GetMapping("/gemini")
    public String getGeminiInsight() {
        return geminiService.generateInsight();
    }

    @GetMapping("/groq")
    public String getGroqInsight() {
        return groqService.generateInsight();
    }
}