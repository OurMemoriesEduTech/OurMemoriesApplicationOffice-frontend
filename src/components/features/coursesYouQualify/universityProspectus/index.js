// src/coursesYouQualify/universityProspectus/index.js
import { coursesTUT } from '../prospectus/tut.js';
import { coursesUJ } from './UniversityOfJohannesburg.js';
import { coursesUP } from './UniversityOfPretoria.js';
import { coursesWITS } from './WitsUniversity.js';

// Helper to convert a flat course list to a single faculty
const toSingleFaculty = (courses, icon = '📚') => ({
    icon,
    name: 'All Programmes',
    programmes: courses.map(c => ({ code: c.code || c.id, name: c.title }))
});

export const prospectusData = {
    'Tshwane University of Technology (TUT)': {
        id: 'tut',
        name: 'Tshwane University of Technology',
        faculties: coursesTUT.faculties // assuming coursesTUT already has the faculty structure
    },
    'University of Johannesburg (UJ)': {
        id: 'uj',
        name: 'University of Johannesburg',
        faculties: [toSingleFaculty(coursesUJ, '🏫')]
    },
    'University of Pretoria (UP)': {
        id: 'up',
        name: 'University of Pretoria',
        faculties: [toSingleFaculty(coursesUP, '🏫')]
    },
    'University of Witwatersrand (WITS)': {
        id: 'wits',
        name: 'University of the Witwatersrand',
        faculties: [toSingleFaculty(coursesWITS, '🎓')]
    }
    // Add other universities similarly
};