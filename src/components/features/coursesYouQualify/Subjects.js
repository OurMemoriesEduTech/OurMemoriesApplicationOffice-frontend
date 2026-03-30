export const availableSubjects = [
    'afrikaans_home_language',
    'afrikaans_first_additional_language',
    'english_home_language',
    'english_first_additional_language',
    'isindebele_home_language',
    'isindebele_first_additional_language',
    'isixhosa_home_language',
    'isixhosa_first_additional_language',
    'isizulu_home_language',
    'isizulu_first_additional_language',
    'sepedi_home_language',
    'sepedi_first_additional_language',
    'sesotho_home_language',
    'sesotho_first_additional_language',
    'setswana_home_language',
    'setswana_first_additional_language',
    'siswati_home_language',
    'siswati_first_additional_language',
    'tshivenda_home_language',
    'tshivenda_first_additional_language',
    'xitsonga_home_language',
    'xitsonga_first_additional_language',
    'agricultural_sciences',
    'accounting',
    'business_studies',
    'economics',
    'geography',
    'history',
    'religion_studies',
    'computer_applications_technology',
    'information_technology',
    'life_sciences',
    'mathematical_literacy',
    'mathematics',
    'physical_sciences',
    'life_orientation',    // Added for UJ ID: 101
    'visual_arts',        // Added for UJ ID: 103
    'technical_mathematics' // Added for UJ ID: 47–57
];

export const subjectNames = {
    afrikaans_home_language: 'Afrikaans Home Language',
    afrikaans_first_additional_language: 'Afrikaans First Additional Language',
    english_home_language: 'English Home Language',
    english_first_additional_language: 'English First Additional Language',
    isindebele_home_language: 'IsiNdebele Home Language',
    isindebele_first_additional_language: 'IsiNdebele First Additional Language',
    isixhosa_home_language: 'IsiXhosa Home Language',
    isixhosa_first_additional_language: 'IsiXhosa First Additional Language',
    isizulu_home_language: 'IsiZulu Home Language',
    isizulu_first_additional_language: 'IsiZulu First Additional Language',
    sepedi_home_language: 'Sepedi Home Language',
    sepedi_first_additional_language: 'Sepedi First Additional Language',
    sesotho_home_language: 'Sesotho Home Language',
    sesotho_first_additional_language: 'Sesotho First Additional Language',
    setswana_home_language: 'Setswana Home Language',
    setswana_first_additional_language: 'Setswana First Additional Language',
    siswati_home_language: 'SiSwati Home Language',
    siswati_first_additional_language: 'SiSwati First Additional Language',
    tshivenda_home_language: 'Tshivenda Home Language',
    tshivenda_first_additional_language: 'Tshivenda First Additional Language',
    xitsonga_home_language: 'Xitsonga Home Language',
    xitsonga_first_additional_language: 'Xitsonga First Additional Language',
    agricultural_sciences: 'Agricultural Sciences',
    accounting: 'Accounting',
    business_studies: 'Business Studies',
    economics: 'Economics',
    geography: 'Geography',
    history: 'History',
    religion_studies: 'Religion Studies',
    computer_applications_technology: 'Computer Applications Technology',
    information_technology: 'Information Technology',
    life_sciences: 'Life Sciences',
    mathematical_literacy: 'Mathematical Literacy',
    mathematics: 'Mathematics',
    physical_sciences: 'Physical Sciences',
    life_orientation: 'Life Orientation',
    visual_arts: 'Visual Arts',
    technical_mathematics: 'Technical Mathematics'
};

// Subjects.js

// Grouped by category for better UI organization
export const subjectCategories = [
    {
        category: "Languages",
        subjects: [
            "English Home Language",
            "English First Additional",
            "Afrikaans Home Language",
            "Afrikaans First Additional",
            "IsiZulu Home Language",
            "IsiZulu First Additional",
            "IsiXhosa Home Language",
            "IsiXhosa First Additional",
            "Sepedi Home Language",
            "Sepedi First Additional",
            "Sesotho Home Language",
            "Sesotho First Additional",
            "Setswana Home Language",
            "Setswana First Additional",
            "SiSwati Home Language",
            "SiSwati First Additional",
            "Tshivenda Home Language",
            "Tshivenda First Additional",
            "Xitsonga Home Language",
            "Xitsonga First Additional"
        ]
    },
    {
        category: "Mathematics",
        subjects: [
            "Mathematics",
            "Mathematical Literacy",
            "Technical Mathematics"
        ]
    },
    {
        category: "Sciences",
        subjects: [
            "Physical Sciences",
            "Technical Sciences",
            "Life Sciences",
            "Agricultural Sciences",
            "Agricultural Technology",
            "Agricultural Management Practices"
        ]
    },
    {
        category: "Commerce",
        subjects: [
            "Accounting",
            "Business Studies",
            "Economics",
            "Consumer Studies",
            "Hospitality Studies",
            "Tourism"
        ]
    },
    {
        category: "Humanities and Social Sciences",
        subjects: [
            "History",
            "Geography",
            "Religion Studies",
            "Life Orientation"
        ]
    },
    {
        category: "Technology and Engineering",
        subjects: [
            "Information Technology (IT)",
            "Computer Applications Technology (CAT)",
            "Engineering Graphics & Design (EGD)",
            "Civil Technology",
            "Electrical Technology",
            "Mechanical Technology",
            "Maritime Economics"
        ]
    },
    {
        category: "Arts and Culture",
        subjects: [
            "Music",
            "Visual Arts",
            "Dance Studies",
            "Dramatic Arts",
            "Design"
        ]
    }
];

// Flattened list of all subjects (useful for other parts of the app if needed)
export const allSubjects = subjectCategories.flatMap(cat => cat.subjects);
