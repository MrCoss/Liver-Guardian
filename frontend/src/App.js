import React, { useState, useEffect, useRef } from 'react';

// --- Reusable Icon Component ---
const Icon = ({ path, className = "w-6 h-6", isSolid = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={isSolid ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {path}
    </svg>
);

// --- Social Link Icons for About Modal ---
const SocialIcon = ({ type }) => {
    const icons = {
        linkedin: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" fill="currentColor" strokeWidth="0"/><circle cx="4" cy="4" r="2" fill="currentColor" strokeWidth="0"/></>,
        github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />,
        mail: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25-2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    };
    return <svg fill={type === 'linkedin' ? 'currentColor' : 'none'} stroke={type !== 'linkedin' ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">{icons[type]}</svg>;
};

// --- About Modal Component ---
const AboutModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
        <div className="glass-pane p-8 rounded-2xl max-w-2xl w-full m-4 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />} />
            </button>
            <div className="text-center">
                 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">
                    LiverGuardian
                </h1>
                <p className="text-slate-400 mt-2">AI-Powered Cirrhosis Stage Prediction Dashboard</p>
            </div>
            <div className="mt-6 space-y-4 text-slate-300 text-sm">
                <h2 className="text-lg font-bold text-cyan-400">About the Project</h2>
                <p>LiverGuardian is a full-stack web application designed to predict the stage of liver cirrhosis using machine learning. It features a futuristic, data-driven dashboard built with React and Tailwind CSS, and a powerful backend powered by FastAPI. The application analyzes key patient biomarkers to provide an instant, AI-generated prediction, helping to visualize complex medical data in an intuitive and accessible way.</p>
                <h2 className="text-lg font-bold text-cyan-400 pt-2">About the Developer</h2>
                <div className="flex items-center gap-4">
                    <img src="https://media.licdn.com/dms/image/D4D03AQEGtX2a21p3hA/profile-displayphoto-shrink_400_400/0/1715620935198?e=1727913600&v=beta&t=o1n46g5iL3k8i9A1qZ9V3X2qR1f5j7c7g8Y9pW0c2o0" alt="Costas Pinto" className="w-20 h-20 rounded-full border-2 border-cyan-500/50 object-cover" />
                    <div>
                        <p className="font-bold text-lg text-slate-100">Costas Pinto</p>
                        <div className="flex items-center flex-wrap gap-4 mt-2">
                           <a href="https://www.linkedin.com/in/costaspinto/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"><SocialIcon type="linkedin" /> LinkedIn</a>
                           <a href="https://github.com/MrCoss" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"><SocialIcon type="github" /> GitHub</a>
                           <a href="mailto:costaspinto312@gmail.com" className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"><SocialIcon type="mail" /> Email</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Input Field Component ---
const InputField = ({ label, name, value, onChange, type = "number", step = "0.1", children }) => (
    <div className="relative group">
        <label htmlFor={name} className="block text-xs font-medium text-slate-400 mb-1 transition-colors duration-300 group-focus-within:text-purple-400">{label}</label>
        {type === 'select' ? (
            <select name={name} id={name} value={value} onChange={onChange} className="form-input py-2 px-2 text-sm">
                {children}
            </select>
        ) : (
            <input type={type} name={name} id={name} value={value} onChange={onChange} step={step} className="form-input py-2 px-2 text-sm" />
        )}
    </div>
);

// --- Gauge Chart Component for Prediction ---
const GaugeChart = ({ stage, theme }) => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (!chartRef.current) return;
        const stageValue = stage || 0;
        const textColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
        const mutedTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
        const trackColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

        const data = {
            datasets: [{
                data: [stageValue, 4 - stageValue],
                backgroundColor: (context) => {
                    const {ctx, chartArea} = context.chart;
                    if (!chartArea) return null;
                    if (context.dataIndex === 0) {
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, '#06b6d4');
                        gradient.addColorStop(1, '#67e8f9');
                        return gradient;
                    }
                    return trackColor;
                },
                borderColor: 'transparent',
                borderRadius: 20,
            }],
        };
        const centerText = {
            id: 'centerText',
            afterDraw(chart) {
                const {ctx, chartArea} = chart;
                const x = chartArea.left + chartArea.width / 2;
                const y = chartArea.top + chartArea.height / 1.5;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `bold 64px Inter, sans-serif`;
                ctx.fillStyle = textColor;
                ctx.fillText(stageValue, x, y - 25);
                ctx.font = `18px Inter, sans-serif`;
                ctx.fillStyle = mutedTextColor;
                ctx.fillText('Stage', x, y + 20);
                ctx.restore();
            }
        };
        const chartInstance = new window.Chart(chartRef.current, {
            type: 'doughnut', data,
            options: { responsive: true, maintainAspectRatio: false, rotation: -90, circumference: 180, cutout: '75%', plugins: { tooltip: { enabled: false } }, },
            plugins: [centerText],
        });
        return () => chartInstance.destroy();
    }, [stage, theme]);
    return <div className="relative w-full h-48"><canvas ref={chartRef}></canvas></div>;
};

