export const getLevel = (percentage) => {
    if (percentage >= 80) return 7;
    if (percentage >= 70) return 6;
    if (percentage >= 60) return 5;
    if (percentage >= 50) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 30) return 2;
    if (percentage >= 0) return 1;
    return 0;
};

export const meetsAPS = (apsRequirement, studentAPS) => {
    if (!apsRequirement) return true;
    const apsStr = String(apsRequirement);
    if (apsStr.endsWith('+')) {
        const min = parseInt(apsStr.slice(0, -1));
        return studentAPS >= min;
    } else {
        const min = parseInt(apsStr);
        return studentAPS >= min;
    }
};

export const meetsSubjects = (requirements, studentSubjects) => {
    if (!requirements || requirements.length === 0) return true;
    for (let req of requirements) {
        const studentSubj = studentSubjects.find(s =>
                s.name && (
                    s.name.toLowerCase().includes(req.subject.toLowerCase()) ||
                    req.subject.toLowerCase().includes(s.name.toLowerCase())
                )
        );
        if (!studentSubj || !studentSubj.percentage) return false;
        const level = getLevel(studentSubj.percentage);
        if (level < req.minLevel) return false;
    }
    return true;
};