import { useState, useEffect } from 'react';
import { Users, Plus, Search, Layers, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
    const [associates, setAssociates] = useState<any[]>([]);
    const [view, setView] = useState<'associates' | 'plans'>('plans');
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: assocData } = await supabase
                .from('associates')
                .select('*, incubation_plans(topic_name, content), progress_tracking(day_number)');

            if (assocData) setAssociates(assocData);

            const { data: planData } = await supabase
                .from('incubation_plans')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (planData) setPlans(planData);
        };
        fetchData();
    }, []);

    const deletePlan = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Safety Check: Check for enrolled associates
        const { count, error: countError } = await supabase
            .from('associates')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', id);

        if (countError) {
            alert('Error checking plan usage: ' + countError.message);
            return;
        }

        if (count && count > 0) {
            alert(`Cannot delete plan: ${count} active associate(s) are currently enrolled in this plan. Please reassign or remove them first.`);
            return;
        }

        if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;

        const { error } = await supabase
            .from('incubation_plans')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            setPlans(plans.filter(p => p.id !== id));
        } else {
            alert('Failed to delete plan: ' + error.message);
        }
    };

    const deleteAssociate = async (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to remove ${name}? Their progress and data will be permanently deleted.`)) return;

        const { error } = await supabase
            .from('associates')
            .delete()
            .eq('id', id);

        if (!error) {
            setAssociates(associates.filter(a => a.id !== id));
        } else {
            alert('Failed to delete associate: ' + error.message);
        }
    };

    const totalAssociates = associates.length;

    return (
        <div className="admin-dashboard-container" style={{ padding: '6rem 2rem', background: 'var(--bg-obsidian)', minHeight: '100vh' }}>
            <div className="container">
                <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="gradient-text font-outfit" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.8rem' }}>Manager Insights</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Orchestrating <strong style={{ color: 'var(--text-white)' }}>{totalAssociates}</strong> active associates across your programs.</p>
                    </div>
                    <button className="btn btn-premium" onClick={() => window.location.href = '/'}>
                        <Plus size={18} /> Design New Incubation
                    </button>
                </header>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div
                        className="glass glass-hover"
                        onClick={() => setView('associates')}
                        style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1.5rem', alignItems: 'center', cursor: 'pointer', border: view === 'associates' ? '1px solid var(--primary)' : '1px solid var(--border-glass)' }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={30} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Talent</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{totalAssociates}</h2>
                        </div>
                    </div>
                    <div
                        className="glass glass-hover"
                        onClick={() => setView('plans')}
                        style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '1.5rem', alignItems: 'center', borderRight: '4px solid var(--secondary)', cursor: 'pointer', border: view === 'plans' ? '1px solid var(--secondary)' : '1px solid var(--border-glass)' }}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(34, 211, 238, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={30} color="var(--secondary)" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Library</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{plans.length}</h2>
                        </div>
                    </div>
                </div>

                {view === 'associates' ? (
                    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <h3 className="font-outfit" style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Users size={20} color="var(--primary)" /> Associate Pipeline
                            </h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    style={{ padding: '8px 12px 8px 36px', background: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>Associate</th>
                                        <th style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>Incubation Module</th>
                                        <th style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>Milestone Tracker</th>
                                        <th style={{ padding: '1.5rem 2rem', fontWeight: 600, textAlign: 'right' }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {associates.map((assoc, idx) => {
                                        const prog = Math.round((assoc.progress_tracking.length / assoc.incubation_plans.content.days.length) * 100);
                                        return (
                                            <motion.tr
                                                key={assoc.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                style={{ borderTop: '1px solid var(--border-glass)', transition: 'var(--transition-smooth)' }}
                                                className="table-row-hover"
                                            >
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                                            {assoc.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{assoc.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {assoc.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: 500 }}>{assoc.incubation_plans.topic_name}</span>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <div style={{ width: '200px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                                            <span style={{ color: 'var(--text-dim)' }}>Progress</span>
                                                            <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{prog}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${prog}%` }}
                                                                style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                                            onClick={() => window.open(`/associate/${assoc.id}`, '_blank')}
                                                        >
                                                            Inspect <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => deleteAssociate(assoc.id, assoc.name, e)}
                                                            className="btn btn-outline"
                                                            style={{
                                                                padding: '8px',
                                                                color: '#ef4444',
                                                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                                                background: 'rgba(239, 68, 68, 0.05)'
                                                            }}
                                                            title="Remove Associate"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {associates.length === 0 && (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No associates deployed yet. Start by generating a plan and enrolling a batch.
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass glass-hover"
                                style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                                onClick={() => window.open(`/plan/${plan.id}`, '_blank')}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', zIndex: 10 }}>
                                    <button
                                        onClick={(e) => deletePlan(plan.id, e)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                        title="Delete Plan"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.5, zIndex: 1 }}>
                                    <Layers size={80} color="var(--border-glass)" />
                                </div>
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '8px 16px', background: 'var(--primary-glow)', borderRadius: '20px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                                            {plan.duration_weeks} Weeks
                                        </div>
                                    </div>
                                    <h3 className="font-outfit" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                                        {plan.topic_name}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                        Created on {new Date(plan.created_at).toLocaleDateString()}
                                    </p>
                                    <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                                        View Plan <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