// --- Radar Chart for Predictive Factors ---
const FactorsRadarChart = ({ theme }) => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        const pointLabelColor = theme === 'dark' ? '#94a3b8' : '#475569';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const pointBgColor = theme === 'dark' ? '#f8fafc' : '#0f172a';

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.5)');
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
        
        const chart = new window.Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Bilirubin', 'Albumin', 'Prothrombin', 'Copper', 'Age', 'SGOT'],
                datasets: [{
                    label: 'Importance',
                    data: [0.95, 0.88, 0.85, 0.76, 0.65, 0.58],
                    backgroundColor: gradient,
                    borderColor: '#14b8a6',
                    pointBackgroundColor: pointBgColor,
                    pointBorderColor: '#14b8a6',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: gridColor },
                        grid: { color: gridColor },
                        pointLabels: { color: pointLabelColor, font: { size: 12, weight: 'bold' } },
                        ticks: { display: false, stepSize: 0.25 }
                    }
                }
            }
        });
        return () => chart.destroy();
    }, [theme]);
    return <div className="relative w-full h-64"><canvas ref={chartRef}></canvas></div>;
};

// --- Recommendation Data ---
const recommendationsData = {
    1: {
        risk: "Low", riskColor: "text-green-400", riskIcon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        explanation: "Prognosis is generally excellent with proactive management of the underlying condition.",
        dietary: "Focus on a balanced, low-fat diet. Increase antioxidant-rich foods like fruits and vegetables.",
        lifestyle: "Avoid alcohol completely. Aim for at least 30 minutes of moderate exercise most days of the week.",
        medical: "Regular check-ups with your hepatologist are crucial to monitor liver function and prevent progression."
    },
    2: {
        risk: "Guarded", riskColor: "text-yellow-400", riskIcon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
        explanation: "Progression of fibrosis is possible. Medical monitoring and intervention are crucial.",
        dietary: "Limit sodium intake to manage potential fluid retention. Ensure adequate protein from lean sources.",
        lifestyle: "Strict alcohol avoidance is critical. Gentle exercise like walking or swimming is beneficial.",
        medical: "Discuss potential treatments with your doctor to manage fibrosis and address the underlying cause."
    },
    3: {
        risk: "High", riskColor: "text-orange-400", riskIcon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
        explanation: "Significant chance of developing complications. This stage requires intensive medical care.",
        dietary: "A low-sodium, fluid-restricted diet is often necessary. Work with a dietitian for a personalized plan.",
        lifestyle: "Avoid strenuous activities. Prioritize rest and manage stress to support your body.",
        medical: "Intensive management of complications is required. Your doctor may discuss advanced therapies."
    },
    4: {
        risk: "Critical", riskColor: "text-red-500", riskIcon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
        explanation: "Life-threatening complications are likely. A liver transplant is often the only definitive treatment.",
        dietary: "Nutritional support is vital. A specialized diet focusing on soft, easily digestible, high-nutrient foods is key.",
        lifestyle: "Focus on comfort and quality of life. Avoid any substances that are hard on the liver.",
        medical: "Palliative care and discussions about liver transplantation are the primary focus at this stage."
    }
};

// --- Risk Level Component ---
const RiskLevel = ({ stage }) => {
    const { risk, riskColor, riskIcon, explanation } = recommendationsData[stage] || recommendationsData[1];
    return (
        <div className="text-center">
            <Icon path={riskIcon} className={`w-12 h-12 mx-auto ${riskColor}`} />
            <h3 className={`text-2xl font-bold mt-2 ${riskColor}`}>{risk}</h3>
            <p className="text-sm text-slate-400 mt-1">{explanation}</p>
        </div>
    );
};

