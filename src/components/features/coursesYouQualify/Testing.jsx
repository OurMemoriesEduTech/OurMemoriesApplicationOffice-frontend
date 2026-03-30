import { useLocation } from "react-router-dom";

const Testing = () => {
    const { state } = useLocation();
    const { university, course, subjects, aps } = state || {};

    return (
        <div>
            <h1>Apply: {course}</h1>
            <p><strong>University:</strong> {university}</p>
            <p><strong>APS:</strong> {aps}</p>
            <h3>Your Subjects:</h3>
            <ul>
                {subjects?.map((s, i) => (
                    <li key={i}>{s.name}: {s.marks}% (Level {s.level})</li>
                ))}
            </ul>
        </div>
    );
};

export default Testing;