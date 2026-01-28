import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Calendar, BookOpen, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import SharedPlan from './SharedPlan';

const Planner = () => {
    const [step, setStep] = useState(1); // 1: Topic, 2: Clarification
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState(2);
    const [loading, setLoading] = useState(false);
    const [researchStatus, setResearchStatus] = useState('');
    const navigate = useNavigate();

    const [previewPlan, setPreviewPlan] = useState<any>(null);

    // Clarification State
    const [level, setLevel] = useState('advanced');
    const [language, setLanguage] = useState('Java');
    const [goals, setGoals] = useState('');
    const [hours, setHours] = useState(8);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const statusSteps = [
            'Analyzing domain requirements...',
            `Searching for ${topic} documentation...`,
            'Identifying high-rated tutorials...',
            'Building interactive lab exercises...',
            'Finalizing day-by-day incubation schedule...'
        ];

        for (const step of statusSteps) {
            setResearchStatus(step);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
            const getResourcesForTopic = (topicName: string) => {
                const t = topicName.toLowerCase();

                // Curated Resource Libraries
                const libraries: Record<string, { title: string, url: string }[]> = {
                    grpc: [
                        // Core Concepts
                        { title: 'gRPC 101 (YouTube Review)', url: 'https://www.youtube.com/watch?v=DU-q5kOf2Rc' },
                        { title: 'What is gRPC? (GeeksforGeeks)', url: 'https://www.geeksforgeeks.org/software-engineering/what-is-grpc/' },
                        { title: 'gRPC vs REST (GeeksforGeeks)', url: 'https://www.geeksforgeeks.org/blogs/grpc-vs-rest/' },
                        { title: 'gRPC Official Documentation', url: 'https://grpc.io/docs/' },
                        { title: 'gRPC vs REST (IBM)', url: 'https://www.ibm.com/cloud/learn/grpc-vs-rest' },
                        { title: 'Protocol Buffers Guide (proto3)', url: 'https://protobuf.dev/programming-guides/proto3/' },

                        // Implementation & Tutorials
                        { title: 'Introduction to gRPC (Baeldung)', url: 'https://www.baeldung.com/grpc-introduction' },
                        { title: 'gRPC with Spring Boot (Baeldung)', url: 'https://www.baeldung.com/spring-boot-grpc' },
                        { title: 'Java Quickstart (gRPC.io)', url: 'https://grpc.io/docs/languages/java/quickstart/' },
                        { title: 'Google Codelabs: gRPC Java', url: 'https://codelabs.developers.google.com/codelabs/cloud-grpc-java' },

                        // Advanced & Specifics
                        { title: 'Streaming with gRPC (Baeldung)', url: 'https://www.baeldung.com/grpc-streaming-in-java' },
                        { title: 'Unit Testing gRPC Services (Baeldung)', url: 'https://www.baeldung.com/grpc-unit-testing' },
                        { title: 'Authentication in gRPC', url: 'https://grpc.io/docs/guides/auth/' },
                        { title: 'Performance Best Practices', url: 'https://grpc.io/docs/guides/performance/' },

                        // Community & Masterclasses
                        { title: 'gRPC Useful Resources (TutorialsPoint)', url: 'https://www.tutorialspoint.com/grpc/grpc_useful_resources.htm' },
                        { title: 'Understanding gRPC Concepts (Infracloud)', url: 'https://www.infracloud.io/blogs/understanding-grpc-concepts-best-practices/' },
                        { title: 'gRPC Master Class (Udemy - Paid)', url: 'https://www.udemy.com/course/grpc-the-complete-guide-for-java-developers/' },
                        { title: 'Hands-on gRPC Playlist (YouTube)', url: 'https://www.youtube.com/watch?v=1yjAUY1ifUg&list=PLVz2XdJiJQxw0f6wXQCdWKabLdqSzGA0X' },
                        { title: 'Comprehensive gRPC Series (YouTube)', url: 'https://www.youtube.com/watch?v=4onJ94fz8s4&list=PLZnMNSr-VrIgy2S06kDKdlq4FueU84oec' },

                        // Advanced Performance (New)
                        { title: '1M Requests Under 4 Seconds (YouTube)', url: 'https://www.youtube.com/watch?v=1yjAUY1ifUg' },
                        { title: 'Microservices with gRPC (GitHub Repo)', url: 'https://github.com/uid4oe/microservices-java-grpc' }
                    ],
                    react: [
                        { title: 'React Documentation (Latest)', url: 'https://react.dev' },
                        { title: 'React Hooks Deep Dive', url: 'https://usehooks.com/' },
                        { title: 'Redux Toolkit - Modern State Management', url: 'https://redux-toolkit.js.org/' },
                        { title: 'Frontend Masters - React Path', url: 'https://frontendmasters.com/learn/react/' },
                        { title: 'React Performance Optimization', url: 'https://react.dev/learn/render-and-commit' }
                    ],
                    typescript: [
                        { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
                        { title: 'Total TypeScript (Matt Pocock)', url: 'https://www.totaltypescript.com/' },
                        { title: 'Advanced Types Patterns', url: 'https://fettblog.eu/typescript-react/patterns/' }
                    ]
                };

                const matchedKey = Object.keys(libraries).find(k => t.includes(k));
                if (matchedKey) return libraries[matchedKey];

                // Dynamic Fallback
                return [
                    { title: `Welcome to ${topicName} (Docs)`, url: `https://www.google.com/search?btnI=1&q=${encodeURIComponent(topicName + ' official documentation')}` },
                    { title: `${topicName} Crash Course`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent('learn ' + topicName)}` },
                    { title: `Best Practices for ${topicName}`, url: `https://www.google.com/search?q=${encodeURIComponent(topicName + ' best practices 2024')}` },
                    { title: `${topicName} Github Ecosystem`, url: `https://github.com/search?q=${encodeURIComponent(topicName)}` },
                    { title: `Community Examples: ${topicName}`, url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(topicName.toLowerCase())}` }
                ];
            };

            const resources = getResourcesForTopic(topic);

            const planContent = {
                title: topic,
                details: { level, language, goals, hours_per_day: hours },
                duration_weeks: duration,
                days: Array.from({ length: duration * 5 }).map((_, i) => {
                    const dayNum = i + 1;
                    const totalDays = duration * 5;
                    const progress = dayNum / totalDays;

                    let phaseTitle = '';
                    let taskType = '';

                    if (progress <= 0.2) {
                        phaseTitle = 'Phase 1: Foundations & Core Concepts';
                        taskType = 'Exploration';
                    } else if (progress <= 0.5) {
                        phaseTitle = 'Phase 2: Practical Implementation & Patterns';
                        taskType = 'Implementation';
                    } else if (progress <= 0.8) {
                        phaseTitle = 'Phase 3: Advanced Techniques & Optimization';
                        taskType = 'Optimization';
                    } else {
                        phaseTitle = 'Phase 4: Capstone Project & Mastery';
                        taskType = 'Capstone';
                    }

                    // Improved Round-Robin Distribution
                    // Ensure we don't pick the same resources for adjacent days if possible
                    const coreResource = resources[i % resources.length];
                    const extraResource = resources[(i + 2) % resources.length];

                    return {
                        day: dayNum,
                        topic: `${topic} - ${phaseTitle}`,
                        resources: [
                            coreResource,
                            extraResource
                        ],
                        tasks: [
                            {
                                title: `${taskType} Task for Day ${dayNum}`,
                                details: `1. Study the linked ${coreResource.title}.\n2. Apply the concepts to your ${topic} project.\n3. Commit your progress to git.\n4. Document challenges faced in the ${taskType.toLowerCase()} phase.`,
                                type: 'hands-on'
                            }
                        ]
                    };
                })
            };

            setPreviewPlan(planContent);
            setStep(3);
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setLoading(false);
            setResearchStatus('');
        }
    };

    const handleConfirmSave = async () => {
        setLoading(true);
        setResearchStatus('Persisting plan to database...');
        try {
            const { data, error } = await supabase
                .from('incubation_plans')
                .insert([
                    {
                        topic_name: topic,
                        duration_weeks: duration,
                        content: previewPlan
                    }
                ])
                .select();

            if (error) throw error;
            if (data) navigate(`/plan/${data[0].id}`);
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (step === 3 && previewPlan) {
        return (
            <div key="step3" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg-obsidian)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Draft Mode Header */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1002,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-glass)',
                    padding: '1rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
                            DRAFT PREVIEW
                        </div>
                        <h3 className="font-outfit" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dim)' }}>
                            {topic} Incubation Plan
                        </h3>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{duration} Weeks</span> • {level} • {language}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, padding: '2rem', paddingBottom: '140px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid var(--border-glass)' }}
                    >
                        <SharedPlan draftPlan={previewPlan} />
                    </motion.div>
                </div>

                {/* Sticky Action Footer */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 1002,
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ maxWidth: '600px', width: '100%', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="btn"
                            style={{
                                flex: 1,
                                background: 'white',
                                border: '1px solid var(--border-glass)',
                                color: 'var(--text-dim)',
                                height: '56px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                            }}
                        >
                            Edit Requirements
                        </button>
                        <button
                            onClick={handleConfirmSave}
                            disabled={loading}
                            className="btn btn-premium"
                            style={{ flex: 2, height: '56px', fontSize: '1.1rem', borderRadius: '14px' }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Finalizing...</span>
                                </div>
                            ) : (
                                <>Approve & Persist Plan <CheckCircle2 size={20} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="planner-container container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass"
                style={{ width: '100%', maxWidth: '700px', padding: '3.5rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}
            >
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        style={{ display: 'inline-flex', padding: '12px', background: 'var(--bg-obsidian)', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}
                    >
                        <Zap color="var(--secondary)" fill="var(--secondary)" size={28} />
                    </motion.div>
                    <h1 className="gradient-text font-outfit" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                        Incubation Planner
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto' }}>
                        Deploy our Research Agent to research and design a bespoke 2-week incubation program for your team.
                    </p>
                </header>

                <div style={{ position: 'relative' }}>
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleNext}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
                        >
                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--text-white)', fontWeight: 500 }}>
                                    <BookOpen size={20} color="var(--primary)" /> Incubation Topic
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Advanced React 19, Go Microservices..."
                                    className="input-premium"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--text-white)', fontWeight: 500 }}>
                                    <Calendar size={20} color="var(--secondary)" /> Program Duration
                                </label>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <input
                                        type="range"
                                        min="1"
                                        max="4"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: 'var(--primary)', height: '6px' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{duration}</span>
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Weeks</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-premium" style={{ height: '60px', fontSize: '1.1rem' }}>
                                Next Step <ChevronRight size={20} />
                            </button>
                        </motion.form>
                    ) : step === 2 ? (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onSubmit={handleGenerate}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Skill Level</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="input-premium"
                                        style={{ width: '100%', appearance: 'none', background: 'var(--bg-obsidian)' }}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Main Language</label>
                                    <input
                                        type="text"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        placeholder="Go, Python, etc."
                                        className="input-premium"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Primary Goals (Optional)</label>
                                <input
                                    type="text"
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                    placeholder="e.g. Microservices, Kubernetes..."
                                    className="input-premium"
                                    style={{ width: '100%' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>These will be weighted heavily by the Research Agent.</p>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Daily Commitment ({hours} Hours)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    value={hours}
                                    onChange={(e) => setHours(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--secondary)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-premium"
                                    style={{ flex: 2, height: '60px' }}
                                >
                                    {loading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Deploying Agent...</div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{researchStatus}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <><Sparkles size={20} /> Launch Research Agent</>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    ) : null}

                </div>
            </motion.div >
        </div >
    );
};

export default Planner;
