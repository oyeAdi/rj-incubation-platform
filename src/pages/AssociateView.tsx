import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, BookOpen, Terminal, ArrowRight, Zap, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AssociateView = () => {
    const { id } = useParams();
    const [associate, setAssociate] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [progress, setProgress] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: assocData } = await supabase
                .from('associates')
                .select('*, incubation_plans(*)')
                .eq('id', id)
                .single();

            if (assocData) {
                setAssociate(assocData);
                setPlan(assocData.incubation_plans);

                const { data: progData } = await supabase
                    .from('progress_tracking')
                    .select('day_number')
                    .eq('associate_id', id)
                    .eq('is_completed', true);

                if (progData) setProgress(progData.map(p => p.day_number));
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const toggleDay = async (dayNumber: number) => {
        const isCompleted = progress.includes(dayNumber);

        if (isCompleted) {
            await supabase
                .from('progress_tracking')
                .delete()
                .eq('associate_id', id)
                .eq('day_number', dayNumber);
            setProgress(progress.filter(d => d !== dayNumber));
        } else {
            await supabase
                .from('progress_tracking')
                .upsert({ associate_id: id, day_number: dayNumber, is_completed: true });
            setProgress([...progress, dayNumber]);
        }
    };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-obsidian)' }}><Zap className="animate-spin" size={40} color="var(--primary)" /></div>;
    if (!associate) return <div className="p-8 text-center" style={{ color: 'var(--accent)' }}>Associate registry not found.</div>;

    const progressPercent = Math.round((progress.length / plan.content.days.length) * 100);

    return (
        <div className="associate-dashboard" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-obsidian)', minHeight: '100vh' }}>
            <div className="container">
                <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="gradient-text font-outfit" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                            Hello, {associate.name.split(' ')[0]} ⚡
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Your current mission: <strong style={{ color: 'var(--text-white)' }}>{plan.topic_name}</strong></p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem 2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--secondary-glow)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{progressPercent}%</div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Completion Status</div>
                    </div>
                </header>

                <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {plan.content.days.map((day: any, idx: number) => {
                        const isDone = progress.includes(day.day);
                        return (
                            <motion.div
                                key={day.day}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass"
                                style={{
                                    padding: '2rem',
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'var(--transition-smooth)',
                                    borderTop: isDone ? '4px solid var(--secondary)' : '1px solid var(--border-glass)',
                                    background: isDone ? 'rgba(34, 211, 238, 0.02)' : 'var(--bg-card)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isDone ? 'var(--secondary)' : 'var(--bg-obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isDone ? <Trophy size={20} color="white" /> : <Target size={20} color="var(--text-muted)" />}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>DAY {day.day}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleDay(day.day)}
                                        style={{ background: 'none', color: isDone ? 'var(--secondary)' : 'var(--text-dim)', transform: 'scale(1.2)' }}
                                    >
                                        {isDone ? <CheckCircle2 /> : <Circle />}
                                    </button>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: isDone ? 'var(--text-dim)' : 'var(--text-white)' }}>{day.topic}</h3>

                                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <BookOpen size={14} /> {day.resources.length} Guides
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Terminal size={14} /> {day.tasks.length} Labs
                                    </span>
                                </div>

                                <button
                                    className={isDone ? "btn btn-outline" : "btn btn-premium"}
                                    style={{ width: '100%', padding: '12px' }}
                                    onClick={() => window.open(`/plan/${plan.id}`, '_blank')}
                                >
                                    Enter Mission <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AssociateView;
