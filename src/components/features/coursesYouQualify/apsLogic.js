// apsLogic.js
import { coursesUJ } from "./universityProspectus/UniversityOfJohannesburg.js";
import { coursesTUT } from "./universityProspectus/TshwaneUniversityOfTechnology.js";
import { coursesWITS } from "./universityProspectus/WitsUniversity.js";
import { coursesUP } from "./universityProspectus/UniversityOfPretoria.js";

[coursesUJ, coursesTUT, coursesWITS, coursesUP].forEach((courses, index) => {
    courses.forEach(course => {
        if (!course.requirements || !Array.isArray(course.requirements.requiredSubjects)) return;
        const mathReqs = course.requirements.requiredSubjects.filter(req =>
            req && typeof req.subject === 'string' &&
            ['mathematics', 'mathematical literacy', 'technical mathematics'].includes(req.subject.toLowerCase())
        );
        const nonMathReqs = course.requirements.requiredSubjects.filter(req =>
            req && typeof req.subject === 'string' &&
            !['mathematics', 'mathematical literacy', 'technical mathematics'].includes(req.subject.toLowerCase())
        );
        if (mathReqs.length > 0) {
            console.log(`Course ${course.title} (ID: ${course.id}, University: ${course.university}) math requirements (one of):`, mathReqs);
        }
        if (nonMathReqs.length > 0) {
            console.log(`Course ${course.title} (ID: ${course.id}, University: ${course.university}) non-math requirements:`, nonMathReqs);
        }
    });
});

export const calculateLevel = (marks) => {
    if (isNaN(marks) || marks < 0 || marks > 100) {
        console.log(`Invalid marks: ${marks}, returning level 0`);
        return 0;
    }
    if (marks >= 80) return 7;
    if (marks >= 70) return 6;
    if (marks >= 60) return 5;
    if (marks >= 50) return 4;
    if (marks >= 40) return 3;
    if (marks >= 30) return 2;
    return 1;
};

export const calculateAPS = (subjects) => {
    console.log('Calculating APS for subjects:', subjects);
    const validSubjects = subjects.filter(({ subject }) =>
        subject && typeof subject === 'string'
    );
    const aps = validSubjects.reduce((total, { subject, marks }) => {
        if (!subject || marks === '' || isNaN(marks) || marks < 0 || marks > 100) {
            console.log(`Skipping subject ${subject}: Invalid marks (${marks})`);
            return total;
        }
        const level = calculateLevel(parseInt(marks));
        console.log(`Subject ${subject}: Marks ${marks} -> Level ${level}`);
        return total + level;
    }, 0);
    console.log('Calculated APS:', aps);
    return aps;
};

