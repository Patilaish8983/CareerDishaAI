# 1. Define RIASEC Trait Vectors for all 5 Target Career Domains
DOMAIN_TRAIT_MATRIX = {
    "Tech & Software":         {"R": 0.3, "I": 0.9, "A": 0.2, "S": 0.1, "E": 0.3, "C": 0.4},
    "Medical & Life Sciences": {"R": 0.2, "I": 0.8, "A": 0.1, "S": 0.9, "E": 0.2, "C": 0.3},
    "Finance & Management":    {"R": 0.1, "I": 0.5, "A": 0.2, "S": 0.3, "E": 0.9, "C": 0.7},
    "Creative Arts & Design":  {"R": 0.2, "I": 0.3, "A": 1.0, "S": 0.4, "E": 0.5, "C": 0.1},
    "Law & Civil Services":    {"R": 0.1, "I": 0.7, "A": 0.2, "S": 0.5, "E": 0.7, "C": 0.9}
}

# 2. Fallback Map (Used only if Firestore has no careers in a domain)
FALLBACK_CAREER_MAP = {
    "Tech & Software": "Software & AI Engineer / Data Specialist",
    "Medical & Life Sciences": "Medical Professional / Biotechnologist",
    "Finance & Management": "Business Strategist / Product Manager",
    "Creative Arts & Design": "UI/UX Product Designer / Brand Director",
    "Law & Civil Services": "Corporate Lawyer / Civil Servant (IAS/IPS)"
}

def evaluate_psychometric_profile(answers_traits, marks_10th, marks_12th, available_careers=None):
    """
    Multi-Criteria Decision Engine:
    - Calculates user RIASEC trait vector from selected options.
    - Evaluates dot-product match against target domain profiles.
    - Applies 10th/12th grade academic pathway multipliers.
    - Dynamically selects recommended career from Firestore careers.
    """
    
    # Step A: Aggregate User Trait Scores across all questions
    user_traits = {"R": 0.0, "I": 0.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0}
    
    if answers_traits:
        for trait_dict in answers_traits:
            for trait, value in trait_dict.items():
                if trait in user_traits:
                    user_traits[trait] += float(value)
    else:
        user_traits["I"] = 3.0

    # Step B: Compute Compatibility Score for each domain using vector dot products
    domain_scores = {}
    for domain, profile in DOMAIN_TRAIT_MATRIX.items():
        raw_score = sum(user_traits[t] * profile[t] for t in user_traits)
        domain_scores[domain] = raw_score

    # Step C: Academic Grade Branching Logic
    academic_pathway = "Standard High School / Degree Track"
    if marks_10th >= 80 and domain_scores.get("Tech & Software", 0) > 1.0:
        domain_scores["Tech & Software"] *= 1.15  
        academic_pathway = "Recommended: 3-Year Polytechnic Diploma in CS/IT/ENTC (Direct 2nd Year B.Tech Entry)"
        
    if marks_12th >= 80:
        academic_pathway = "Recommended: Top Autonomous University Degree for Campus Placement Drives"

    # Step D: Dynamic Realistic Normalization
    max_domain = max(domain_scores, key=domain_scores.get)
    highest_raw_score = domain_scores[max_domain]
    
    ratio = min(1.0, max(0.3, highest_raw_score / 4.5))
    compatibility = int(74 + (ratio * 21))

    # Step E: Match with Dynamic Careers from Firestore
    recommended_career = None
    if available_careers:
        # Match case-insensitively with domain or tag field in Firestore
        matches = [
            c.get('title') for c in available_careers 
            if c.get('title') and (c.get('domain') or c.get('tag', '')).strip().lower() == max_domain.strip().lower()
        ]
        if matches:
            recommended_career = matches[0]

    # Fallback to default if no matching career was found in Firestore
    if not recommended_career:
        recommended_career = FALLBACK_CAREER_MAP.get(max_domain, "Domain Specialist")

    return {
        "top_domain": max_domain,
        "career_title": recommended_career,
        "compatibility": compatibility,
        "academic_recommendation": academic_pathway,
        "trait_vector": user_traits
    }