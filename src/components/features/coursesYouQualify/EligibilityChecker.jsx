import React, { useState } from 'react';
import './EligibilityChecker.css';
import {subjectCategories} from "./Subjects.js";
import {universities} from "../applicationPortal/applicationForms/university-data/universities.js";

// Subject options for dropdown
//const subjectOptions = subjects;

// Helper: percentage to APS level
const getLevel = (percentage) => {
    if (percentage >= 80) return 7;
    if (percentage >= 70) return 6;
    if (percentage >= 60) return 5;
    if (percentage >= 50) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 30) return 2;
    if (percentage >= 0) return 1;
    return 0;
};

// Parse APS requirement string (e.g., "25", "42+", or null)
const meetsAPS = (apsRequirement, studentAPS) => {
    if (!apsRequirement) return true; // no APS requirement (e.g., postgraduate)
    const apsStr = String(apsRequirement);
    if (apsStr.endsWith('+')) {
        const min = parseInt(apsStr.slice(0, -1));
        return studentAPS >= min;
    } else {
        const min = parseInt(apsStr);
        return studentAPS >= min;
    }
};

// Check subject requirements with logging
const meetsSubjects = (requirements, studentSubjects, courseCode) => {
    if (!requirements || requirements.length === 0) {
        console.log(`Course ${courseCode}: No requirements, automatically eligible`);
        return true; // no subject requirements
    }
    for (let req of requirements) {
        // Try to find a matching subject (case‑insensitive, partial match)
        const studentSubj = studentSubjects.find(s =>
                s.name && (
                    s.name.toLowerCase().includes(req.subject.toLowerCase()) ||
                    req.subject.toLowerCase().includes(s.name.toLowerCase())
                )
        );
        if (!studentSubj) {
            console.log(`Course ${courseCode}: Missing required subject "${req.subject}"`);
            return false;
        }
        if (!studentSubj.percentage) {
            console.log(`Course ${courseCode}: Subject "${req.subject}" found but no percentage`);
            return false;
        }
        const level = getLevel(studentSubj.percentage);
        if (level < req.minLevel) {
            console.log(`Course ${courseCode}: Subject "${req.subject}" level ${level} < required ${req.minLevel}`);
            return false;
        }
    }
    console.log(`Course ${courseCode}: All requirements met`);
    return true;
};

const EligibilityChecker = () => {
    const [subjects, setSubjects] = useState([{ name: '', percentage: '' }]);
    const [selectedUniversity, setSelectedUniversity] = useState('all');
    const [results, setResults] = useState([]);

    const addSubject = () => {
        setSubjects([...subjects, { name: '', percentage: '' }]);
    };

    const removeSubject = (index) => {
        const newSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(newSubjects);
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...subjects];
        if (field === 'percentage') {
            // Allow empty string, otherwise parse as number
            newSubjects[index].percentage = value === '' ? '' : parseInt(value) || 0;
        } else {
            newSubjects[index].name = value;
        }
        setSubjects(newSubjects);
    };

    const calculateAPS = () => {
        let total = 0;
        subjects.forEach(s => {
            if (s.percentage) {
                total += getLevel(s.percentage);
            }
        });
        return total;
    };

    const handleFilter = () => {
        const studentAPS = calculateAPS();
        const studentSubjects = subjects.filter(s => s.name && s.percentage);
        console.log('Student APS:', studentAPS);
        console.log('Student subjects:', studentSubjects);

        let filteredUniversities = universities;
        if (selectedUniversity !== 'all') {
            filteredUniversities = universities.filter(u => u.id === selectedUniversity);
        }

        const newResults = filteredUniversities.map(uni => {
            console.log(`\n--- Checking ${uni.name} ---`);
            const eligibleCourses = [];
            uni.faculties.forEach(fac => {
                fac.programmes.forEach(prog => {
                    const apsOk = meetsAPS(prog.aps, studentAPS);
                    const subjectsOk = meetsSubjects(prog.requirements || [], studentSubjects, prog.code);
                    if (apsOk && subjectsOk) {
                        eligibleCourses.push({ faculty: fac.name, programme: prog });
                    }
                });
            });
            return { ...uni, eligibleCourses };
        });

        setResults(newResults);
    };

    const aps = calculateAPS();

    return (
        <div className="eligibility-checker container">
            <h1>🎓 Course Eligibility Checker</h1>
            <div className="subhead">Enter your subjects and percentages to see which courses you qualify for.</div>

            {/* University selector */}
            <div className="uni-selector">
                <label htmlFor="universitySelect"><strong>Select University:</strong></label>
                <select
                    id="universitySelect"
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                >
                    <option value="all">All Universities</option>
                    {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                </select>
            </div>

            {/* Subjects section */}
            <div className="subjects-section">
                <h3>📘 Your Subjects & Percentages</h3>
                <div id="subjectsContainer">
                    {subjects.map((subj, index) => (
                        <div key={index} className="subject-row">
                            <select
                                value={subj.name}
                                onChange={(e) => updateSubject(index, 'name', e.target.value)}
                            >
                                <option value="">Select subject</option>
                                {subjectCategories.map(cat => (
                                    <optgroup key={cat.category} label={cat.category}>
                                        {cat.subjects.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="%"
                                min="0"
                                max="100"
                                value={subj.percentage}
                                onChange={(e) => updateSubject(index, 'percentage', e.target.value)}
                            />
                            {subjects.length > 1 && (
                                <button className="remove-btn" onClick={() => removeSubject(index)}>Remove</button>
                            )}
                        </div>
                    ))}
                </div>
                <button className="add-btn" onClick={addSubject}>+ Add Subject</button>
            </div>

            {/* APS display */}
            <div className="aps-display"
                 style={{backgroundColor: aps >= 42 ? '#c8e6c9' : aps >= 30 ? '#fff9c4' : '#ffcdd2'}}>
                Your APS: <span id="apsValue">{aps}</span>
            </div>

            {/* Filter button */}
            <button className="filter-btn" onClick={handleFilter}>Check Eligibility</button>

            {/* Results */}
            <div className="results">
                {results.map(uni => (
                    <div key={uni.id} className="uni-card">
                        <h2>{uni.name}</h2>
                        {uni.eligibleCourses.length === 0 ? (
                            <p>No eligible courses found.</p>
                        ) : (
                            Object.entries(
                                uni.eligibleCourses.reduce((acc, item) => {
                                    if (!acc[item.faculty]) acc[item.faculty] = [];
                                    acc[item.faculty].push(item.programme);
                                    return acc;
                                }, {})
                            ).map(([facName, progs]) => (
                                <div key={facName} className="faculty-block">
                                    <div className="faculty-name">{facName}</div>
                                    <ul className="course-list">
                                        {progs.map(prog => (
                                            <li key={prog.code} className="course-item eligible">
                                                <span className="course-code">{prog.code}</span> {prog.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EligibilityChecker;