export const coursesUMP = [
    {
        id: 'ump',
        name: 'University of Mpumalanga (UMP)',
        faculties: [
            {
                icon: '🍽️',
                name: 'Hospitality and Event Management',
                programmes: [
                    {
                        code: 'DipHospMan',
                        name: 'Diploma in Hospitality Management',
                        aps: '24 (with Maths) or 25 (with Maths Lit)',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 3 },
                            { subject: 'Mathematical Literacy', minLevel: 4 },
                            { subject: 'One Additional Language', minLevel: null },
                            { subject: 'Any other Four Subjects', minLevel: null }
                        ],
                        notes: 'Diploma endorsement required.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'HCertEventMan',
                        name: 'Higher Certificate in Event Management',
                        aps: '19 (with Maths) or 21 (with Maths Lit/Tech Maths)',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy or Technical Mathematics', minLevel: 4 },
                            { subject: 'Any three Additional Vocational Subjects', minLevel: 2 }
                        ],
                        notes: 'Diploma/Higher Certificate endorsement. NCV level 4 in Business Studies, Hospitality Studies, or Tourism Discipline considered.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            },
            {
                icon: '🌍',
                name: 'Development and Social Sciences',
                programmes: [
                    {
                        code: 'BDevStudies',
                        name: 'Bachelor of Development Studies',
                        aps: '32',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 3 },
                            { subject: 'Geography/History and One Other Social or Commercial Subject', minLevel: null },
                            { subject: 'Sciences', minLevel: 4 }
                        ],
                        notes: '',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BSocWork',
                        name: 'Bachelor of Social Work',
                        aps: '32',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 3 }
                        ],
                        notes: '4-year programme.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BAdmin',
                        name: 'Bachelor of Administration',
                        aps: '32',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Second Language', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 3 }
                        ],
                        notes: 'Students wishing to take Economics as an elective must have Mathematics Level 4.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BA',
                        name: 'Bachelor of Arts (General)',
                        aps: '28',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 3 }
                        ],
                        notes: '',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            },
            {
                icon: '⚖️',
                name: 'Law',
                programmes: [
                    {
                        code: 'LLB',
                        name: 'Bachelor of Laws',
                        aps: '33',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Additional Language', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 3 },
                            { subject: 'Mathematical Literacy', minLevel: 4 }
                        ],
                        notes: '4-year programme. Bachelor endorsement required. Selection occurs monthly. At least 50% of places reserved for NSC applicants.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            },
            {
                icon: '💻',
                name: 'Information and Communication Technology',
                programmes: [
                    {
                        code: 'HCertICT',
                        name: 'Higher Certificate in ICT',
                        aps: '20 (with Maths) or 22 (with Maths Lit)',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 4 },
                            { subject: 'Any other Three Content Subjects', minLevel: 2 }
                        ],
                        notes: 'Diploma/Higher Certificate endorsement. NCV level 4 in IT or Computer Science/Studies considered.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'DipICT',
                        name: 'Diploma in ICT',
                        aps: '24',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'One Additional Language', minLevel: null },
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Any other Four Modules', minLevel: null }
                        ],
                        notes: 'Diploma endorsement required.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BICT',
                        name: 'Bachelor of ICT',
                        aps: '32',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 4 }
                        ],
                        notes: 'Bachelor endorsement. NCV level 4 with 60% English, 60% Maths, 70% in four vocational IT subjects considered. Students with relevant Higher Certificate or Diploma may articulate.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            },
            {
                icon: '🌱',
                name: 'Agriculture and Nature Conservation',
                programmes: [
                    {
                        code: 'DipAgriPlantProd',
                        name: 'Diploma in Agriculture in Plant Production',
                        aps: '23 (with Maths) or 24 (with Maths Lit)',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 3 },
                            { subject: 'Mathematical Literacy', minLevel: 4 },
                            { subject: 'Agriculture, Geography or Life Science', minLevel: 4 }
                        ],
                        notes: 'NCV level 4 in Primary Agriculture with 50% English, 40% Maths or 70% Maths Lit considered.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'DipNatureCons',
                        name: 'Diploma in Nature Conservation',
                        aps: '30',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 2 },
                            { subject: 'Mathematical Literacy', minLevel: 3 },
                            { subject: 'Life Sciences and Geography (recommended)', minLevel: 4 }
                        ],
                        notes: 'NCV level 4 in Primary Agriculture with 50% English, 30% Maths or 40% Maths Lit considered. Monthly selection.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BScAgri',
                        name: 'Bachelor of Science in Agriculture',
                        aps: '30',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Mathematical Literacy', minLevel: 6 },
                            { subject: 'Life Sciences, Biology or Agriculture', minLevel: 4 },
                            { subject: 'Physical Sciences', minLevel: 4 },
                            { subject: 'Any other Relevant Subjects', minLevel: 4 }
                        ],
                        notes: '4-year programme.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BScForestry',
                        name: 'Bachelor of Science in Forestry',
                        aps: '30',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Physical Science', minLevel: 4 },
                            { subject: 'Two of Life Science, Agricultural Science or Geography', minLevel: 4 }
                        ],
                        notes: '4-year programme. NSC/IEB with Bachelor pass.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'DipAnimalProd',
                        name: 'Diploma in Animal Production',
                        aps: '24 (with Maths) or 27 (with Maths Lit)',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 3 },
                            { subject: 'Mathematical Literacy', minLevel: 6 },
                            { subject: 'Physical Science', minLevel: 3 },
                            { subject: 'Life Sciences or Agriculture', minLevel: 4 }
                        ],
                        notes: 'NCV level 4 in Primary Agriculture with 50% English, 40% Maths or 70% Maths Lit considered.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BScEnvSci',
                        name: 'Bachelor of Science Environmental Science',
                        aps: '30',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Mathematical Literacy', minLevel: 6 },
                            { subject: 'Two of Life Science, Physical Science or Geography', minLevel: 4 }
                        ],
                        notes: 'International students with equivalent scores considered. Students with relevant 360-credit Diploma may be considered. Monthly selection.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    },
                    {
                        code: 'BSc',
                        name: 'Bachelor of Science',
                        aps: '30',
                        requirements: [
                            { subject: 'English Home or First Additional', minLevel: 4 },
                            { subject: 'Mathematics', minLevel: 4 },
                            { subject: 'Mathematical Literacy', minLevel: 6 },
                            { subject: 'Life Science, Physical Science or Geography', minLevel: 4 }
                        ],
                        notes: 'International students with equivalent scores considered. Students with relevant 360-credit Diploma may be considered. Monthly selection.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            },
            {
                icon: '📚',
                name: 'Education',
                programmes: [
                    {
                        code: 'BEdFoundPhase',
                        name: 'Bachelor of Education in Foundation Phase Teaching',
                        aps: '26 (with Maths) or 27 (with Maths Lit)',
                        requirements: [],
                        notes: '4-year programme. Preliminary admission based on final Grade 11 results; final on Grade 12. APS calculated using seven subjects; Life Orientation rating divided by two.',
                        campus: 'UMP Main Campus',
                        closingDate: '2026-09-30'
                    }
                ]
            }
        ]
    }
];