// --- AI Recommendations Component ---
const AiRecommendations = ({ stage }) => {
    const recs = recommendationsData[stage] || recommendationsData[1];
    const iconMap = {
        dietary: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 9" />,
        lifestyle: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6V3.75m4.25 4.25H18m-3.75 3.75H18m-4.25 4.25V18m-3.75-3.75H3m3.75-4.25H3m4.25-3.75V3.75" /></>,
        medical: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    };

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-bold text-cyan-400">AI Recommendations</h2>
            <RiskLevel stage={stage} />
            <div className="border-t border-slate-700 my-4"></div>
            {Object.entries(recs).filter(([key]) => ['dietary', 'lifestyle', 'medical'].includes(key)).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-slate-800 p-2 rounded-lg mt-1">
                        <Icon path={iconMap[key]} className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-200 capitalize">{key}</h3>
                        <p className="text-sm text-slate-400">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Biomarker Status Component ---
const BiomarkerStatus = ({ formData }) => {
    const biomarkers = {
        Bilirubin: { val: formData.Bilirubin, normal: [0.1, 1.2] },
        Albumin: { val: formData.Albumin, normal: [3.4, 5.4] },
        Prothrombin: { val: formData.Prothrombin, normal: [9.4, 12.5] },
        SGOT: { val: formData.SGOT, normal: [10, 40] },
        Platelets: { val: formData.Platelets, normal: [150, 450] },
    };

    return (
        <div className="space-y-3">
            {Object.entries(biomarkers).map(([name, { val, normal }]) => {
                const isNormal = val >= normal[0] && val <= normal[1];
                const statusColor = isNormal ? 'bg-green-500' : 'bg-red-500';
                return (
                    <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{name}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{val}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse-short`}></span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [prediction, setPrediction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAbout, setShowAbout] = useState(false);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const [formData, setFormData] = useState({
        'Status': 'C', 'Drug': 'Placebo', 'Age': 50, 'Sex': 'M', 'Ascites': 'N',
        'Hepatomegaly': 'N', 'Spiders': 'N', 'Edema': 'N', 'Bilirubin': 1.1,
        'Cholesterol': 248, 'Albumin': 3.9, 'Copper': 55, 'Alk_Phos': 1100,
        'SGOT': 120, 'Tryglicerides': 150, 'Platelets': 250, 'Prothrombin': 10.5,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        const featureVector = [
            parseFloat(formData.Age),
            parseFloat(formData.Sex === 'M' ? 1 : 0),
            parseFloat(formData.Ascites === 'Y' ? 1 : 0),
            parseFloat(formData.Hepatomegaly === 'Y' ? 1 : 0),
            parseFloat(formData.Spiders === 'Y' ? 1 : 0),
            parseFloat(formData.Edema === 'Y' ? 1 : (formData.Edema === 'S' ? 0.5 : 0)),
            parseFloat(formData.Bilirubin),
            parseFloat(formData.Cholesterol),
            parseFloat(formData.Albumin),
            parseFloat(formData.Copper),
            parseFloat(formData.Alk_Phos),
            parseFloat(formData.SGOT),
            parseFloat(formData.Tryglicerides),
            parseFloat(formData.Platelets),
            parseFloat(formData.Prothrombin),
        ];
        
        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [featureVector] })
            });

            if (!response.ok) {
                 const errData = await response.json();
                 let errorMessage = 'Prediction service error.';
                 if (errData && errData.detail) {
                     if (typeof errData.detail === 'string' && errData.detail.includes("Input data has")) {
                         errorMessage = "Data format error: The number of features sent does not match the model's expectation. Please check the data.";
                     } else {
                         errorMessage = errData.detail;
                     }
                 }
                 throw new Error(errorMessage);
            }

            const result = await response.json();
            setTimeout(() => {
                setPrediction(result.prediction[0]);
                setIsLoading(false);
            }, 1200);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    // --- Download Report Function ---
    const handleDownloadReport = () => {
        if (!prediction) return;

        const reportDate = new Date().toLocaleString();
        const recs = recommendationsData[prediction] || recommendationsData[1];

        let reportContent = `
LIVERGUARDIAN AI PREDICTION REPORT
====================================
Report Generated: ${reportDate}

PATIENT DATA
------------------------------------
`;
        const dataEntries = Object.entries(formData);
        for(let i = 0; i < dataEntries.length; i += 2) {
            const entry1 = dataEntries[i];
            const entry2 = dataEntries[i+1];
            const line = `${entry1[0].padEnd(15)}: ${entry1[1].toString().padEnd(15)} | ${entry2 ? `${entry2[0].padEnd(15)}: ${entry2[1]}` : ''}`;
            reportContent += line + '\n';
        }

        reportContent += `
PREDICTION RESULT
------------------------------------
Predicted Cirrhosis Stage: ${prediction}
Risk Level: ${recs.risk} - ${recs.explanation}

AI RECOMMENDATIONS
------------------------------------
Dietary: ${recs.dietary}
Lifestyle: ${recs.lifestyle}
Medical: ${recs.medical}

DISCLAIMER
------------------------------------
This report is generated by an AI model and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
`;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LiverGuardian_Report_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 futuristic-bg">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10 animate-fade-in-up">
                     <div className="text-left">
                        <h1 className="header-title">
                            LiverGuardian
                        </h1>
                        <p className="text-muted mt-1 text-lg">AI-Powered Cirrhosis Stage Prediction</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="glass-pane p-2 rounded-full text-muted hover:text-white transition">
                            {theme === 'dark' ? <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3 12H.75m1.59-4.95l1.59 1.59M12 6.75A5.25 5.25 0 006.75 12a5.25 5.25 0 005.25 5.25 5.25 5.25 0 005.25-5.25A5.25 5.25 0 0012 6.75z" />} /> : <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />} />}
                        </button>
                        <button onClick={() => setShowAbout(true)} className="glass-pane p-2 rounded-full text-muted hover:text-white transition">
                            <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* --- Left Column: Patient Data Input --- */}
                     <div className="lg:col-span-1 glass-pane p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                         <h2 className="text-xl font-bold mb-4 text-purple-400">Patient Data Input</h2>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">General</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Age" name="Age" value={formData.Age} onChange={handleInputChange} type="number" step="1" />
                                    <InputField label="Sex" name="Sex" value={formData.Sex} onChange={handleInputChange} type="select">
                                        <option value="M">Male</option><option value="F">Female</option>
                                    </InputField>
                                     <InputField label="Status" name="Status" value={formData.Status} onChange={handleInputChange} type="select">
                                        <option value="C">Completed</option><option value="D">Discontinued</option><option value="CL">Completed Liver</option>
                                    </InputField>
                                    <InputField label="Drug" name="Drug" value={formData.Drug} onChange={handleInputChange} type="select">
                                        <option value="Placebo">Placebo</option><option value="D-penicillamine">D-penicillamine</option>
                                    </InputField>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">Observations</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Ascites" name="Ascites" value={formData.Ascites} onChange={handleInputChange} type="select">
                                        <option value="N">No</option><option value="Y">Yes</option>
                                    </InputField>
                                    <InputField label="Hepatomegaly" name="Hepatomegaly" value={formData.Hepatomegaly} onChange={handleInputChange} type="select">
                                        <option value="N">No</option><option value="Y">Yes</option>
                                    </InputField>
                                    <InputField label="Spiders" name="Spiders" value={formData.Spiders} onChange={handleInputChange} type="select">
                                        <option value="N">No</option><option value="Y">Yes</option>
                                    </InputField>
                                    <InputField label="Edema" name="Edema" value={formData.Edema} onChange={handleInputChange} type="select">
                                        <option value="N">No</option><option value="S">Slight</option><option value="Y">Yes</option>
                                    </InputField>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-300 mb-2">Lab Results</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Bilirubin" name="Bilirubin" value={formData.Bilirubin} onChange={handleInputChange} />
                                    <InputField label="Cholesterol" name="Cholesterol" value={formData.Cholesterol} onChange={handleInputChange} />
                                    <InputField label="Albumin" name="Albumin" value={formData.Albumin} onChange={handleInputChange} />
                                    <InputField label="Copper" name="Copper" value={formData.Copper} onChange={handleInputChange} />
                                    <InputField label="Alk Phos" name="Alk_Phos" value={formData.Alk_Phos} onChange={handleInputChange} />
                                    <InputField label="SGOT" name="SGOT" value={formData.SGOT} onChange={handleInputChange} />
                                    <InputField label="Triglicerides" name="Tryglicerides" value={formData.Tryglicerides} onChange={handleInputChange} />
                                    <InputField label="Platelets" name="Platelets" value={formData.Platelets} onChange={handleInputChange} />
                                    <InputField label="Prothrombin" name="Prothrombin" value={formData.Prothrombin} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading} className="button-primary">
                                    <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5a3.375 3.375 0 00-3.375-3.375L13.5 9.75l-1.125 1.125a3.375 3.375 0 00-3.375 3.375v1.5a2.25 2.25 0 002.25 2.25h1.5a3.375 3.375 0 003.375-3.375L18 13.5z" />} className="w-5 h-5 mr-2" />
                                    {isLoading ? 'Analyzing...' : 'Run Prediction'}
                                </button>
                                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                            </div>
                         </form>
                    </div>

                    {/* --- Center Column: Prediction --- */}
                    <div className="lg:col-span-2 glass-pane p-6 animate-fade-in-up flex flex-col justify-between" style={{ animationDelay: '200ms' }}>
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-cyan-400">Prediction Result</h2>
                            <GaugeChart stage={prediction} theme={theme}/>
                        </div>
                        {prediction ? (
                            <div className="mt-4 space-y-4">
                                <AiRecommendations stage={prediction} />
                                <button onClick={handleDownloadReport} className="button-secondary">
                                    <Icon path={<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />} className="w-5 h-5 mr-2" />
                                    Download Report
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* --- Right Column: Data Insights --- */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="glass-pane p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                             <h2 className="text-xl font-bold mb-4 text-teal-400">Key Predictive Factors</h2>
                             <FactorsRadarChart theme={theme}/>
                        </div>
                        <div className="glass-pane p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                             <h2 className="text-xl font-bold mb-4 text-teal-400">Biomarker Status</h2>
                             <BiomarkerStatus formData={formData} />
                        </div>
                    </div>
                </main>
            </div>
            {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        </div>
    );
};

export default App;

