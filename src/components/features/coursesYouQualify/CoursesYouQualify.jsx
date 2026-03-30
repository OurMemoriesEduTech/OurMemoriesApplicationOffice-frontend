import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {calculateAPS, getQualifyingCourses, calculateLevel,} from "./apsLogic";
import { availableSubjects, subjectNames } from "./Subjects";
import { coursesTUT as tutCourses } from "./universityProspectus/TshwaneUniversityOfTechnology.js";
import { coursesUJ as ujCourses } from "./universityProspectus/UniversityOfJohannesburg.js";
import { coursesWITS as witsCourses } from "./universityProspectus/WitsUniversity.js";
import { coursesUP as upCourses } from "./universityProspectus/UniversityOfPretoria.js";
import { coursesUL as ulCourses } from "./universityProspectus/UniversityOfLimpopo.js";
import { coursesUNIVEN as univenCourses } from "./universityProspectus/UniversityOfVenda.js";
import { coursesUMP as umpCourses } from "./universityProspectus/UniversityOfMpumalanga.js";
import { coursesVUT as vutCourses } from "./universityProspectus/VaalUniversityOfTechnology.js";
import { coursesDUT as dutCourses } from "./universityProspectus/DurbanUniversityOfTechnology.js";
import { coursesMUT as mutCourses } from "./universityProspectus/MangosuthuUniversityOfTechnology.js";
import { coursesNWU as nwuCourses } from "./universityProspectus/North-WestUniversity.js";
import { coursesSPU as spuCourses } from "./universityProspectus/SolPlaatjeUniversity.js";
import { coursesUFS as ufsCourses } from "./universityProspectus/UniversityOfFree-State.js";

import "./CoursesYouQualify.css";

const universityData = {
    tut: { name: "Tshwane University of Technology (TUT)", courses: tutCourses },
    uj: { name: "University of Johannesburg (UJ)", courses: ujCourses },
    up: { name: "University of Pretoria (UP)", courses: upCourses },
    wits: { name: "University of the Witwatersrand (Wits)", courses: witsCourses },
    ul: { name: "University of Limpopo (UL)", courses: ulCourses },
    univen: { name: "University of Venda (UNIVEN)", courses: univenCourses },
    ump: { name: "University of Mpumalanga (UMP)", courses: umpCourses },
    vut: { name: "Vaal University of Technology (VUT)", courses: vutCourses },
    nwu: { name: "North-West University (NWU)", courses: nwuCourses },
    spu: { name: "Sol Plaatje University (SPU)", courses: spuCourses },
    ufs: { name: "University of Free State (UFS)", courses: ufsCourses },
    dut: { name: "Durban University of Technology (DUT)", courses: dutCourses },
    mut: { name: "Mangosuthu University of Technology (MUT)", courses: mutCourses },
};

