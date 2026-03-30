export const coursesSMU = [
    {
        id: 'smu',
        name: 'Sefako Makgatho Health Sciences University (SMU)',
        faculties: [
            {
                icon: '🏥',
                name: 'School of Medicine',
                programmes: [
                    {
                        code: 'MBChB',
                        name: 'Bachelor of Medicine and Bachelor of Surgery',
                        aps: '38',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 6 },
                            { subject: 'Physical Sciences', minLevel: 6 },
                            { subject: 'Life Sciences', minLevel: 6 },
                            { subject: 'English', minLevel: 5 },
                            { subject: 'Additional Subject 1', minLevel: 5 },
                            { subject: 'Additional Subject 2', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 5 }
                        ],
                        notes: '6-year programme. Entry is highly competitive. Admission may be at a much higher level than minimum requirements.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'MBChB_ECP',
                        name: 'Bachelor of Medicine and Bachelor of Surgery Extended Programme',
                        aps: '32',
                        requirements: [
                            { subject: 'Physical Science', minLevel: 5 },
                            { subject: 'Life Sciences', minLevel: 5 },
                            { subject: 'Mathematics', minLevel: 5 },
                            { subject: 'English Language', minLevel: 5 },
                            { subject: 'Life Orientation', minLevel: 4 },
                            { subject: 'Additional Subject 1', minLevel: 4 },
                            { subject: 'Additional Subject 2', minLevel: 4 }
                        ],
                        notes: 'Reserved for South African Black learners from Quintile 1 and 2 schools, first-time tertiary entrants. Only 50 spaces. After one-year foundation programme, students enter mainstream MBChB.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'DipEMC',
                        name: 'Diploma in Emergency Medical Care',
                        aps: '18',
                        requirements: [
                            { subject: 'English', minLevel: 3 },
                            { subject: 'Mathematics', minLevel: 3 },
                            { subject: 'Life Sciences', minLevel: 3 },
                            { subject: 'Physical Sciences', minLevel: 3 },
                            { subject: 'Additional 1', minLevel: 3 },
                            { subject: 'Additional 2', minLevel: 3 }
                        ],
                        notes: '2-year programme. Must pass Medical Fitness and Physical Fitness Evaluations. Registration with HPCSA as Paramedic.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'HCertEMC',
                        name: 'Higher Certificate in Emergency Medical Care',
                        aps: '15',
                        requirements: [
                            { subject: 'English', minLevel: 3 },
                            { subject: 'Mathematics or Mathematical Literacy', minLevel: '3 or 4' },
                            { subject: 'Life Sciences and/or Physical Sciences', minLevel: 3 },
                            { subject: 'Additional 1', minLevel: 3 },
                            { subject: 'Additional 2', minLevel: 3 }
                        ],
                        notes: '1-year programme. Must pass Medical Fitness and Physical Fitness Evaluations. Registration with HPCSA as Emergency Care Assistant.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BRad',
                        name: 'Bachelor of Diagnostic Radiography',
                        aps: null,
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 3 },
                            { subject: 'Others', minLevel: 6 }
                        ],
                        notes: '4-year programme. Minimum APS of 16 in core subjects (4 each). Clinical training at accredited hospitals.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    }
                ]
            },
            {
                icon: '🦷',
                name: 'School of Dentistry',
                programmes: [
                    {
                        code: 'BDS',
                        name: 'Bachelor of Dental Surgery',
                        aps: '37',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 6 },
                            { subject: 'Physical Sciences', minLevel: 6 },
                            { subject: 'Life Sciences', minLevel: 6 },
                            { subject: 'English', minLevel: 5 },
                            { subject: 'Additional Subject 1', minLevel: 5 },
                            { subject: 'Additional Subject 2', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 5 }
                        ],
                        notes: '5-year programme.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BDT',
                        name: 'Bachelor of Dental Therapy',
                        aps: '28',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Additional 2 Subjects', minLevel: '4 each' },
                            { subject: 'Life Orientation', minLevel: 4 }
                        ],
                        notes: '',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BOH',
                        name: 'Bachelor of Oral Hygiene',
                        aps: '28 (with Maths) / 31 (with Maths Lit)',
                        requirements: [
                            { subject: 'Mathematics or Mathematical Literacy', minLevel: '4 or 7' },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Additional 2 Subjects', minLevel: '4 each' },
                            { subject: 'Life Orientation', minLevel: 4 }
                        ],
                        notes: '3-year programme.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    }
                ]
            },
            {
                icon: '💊',
                name: 'School of Pharmacy',
                programmes: [
                    {
                        code: 'BPharm',
                        name: 'Bachelor of Pharmacy',
                        aps: '32',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 5 },
                            { subject: 'Physical Sciences', minLevel: 5 },
                            { subject: 'Life Sciences', minLevel: 5 },
                            { subject: 'English', minLevel: 5 },
                            { subject: 'Additional Subject 1 (preferably Accounting)', minLevel: 4 },
                            { subject: 'Additional Subject 2 (preferably Economics)', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 4 }
                        ],
                        notes: '4-year programme. Limited places. Selection based on academic outcomes. Must register with SAPC by 31 March.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'HCertVacc',
                        name: 'Online Higher Certificate in Vaccinology',
                        aps: null,
                        requirements: [],
                        notes: 'For Registered General Nurse and Midwife with SANC, or 3-year health sciences qualification. Priority to in-service HCWs in vaccination field. 1-year programme.',
                        campus: 'Online',
                        closingDate: '2024-07-31'
                    }
                ]
            },
            {
                icon: '👩‍⚕️',
                name: 'School of Health Care Sciences',
                programmes: [
                    {
                        code: 'BNAM',
                        name: 'Bachelor of Nursing and Midwifery',
                        aps: '28',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 5 },
                            { subject: 'English', minLevel: 5 },
                            { subject: 'Additional Subject 1', minLevel: 4 },
                            { subject: 'Additional Subject 2', minLevel: 3 },
                            { subject: 'Life Orientation', minLevel: 3 }
                        ],
                        notes: '4-year programme.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BOCCTHER',
                        name: 'Bachelor of Occupational Therapy',
                        aps: '25',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Additional Subject 1', minLevel: 3 },
                            { subject: 'Additional Subject 2', minLevel: 3 },
                            { subject: 'Life Orientation', minLevel: 3 }
                        ],
                        notes: '4-year programme. Registration with HPCSA required after completion.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BScPhysio',
                        name: 'Bachelor of Science in Physiotherapy',
                        aps: '28',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Additional Subject 1', minLevel: 4 },
                            { subject: 'Additional Subject 2', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 4 }
                        ],
                        notes: '4-year programme.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BAUD01',
                        name: 'Bachelor of Audiology',
                        aps: '25',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'Any Home Language or First Additional', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 3 },
                            { subject: 'Additional 2 Subjects', minLevel: '3 each' }
                        ],
                        notes: 'Limited number admitted. Observation at hospitals/clinics required before selection.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BSLP',
                        name: 'Bachelor of Speech-Language Pathology',
                        aps: '25',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'Any Home Language or First Additional', minLevel: 4 },
                            { subject: 'Life Orientation', minLevel: 3 },
                            { subject: 'Additional 2 Subjects', minLevel: '3 each' }
                        ],
                        notes: 'Limited number admitted. Observation at hospitals/clinics required before selection.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BScDietetics',
                        name: 'Bachelor of Science in Dietetics',
                        aps: '25',
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Additional Subject 1', minLevel: 3 },
                            { subject: 'Additional Subject 2', minLevel: 3 },
                            { subject: 'Life Orientation', minLevel: 3 }
                        ],
                        notes: '4-year programme including 34 weeks internship. Community service required after completion.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    }
                ]
            },
            {
                icon: '🔬',
                name: 'School of Science and Technology',
                programmes: [
                    {
                        code: 'BSc',
                        name: 'Bachelor of Science',
                        aps: null,
                        requirements: [
                            { subject: 'Mathematics', minLevel: 5 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Any two other NSC subjects', minLevel: '4 each' }
                        ],
                        notes: 'Majors available in Chemistry, Biochemistry, Mathematics, Applied Mathematics, Statistics, Operations Research, Computer Science, Physiology, Psychology, Physics, Biology.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    },
                    {
                        code: 'BScECP',
                        name: 'Bachelor of Science - Extended Curriculum Programme',
                        aps: null,
                        requirements: [
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Life Sciences', minLevel: 4 },
                            { subject: 'English', minLevel: 4 },
                            { subject: 'Any two other NSC subjects', minLevel: '4 each' }
                        ],
                        notes: '4-year programme.',
                        campus: 'Main Campus',
                        closingDate: '2024-07-31'
                    }
                ]
            }
        ]
    }
];