import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, CheckCircle2, Calendar, BookOpen, Terminal, Clock, Zap, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EnrollBatchModal from '../components/EnrollBatchModal';

const Loader2 = ({ className, size, color }: any) => (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className={className}>
        <Zap size={size} color={color} />
    </motion.div>
);

const LabItem = ({ task }: { task: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            padding: '12px',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
        }} onClick={() => setIsExpanded(!isExpanded)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    minWidth: '32px', height: '32px', borderRadius: '50%',
                    background: task.type === 'hands-on' ? 'var(--secondary-glow)' : 'var(--bg-obsidian)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <CheckCircle2 size={16} color={task.type === 'hands-on' ? 'var(--secondary)' : 'var(--text-muted)'} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: 500 }}>{task.title || task.text}</span>
                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>
                    <Zap size={14} />
                </motion.span>
            </div>

            {isExpanded && task.details && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ padding: '0.5rem 0.5rem 0.5rem 3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}
                >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {task.details}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const SharedPlan = ({ draftPlan }: { draftPlan?: any }) => {
    const { id } = useParams();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(!draftPlan);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (draftPlan) {
            setPlan({ content: draftPlan, topic_name: draftPlan.title, duration_weeks: draftPlan.duration_weeks });
            setLoading(false);
            return;
        }

        const fetchPlan = async () => {
            const { data } = await supabase
                .from('incubation_plans')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setPlan(data);
            setLoading(false);
        };
        fetchPlan();
    }, [id, draftPlan]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-obsidian)' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    if (!plan) return <div className="p-8 text-center" style={{ color: 'var(--accent)' }}>Error: Plan not found.</div>;

    return (
        <div className="shared-page-container" style={{ padding: '6rem 2rem', background: 'var(--bg-obsidian)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="font-outfit" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>
                            {plan.topic_name}
                        </h1>
                        <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-dim)', fontSize: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={18} color="var(--primary)" /> {plan.duration_weeks} Weeks
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} color="var(--secondary)" /> 5 Days/Week
                            </span>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleShare}
                            className="btn btn-outline"
                            style={{
                                borderColor: copied ? 'var(--secondary)' : 'var(--border-glass)',
                                color: copied ? 'var(--secondary)' : 'var(--text-white)',
                                minWidth: '140px'
                            }}
                        >
                            {copied ? (
                                <><CheckCircle2 size={18} /> Copied!</>
                            ) : (
                                <><Share2 size={18} /> Share Plan</>
                            )}
                        </button>
                        <EnrollBatchModal planId={plan.id} />
                    </motion.div>
                </header>

                <div className="timeline-container" style={{ position: 'relative' }}>
                    {/* Vertical line connector */}
                    <div style={{ position: 'absolute', left: '20px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, var(--primary), var(--secondary))', opacity: 0.2 }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {plan.content.days.map((day: any, idx: number) => (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="timeline-item"
                                style={{ display: 'flex', gap: '3rem' }}
                            >
                                <div className="day-card" style={{
                                    minWidth: '100px', height: '100px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '24px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    position: 'relative', zIndex: 1
                                }}>
                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Day</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{day.day}</span>
                                </div>

                                <div className="glass" style={{ flex: 1, padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
                                    <h3 className="font-outfit" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {day.topic}
                                    </h3>

                                    <div className="grid-2">
                                        <div className="section">
                                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <BookOpen size={16} /> Curated Resources
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {day.resources.map((res: any, rIdx: number) => (
                                                    <a key={rIdx} href={res.url} target="_blank" className="resource-link" style={{
                                                        color: 'var(--text-white)',
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '12px 16px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        borderRadius: '12px',
                                                        transition: 'var(--transition-smooth)'
                                                    }}>
                                                        <span style={{ fontSize: '0.95rem' }}>{res.title}</span>
                                                        <ExternalLink size={16} color="var(--secondary)" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="section">
                                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Terminal size={16} /> Hands-on Labs
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {day.tasks.map((task: any, tIdx: number) => (
                                                    <LabItem key={tIdx} task={task} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SharedPlan;