const CoursesYouQualify = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState("all");
    const [qualifyingCoursesByUni, setQualifyingCoursesByUni] = useState({});
    const [courseData, setCourseData] = useState({});
    const [aps, setAps] = useState(0);
    const [loading, setLoading] = useState(true);

    const [minAPSFilter, setMinAPSFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("title");

    const navigate = useNavigate();

    // Load course data
    useEffect(() => {
        const combined = {};
        Object.entries(universityData).forEach(([id, { courses }]) => {
            combined[id] = (courses || [])
                .filter(c => c.id && c.title && typeof c.requirements?.minAPS === "number")
                .map(c => ({ ...c, university: id }));
        });
        setCourseData(combined);
        setLoading(false);
    }, []);

    // Recalculate APS & qualifying courses
    useEffect(() => {
        const valid = subjects.filter(
            s => s.subject && s.marks !== "" && !isNaN(s.marks) && s.marks >= 0 && s.marks <= 100
        );

        if (valid.length === 0) {
            setAps(0);
            setQualifyingCoursesByUni({});
            return;
        }

        const calculated = calculateAPS(valid);
        setAps(calculated);

        const qualified = {};
        Object.entries(courseData).forEach(([uniId, courses]) => {
            const filtered = selectedUniversity === "all"
                ? courses
                : courses.filter(c => c.university === selectedUniversity);
            if (filtered.length > 0) {
                qualified[uniId] = getQualifyingCourses(filtered, { subjects: valid, aps: calculated });
            }
        });
        setQualifyingCoursesByUni(qualified);
    }, [subjects, courseData, selectedUniversity]);

    const addSubject = () => setSubjects(prev => [...prev, { subject: "", marks: "" }]);
    const updateSubject = (i, field, value) => setSubjects(prev =>
        prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );
    const removeSubject = (i) => setSubjects(prev => prev.filter((_, idx) => idx !== i));

    const totalQualified = Object.values(qualifyingCoursesByUni).reduce((a, b) => a + b.length, 0);
    const hasValidInput = subjects.some(s => s.subject && s.marks !== "" && !isNaN(s.marks));

    const handleApply = (uniId, course) => {
        const validSubjects = subjects
            .filter(s => s.subject && s.marks !== "" && !isNaN(s.marks) && s.marks >= 0 && s.marks <= 100)
            .map(s => ({
                name: subjectNames[s.subject] || s.subject,
                marks: parseInt(s.marks),
                level: calculateLevel(parseInt(s.marks)),
            }));

        if (validSubjects.length === 0) {
            alert("Please enter at least one subject with valid marks.");
            return;
        }

        navigate("/university-application", {
            state: {
                university: universityData[uniId].name,
                course: course.title,
                subjects: validSubjects,
                aps: aps,
            },
        });
    };

    // Build filtered & sorted course list for table
    const allFilteredCourses = Object.entries(courseData)
        .flatMap(([uniId, courses]) =>
            courses
                .filter(c => {
                    const matchUni = selectedUniversity === "all" || c.university === selectedUniversity;
                    const matchAPS = minAPSFilter === "" || c.requirements.minAPS >= Number(minAPSFilter);
                    const isQualified = qualifyingCoursesByUni[uniId]?.some(q => q.id === c.id);
                    const matchStatus = statusFilter === "all" ||
                        (statusFilter === "qualified" && isQualified) ||
                        (statusFilter === "not-qualified" && !isQualified);
                    const matchSearch = searchQuery === "" ||
                        c.title.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchUni && matchAPS && matchStatus && matchSearch;
                })
                .map(c => ({
                    ...c,
                    uniName: universityData[uniId].name.split(" (")[0],
                    isQualified: qualifyingCoursesByUni[uniId]?.some(q => q.id === c.id),
                }))
        )
        .sort((a, b) => sortBy === "title" ? a.title.localeCompare(b.title) : a.requirements.minAPS - b.requirements.minAPS);

    const resetFilters = () => {
        setMinAPSFilter("");
        setStatusFilter("all");
        setSearchQuery("");
        setSortBy("title");
        setSelectedUniversity("all");
    };

    return (
        <div className="app-container">
            <div className="page-wrapper">

                <section className="hero">
                    <h1>Find Your Perfect University Course</h1>
                    <p>Enter your NSC marks to see which courses you qualify for.</p>
                </section>

                {/* SUBJECTS */}
                <section className="subjects-section">
                    <h3>Your NSC Subjects</h3>

                    {subjects.length === 0 ? (
                        <div className="empty-with-add">
                            <p>Click below to add your first subject.</p>
                            <button onClick={addSubject} className="add-btn-inline">+ Add Subject</button>
                        </div>
                    ) : (
                        <div className="subjects-list">
                            {subjects.map((sub, i) => (
                                <div key={i}>
                                    <div className="subject-row">
                                        <select value={sub.subject}
                                                onChange={e => updateSubject(i, "subject", e.target.value)}>
                                            <option value="">Select Subject</option>
                                            {availableSubjects
                                                .filter(s => !subjects.some((x, j) => j !== i && x.subject === s))
                                                .map(s => <option key={s} value={s}>{subjectNames[s]}</option>)}
                                        </select>

                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="Marks"
                                            value={sub.marks}
                                            onChange={e => updateSubject(i, "marks", e.target.value)}
                                            className={sub.marks && (isNaN(sub.marks) || sub.marks < 0 || sub.marks > 100) ? "error" : ""}
                                        />

                                        <span className="level">
    {sub.marks && !isNaN(sub.marks) && sub.marks >= 0 && sub.marks <= 100
        ? `L${calculateLevel(parseInt(sub.marks))}`
        : "-"}
  </span>

                                        {/* NEW: Button group for alignment */}
                                        <div className="button-group">
                                            <button onClick={() => removeSubject(i)} className="remove-btn">x</button>
                                        </div>
                                    </div>

                                    {i === subjects.length - 1 && (
                                        <div className="add-btn-wrapper">
                                            <div className="button-group">
                                                <button onClick={addSubject} className="add-btn-inline">+ Add Another
                                                    Subject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* APS & RESULTS */}
                {aps > 0 && (
                    <div className="aps-banner">
                        <strong>APS: {aps}</strong> | {subjects.filter(s => s.marks).length} subjects
                    </div>
                )}

                <section className="results">
                    <h3>
                        {hasValidInput
                            ? totalQualified > 0
                                ? `You qualify for ${totalQualified} course(s)`
                                : "No courses yet"
                            : "Enter marks to see results"}
                    </h3>
                </section>

                {/* UNIVERSITY + FILTERS */}
                <section className="table-controls">
                    <div className="uni-selector-inline">
                        <label>Filter by University:</label>
                        <select value={selectedUniversity} onChange={e => setSelectedUniversity(e.target.value)}>
                            <option value="all">All Universities</option>
                            {Object.entries(universityData).map(([id, { name }]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filters">
                        <input placeholder="Min APS" value={minAPSFilter} onChange={e => setMinAPSFilter(e.target.value)} />
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="qualified">Qualified Only</option>
                            <option value="not-qualified">Not Qualified</option>
                        </select>
                        <input placeholder="Search course" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="title">Sort by Name</option>
                            <option value="aps">Sort by APS</option>
                        </select>
                        <button onClick={resetFilters} className="reset-btn">Reset</button>
                    </div>
                </section>

                {/* COURSES TABLE */}
                <section className="table-section">
                    <h3>Courses</h3>
                    {loading ? (
                        <p>Loading courses...</p>
                    ) : allFilteredCourses.length === 0 ? (
                        <p className="no-results">No courses match your filters.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="courses-table">
                                <thead>
                                <tr>
                                    <th>University</th>
                                    <th>Course</th>
                                    <th>Min APS</th>
                                    <th>Required Subjects</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {allFilteredCourses.map((c, i) => (
                                    <tr key={i} className={c.isQualified ? "qualified" : ""}>
                                        <td>{c.uniName}</td>
                                        <td>{c.title}</td>
                                        <td>{c.requirements.minAPS}</td>
                                        <td>
                                            {c.requirements.requiredSubjects && c.requirements.requiredSubjects.length > 0 ? (
                                                c.requirements.requiredSubjects.map((r, j) => (
                                                    <span key={j} className="tag">
        {subjectNames[r.subject] || r.subject} L{r.minLevel}+
      </span>
                                                ))
                                            ) : (
                                                <span className="no-subjects">No specific subjects required</span>
                                            )}
                                        </td>
                                        <td>
                        <span className={`status ${c.isQualified ? "yes" : "no"}`}>
                          {c.isQualified ? "Qualified" : "Not Yet"}
                        </span>
                                        </td>
                                        <td>
                                            {c.isQualified && (
                                                <button onClick={() => handleApply(c.university, c)}
                                                        className="apply-btn-small">
                                                    Apply
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default CoursesYouQualify;