export const getQualifyingCourses = (courses, { subjects, aps }) => {
    console.log('getQualifyingCourses inputs:', {
        courses: courses.map(c => ({ id: c.id, title: c.title, university: c.university })),
        subjects,
        aps
    });

    const qualified = courses.filter(course => {
        console.log(`\nEvaluating course: ${course.title} (ID: ${course.id}, University: ${course.university})`);

        // Check APS
        if (!course.requirements || aps < course.requirements.minAPS) {
            console.log(`Filtered out: APS ${aps} < ${course.requirements.minAPS}`);
            return false;
        }
        console.log(`APS check passed: ${aps} >= ${course.requirements.minAPS}`);

        // Check if course has required subjects
        if (!course.requirements.requiredSubjects || course.requirements.requiredSubjects.length === 0) {
            console.log(`Qualified: No specific subject requirements`);
            return true;
        }

        // Normalize user subjects and course requirements
        const normalizedUserSubjects = subjects.map(s => ({
            subject: s.subject?.toLowerCase().replace('mathematical literacy', 'mathematical_literacy').replace('technical mathematics', 'technical_mathematics') || '',
            marks: s.marks
        }));
        console.log('Normalized user subjects:', normalizedUserSubjects);

        // Identify user's math subject (at most one)
        const userMathSubject = normalizedUserSubjects.find(s =>
            ['mathematics', 'mathematical_literacy', 'technical_mathematics'].includes(s.subject)
        );
        console.log('User math subject:', userMathSubject || 'None');

        // Normalize course requirements
        const normalizedCourseRequirements = course.requirements.requiredSubjects.map(req => ({
            subject: req.subject?.toLowerCase().replace('mathematical literacy', 'mathematical_literacy').replace('technical mathematics', 'technical_mathematics') || '',
            minLevel: req.minLevel
        }));

        // Split course requirements into math and non-math
        const mathRequirements = normalizedCourseRequirements.filter(req =>
            ['mathematics', 'mathematical_literacy', 'technical_mathematics'].includes(req.subject)
        );
        const nonMathRequirements = normalizedCourseRequirements.filter(req =>
            !['mathematics', 'mathematical_literacy', 'technical_mathematics'].includes(req.subject)
        );
        console.log('Math requirements (one of):', mathRequirements);
        console.log('Non-math requirements:', nonMathRequirements);

        // Check mathematics requirements (user needs to meet at least one, if any exist)
        let mathQualifies = true;
        if (mathRequirements.length > 0) {
            if (!userMathSubject) {
                console.log(`Filtered out: No mathematics subject provided by user`);
                mathQualifies = false;
            } else {
                mathQualifies = mathRequirements.some(req => {
                    if (req.subject === userMathSubject.subject) {
                        const userMathLevel = calculateLevel(parseInt(userMathSubject.marks));
                        const meetsLevel = userMathLevel >= req.minLevel;
                        console.log(`Checking math subject ${req.subject}: User level ${userMathLevel} >= Required ${req.minLevel} ? ${meetsLevel}`);
                        return meetsLevel;
                    }
                    console.log(`Math subject ${req.subject} does not match user's ${userMathSubject.subject}`);
                    return false;
                });
                if (!mathQualifies) {
                    console.log(`Filtered out: User's math subject (${userMathSubject.subject}) does not meet any math requirements`);
                }
            }
        } else {
            console.log('No math requirements for this course');
        }

        // Check non-mathematics requirements
        let nonMathQualifies = true;
        if (nonMathRequirements.length > 0) {
            nonMathQualifies = nonMathRequirements.every((req, index) => {
                if (!req.subject) {
                    console.warn(`Invalid requiredSubjects entry at index ${index}:`, req);
                    return false;
                }
                let matchingSubjects = [];

                // Handle 'english' specifically
                if (req.subject === 'english') {
                    matchingSubjects = normalizedUserSubjects.filter(s =>
                        s.subject.includes('english_home_language') ||
                        s.subject.includes('english_first_additional_language')
                    );
                }
                // Handle 'additional_language'
                else if (req.subject === 'additional_language') {
                    matchingSubjects = normalizedUserSubjects.filter(s =>
                        s.subject.includes('home_language') ||
                        s.subject.includes('first_additional_language')
                    );
                }
                // Handle other subjects
                else {
                    matchingSubjects = normalizedUserSubjects.filter(s =>
                        s.subject.includes(req.subject)
                    );
                }

                if (matchingSubjects.length === 0) {
                    console.log(`Filtered out: No matching subjects for ${req.subject}`);
                    if (['beng', 'life_orientation', 'visual_arts'].includes(req.subject)) {
                        console.warn(`Warning: Subject ${req.subject} not in availableSubjects`);
                    }
                    return false;
                }

                console.log(`Subject ${req.subject}: Found matching subjects:`,
                    matchingSubjects.map(s => ({ subject: s.subject, marks: s.marks })));

                const highestLevel = Math.max(...matchingSubjects.map(s =>
                    calculateLevel(parseInt(s.marks))
                ));
                const meetsLevel = highestLevel >= req.minLevel;
                console.log(`Subject ${req.subject}: Highest user level ${highestLevel} >= Required ${req.minLevel} ? ${meetsLevel}`);
                return meetsLevel;
            });
        } else {
            console.log('No non-math requirements for this course');
        }

        const qualifies = mathQualifies && nonMathQualifies;
        console.log(`Course ${course.title} qualified: ${qualifies} (Math: ${mathQualifies}, Non-Math: ${nonMathQualifies})`);
        return qualifies;
    });

    console.log('Qualified courses:', qualified.map(c => ({ id: c.id, title: c.title, university: c.university })));
    return qualified;
};