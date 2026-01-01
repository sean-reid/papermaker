use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use rand::prelude::*;
use rand::rngs::SmallRng;

#[wasm_bindgen]
pub struct ScigenGenerator {
    rules: HashMap<String, Vec<String>>,
    dup_tracking: HashMap<String, Vec<String>>,
    counters: HashMap<String, usize>,
    rng: SmallRng,
}

#[wasm_bindgen]
impl ScigenGenerator {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64) -> Self {
        ScigenGenerator {
            rules: HashMap::new(),
            dup_tracking: HashMap::new(),
            counters: HashMap::new(),
            rng: SmallRng::seed_from_u64(seed),
        }
    }

    pub fn load_rules(&mut self, rules_text: &str) {
        self.parse_rules(rules_text);
    }

    pub fn add_rule(&mut self, name: &str, expansion: &str) {
        self.rules.entry(name.to_string())
            .or_insert_with(Vec::new)
            .push(expansion.to_string());
    }

    pub fn generate(&mut self, start_rule: &str) -> String {
        self.expand(start_rule)
    }

    fn parse_rules(&mut self, text: &str) {
        let lines: Vec<&str> = text.lines().collect();
        let mut i = 0;
        
        while i < lines.len() {
            let line = lines[i];
            
            // Skip comments and empty lines
            if line.starts_with('#') || line.trim().is_empty() {
                i += 1;
                continue;
            }
            
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.is_empty() {
                i += 1;
                continue;
            }
            
            let mut name = parts[0].to_string();
            let mut rule = String::new();
            
            // Handle non-duplicate rule marker (!)
            if name.ends_with('!') {
                name = name.trim_end_matches('!').to_string();
                self.dup_tracking.insert(format!("{}!!!", name), Vec::new());
                i += 1;
                continue;
            }
            
            // Handle multi-line rules with braces
            if parts.len() == 2 && parts[1] == "{" {
                i += 1;
                while i < lines.len() {
                    let rule_line = lines[i];
                    if rule_line.trim() == "}" {
                        break;
                    }
                    rule.push_str(rule_line);
                    rule.push('\n');
                    i += 1;
                }
            } else {
                // Single line rule - get everything after first whitespace
                if let Some(pos) = line.find(char::is_whitespace) {
                    rule = line[pos..].trim_start().to_string();
                }
            }
            
            // Handle weighted rules (name+weight)
            let mut weight = 1;
            if let Some(pos) = name.rfind('+') {
                if let Ok(w) = name[pos + 1..].parse::<usize>() {
                    name = name[..pos].to_string();
                    weight = w;
                }
            }
            
            // Add rule multiple times based on weight
            for _ in 0..weight {
                self.rules.entry(name.clone())
                    .or_insert_with(Vec::new)
                    .push(rule.clone());
            }
            
            i += 1;
        }
    }

    fn expand(&mut self, start: &str) -> String {
        // Handle special counter rules (ending in \+ or \#)
        // The backslash is in the rule NAME, but we check the actual pattern
        let pattern = start.replace("\\+", "+").replace("\\#", "#");
        
        if pattern.ends_with('+') {
            let rule = pattern.trim_end_matches('+');
            let counter = self.counters.entry(rule.to_string()).or_insert(0);
            let result = counter.to_string();
            *counter += 1;
            return result;
        }
        
        if pattern.ends_with('#') {
            let rule = pattern.trim_end_matches('#');
            let counter = *self.counters.get(rule).unwrap_or(&0);
            if counter == 0 {
                return "0".to_string();
            }
            return self.rng.gen_range(0..counter).to_string();
        }
        
        let mut full_token;
        let mut count = 0;
        let max_attempts = 50;
        
        loop {
            count += 1;
            
            // Pick a random expansion for this rule - clone to avoid borrow issues
            let input = if let Some(expansions) = self.rules.get(start) {
                if expansions.is_empty() {
                    return String::new();
                }
                let idx = self.rng.gen_range(0..expansions.len());
                expansions[idx].clone()
            } else {
                return String::new();
            };
            
            // Expand all sub-rules recursively using pop_first_rule logic
            full_token = self.expand_input(&input);
            
            // Check for duplicates if this rule has dup tracking
            let dup_key = format!("{}!!!", start);
            if let Some(dups) = self.dup_tracking.get(&dup_key) {
                let is_duplicate = dups.iter().any(|d| d == &full_token);
                
                if !is_duplicate {
                    // Add to dup tracking
                    if let Some(dups_vec) = self.dup_tracking.get_mut(&dup_key) {
                        dups_vec.push(full_token.clone());
                    }
                    break;
                } else if count > max_attempts {
                    // Give up after max attempts
                    break;
                }
            } else {
                break;
            }
        }
        
        full_token
    }

    fn expand_input(&mut self, input: &str) -> String {
        let mut components = Vec::new();
        let mut remaining = input.to_string();
        
        // Build sorted list of rule names (longest first)
        // Convert regex patterns: \+ → +, \# → #, etc.
        let mut rule_patterns: Vec<(String, String)> = self.rules.keys()
            .map(|name| {
                let pattern = name
                    .replace("\\+", "+")
                    .replace("\\#", "#")
                    .replace("\\{", "{")
                    .replace("\\}", "}")
                    .replace("\\(", "(")
                    .replace("\\)", ")");
                (name.clone(), pattern)
            })
            .collect();
        
        // Sort by pattern length (longest first) for greedy matching
        rule_patterns.sort_by(|a, b| b.1.len().cmp(&a.1.len()));
        
        // Pop first rule repeatedly until none remain
        while !remaining.is_empty() {
            let mut best_match: Option<(String, usize, usize)> = None;
            
            // Find the earliest matching rule pattern (NO boundary checking!)
            for (rule_name, pattern) in &rule_patterns {
                if let Some(pos) = remaining.find(pattern.as_str()) {
                    // Take earliest match (leftmost)
                    if best_match.is_none() || pos < best_match.as_ref().unwrap().1 {
                        let end_pos = pos + pattern.len();
                        best_match = Some((rule_name.clone(), pos, end_pos));
                    }
                }
            }
            
            if let Some((rule_name, start_pos, end_pos)) = best_match {
                // Add preamble
                if start_pos > 0 {
                    components.push(remaining[..start_pos].to_string());
                }
                
                // Expand the rule (use original name with backslash)
                let expanded = self.expand(&rule_name);
                components.push(expanded);
                
                // Continue with remainder
                remaining = remaining[end_pos..].to_string();
            } else {
                // No more rules - add what's left
                components.push(remaining);
                break;
            }
        }
        
        components.join("")
    }

    pub fn pretty_print(&self, text: &str) -> String {
        let mut result = String::new();
        
        for line in text.lines() {
            let mut processed = line.to_string();
            
            // Remove spaces before punctuation (Perl: s/(\s+)([\.\,\?\;\:])/$2/g)
            processed = processed.replace(" .", ".");
            processed = processed.replace(" ,", ",");
            processed = processed.replace(" ?", "?");
            processed = processed.replace(" ;", ";");
            processed = processed.replace(" :", ":");
            
            // Fix "a" vs "an" before vowels (Perl: s/(\b)(a)\s+([aeiou])/$1$2n $3/gi)
            let chars: Vec<char> = processed.chars().collect();
            let mut fixed = String::new();
            let mut i = 0;
            
            while i < chars.len() {
                if i + 2 < chars.len() && 
                   (chars[i] == 'a' || chars[i] == 'A') &&
                   chars[i + 1].is_whitespace() &&
                   "aeiouAEIOU".contains(chars[i + 2]) {
                    // Check if 'a' is at word boundary
                    let at_boundary = i == 0 || !chars[i - 1].is_alphanumeric();
                    if at_boundary {
                        fixed.push(chars[i]);
                        fixed.push('n');
                        fixed.push(chars[i + 1]);
                        i += 2;
                        continue;
                    }
                }
                fixed.push(chars[i]);
                i += 1;
            }
            
            result.push_str(&fixed);
            result.push('\n');
        }
        
        result
    }
}

#[wasm_bindgen]
pub fn generate_paper(seed: u64, author1: &str, author2: &str, sysname: &str, rules: &str) -> String {
    let mut gen = ScigenGenerator::new(seed);
    
    // Load rules
    gen.load_rules(rules);
    
    // Add author names
    gen.add_rule("AUTHOR_NAME", author1);
    gen.add_rule("AUTHOR_NAME", author2);
    
    // Add system name
    gen.add_rule("SYSNAME", sysname);
    
    // Generate authors string
    let authors_str = format!("{} and {}", author1, author2);
    gen.add_rule("SCIAUTHORS", &authors_str);
    
    // Generate the paper
    let paper = gen.generate("SCIPAPER_LATEX");
    
    // Pretty print
    gen.pretty_print(&paper)
}
