import React, { useState } from "react";
import "./Digital-Prospectuses.css";

const ProspectusFeature = () => {
    // State for search term and selected section
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState(null); // null, "university", or "tvet"

    // University prospectuses
    const universityProspectuses = [
        {
            id: 1,
            institution: "Cape Peninsula University Of Technology (CPUT)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/CPUT-2026.pdf",
            type: "university"
        },
        {
            id: 2,
            institution: "Central University of Technology (CUT)",
            title: "2026 Postgraduate Prospectus",
            pdfFile: "/prospectuses/CUT-2026.pdf",
            type: "university"
        },
        {
            id: 3,
            institution: "Durban University of Technology (DUT)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/DUT-2026.pdf",
            type: "university"
        },
        {
            id: 4,
            institution: "Mangosuthu University of Technology (MUT)",
            title: "2026 General Prospectus",
            pdfFile: "/prospectuses/MUT-2026.pdf",
            type: "university"
        },
        {
            id: 5,
            institution: "University of Mpumalanga (UMP)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/UMP-2026.pdf",
            type: "university"
        },
        {
            id: 6,
            institution: "Nelson Mandela Metropolitan University (NMU)",
            title: "2026 Comprehensive Prospectus",
            pdfFile: "/prospectuses/NMU-2026.pdf",
            type: "university"
        },
        {
            id: 7,
            institution: "North-West University (NWU)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/NWU-2026.pdf",
            type: "university"
        },
        {
            id: 8,
            institution: "Rhodes University (RU)",
            title: "2026 Academic Prospectus",
            pdfFile: "/prospectuses/RU-2026.pdf",
            type: "university"
        },
        {
            id: 9,
            institution: "Sefako Makgatho University (SMU)",
            title: "2026 Health Sciences Prospectus",
            pdfFile: "/prospectuses/SMU-2026.pdf",
            type: "university"
        },
        {
            id: 10,
            institution: "Sol Plaatje University (SPU)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/SPU-2026.pdf",
            type: "university"
        },
        {
            id: 11,
            institution: "Stellenbosch University (SU)",
            title: "2026 Postgraduate Prospectus",
            pdfFile: "/prospectuses/SU-2026.pdf",
            type: "university"
        },
        {
            id: 12,
            institution: "Tshwane University of Technology (TUT)",
            title: "2026 Courses Prospectus",
            pdfFile: "/prospectuses/TUT-2026.pdf",
            type: "university"
        },
        {
            id: 13,
            institution: "University of Cape Town (UCT)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/UCT-2026.pdf",
            type: "university"
        },
        {
            id: 14,
            institution: "University of Fort Hare (UFH)",
            title: "2026 General Prospectus",
            pdfFile: "/prospectuses/UFH-2026.pdf",
            type: "university"
        },
        {
            id: 15,
            institution: "University of Johannesburg (UJ)",
            title: "2026 Comprehensive Prospectus",
            pdfFile: "/prospectuses/UJ-2026.pdf",
            type: "university"
        },
        {
            id: 16,
            institution: "University of KwaZulu Natal (UKZN)",
            title: "2026 Academic Prospectus",
            pdfFile: "/prospectuses/UKZN-2026.pdf",
            type: "university"
        },
        {
            id: 17,
            institution: "University of Limpopo (UL)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/UL-2026.pdf",
            type: "university"
        },
        {
            id: 18,
            institution: "University of Pretoria (UP)",
            title: "2026 Postgraduate Prospectus",
            pdfFile: "/prospectuses/UP-2026.pdf",
            type: "university"
        },
        {
            id: 19,
            institution: "University of South Africa (UNISA)",
            title: "2026 Distance Learning Prospectus",
            pdfFile: "/prospectuses/UNISA-2026.pdf",
            type: "university"
        },
        {
            id: 20,
            institution: "University of Free State (UFS)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/UFS-2026.pdf",
            type: "university"
        },
        {
            id: 21,
            institution: "University of Western Cape (UWC)",
            title: "2026 Academic Prospectus",
            pdfFile: "/prospectuses/UWC-2026.pdf",
            type: "university"
        },
        {
            id: 22,
            institution: "University of Witwatersrand (WITS)",
            title: "2026 Comprehensive Prospectus",
            pdfFile: "/prospectuses/WITS-2026.pdf",
            type: "university"
        },
        {
            id: 23,
            institution: "University of Venda (UNIVEN)",
            title: "2026 General Prospectus",
            pdfFile: "/prospectuses/UNIVEN-2026.pdf",
            type: "university"
        },
        {
            id: 24,
            institution: "University of Zululand (UNIZULU)",
            title: "2026 Undergraduate Prospectus",
            pdfFile: "/prospectuses/UNIZULU-2026.pdf",
            type: "university"
        },
        {
            id: 25,
            institution: "Vaal University of Technology (VUT)",
            title: "2026 Courses Prospectus",
            pdfFile: "/prospectuses/VUT-2026.pdf",
            type: "university"
        },
        {
            id: 26,
            institution: "Walter Sisulu University (WSU)",
            title: "2026 Comprehensive Prospectus",
            pdfFile: "/prospectuses/WSU-2026.pdf",
            type: "university"
        }
    ];

    // TVET College prospectuses
    const tvetProspectuses = [
        {
            id: 1,
            institution: "Ekurhuleni West College",
            title: "2025 General Prospectus",
            pdfFile: "/prospectuses/EWC.pdf",
        },
        {
            id: 2,
            institution: "Tshwane South TVET College",
            title: "2025 Courses Prospectus",
            pdfFile: "/prospectuses/TSC.pdf",
        },
    ];

    // Filter prospectuses based on search term
    const filteredUniversityProspectuses = universityProspectuses.filter(
        (prospectus) =>
            prospectus.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prospectus.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTvetProspectuses = tvetProspectuses.filter(
        (prospectus) =>
            prospectus.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prospectus.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="prospectus-section py-12 px-4 max-w-7xl mx-auto">
            {/* Initial Choice Screen */}
            {selectedSection === null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                    <div
                        className="feature-card bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-transform duration-200 cursor-pointer"
                        onClick={() => setSelectedSection("university")}
                    >
                        <span className="feature-icon">🎓</span>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            University Prospectuses
                        </h3>
                        <p className="text-gray-600">
                            Explore prospectuses from top universities.
                        </p>
                    </div>
                    <div
                        className="feature-card bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-transform duration-200 cursor-pointer"
                        onClick={() => setSelectedSection("tvet")}
                    >
                        <span className="feature-icon">🏫</span>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            TVET College Prospectuses
                        </h3>
                        <p className="text-gray-600">
                            Discover courses offered by TVET colleges.
                        </p>
                    </div>
                </div>
            )}

            {/* University Section */}
            {selectedSection === "university" && (
                <>
                    <div className="button-container text-center mb-8">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSelectedSection(null);
                                setSearchTerm("");
                            }}
                        >
                            Back to Selection
                        </button>
                    </div>
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search university prospectuses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control w-full max-w-md mx-auto p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        🎓 University Prospectuses
                    </h2>
                    {filteredUniversityProspectuses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                            {filteredUniversityProspectuses.map((prospectus) => (
                                <ProspectusCard key={prospectus.id} prospectus={prospectus} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 mb-16">
                            No university prospectuses match your search.
                        </p>
                    )}
                </>
            )}

            {/* TVET Section */}
            {selectedSection === "tvet" && (
                <>
                    <div className="button-container text-center mb-8">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSelectedSection(null);
                                setSearchTerm("");
                            }}
                        >
                            Back to Selection
                        </button>
                    </div>
                    <div className="mb-8">
                        <input
                            type="text"
                            placeholder="Search TVET college prospectuses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control w-full max-w-md mx-auto p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        🏫 TVET College Prospectuses
                    </h2>
                    {filteredTvetProspectuses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {filteredTvetProspectuses.map((prospectus) => (
                                <ProspectusCard key={prospectus.id} prospectus={prospectus} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">
                            No TVET prospectuses match your search.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

// Reusable card component
const ProspectusCard = ({ prospectus }) => (
    <div className="feature-card bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-transform duration-200">
        <span className="feature-icon">📚</span>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {prospectus.institution}
        </h3>
        <p className="text-gray-600 mb-4">
            {prospectus.title}
        </p>

        {/* PDF Preview */}
        {prospectus.pdfFile ? (
            <div className="w-full border rounded-lg shadow overflow-hidden">
                <embed
                    src={prospectus.pdfFile}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                />
            </div>
        ) : (
            <p className="text-red-500">PDF not available.</p>
        )}

        {/* Open in new tab button */}
        <div className="button-container mt-4">
            <a
                href={prospectus.pdfFile}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
            >
                Open Full PDF
            </a>
        </div>
    </div>
);

export default ProspectusFeature;