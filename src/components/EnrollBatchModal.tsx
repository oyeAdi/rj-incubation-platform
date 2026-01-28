import { useState } from 'react';
import { Plus, X, Loader2, Link as LinkIcon, Trash2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const EnrollBatchModal = ({ planId }: { planId: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [names, setNames] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState<any[]>([]);

    const handleEnroll = async () => {
        setLoading(true);
        const validNames = names.filter(n => n.trim() !== '');

        try {
            const newAssociates = validNames.map(name => ({
                name,
                plan_id: planId
            }));

            const { data, error } = await supabase
                .from('associates')
                .insert(newAssociates)
                .select();

            if (error) throw error;
            if (data) setEnrolled(data);
        } catch (error) {
            console.error('Enrollment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeName = (index: number) => {
        if (names.length > 1) {
            setNames(names.filter((_, i) => i !== index));
        }
    };

    return (
        <>
            <button className="btn btn-premium" onClick={() => setIsOpen(true)}>
                <UserPlus size={18} /> Deploy Batch
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="glass"
                            style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: 'var(--radius-xl)', position: 'relative' }}
                        >
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setEnrolled([]);
                                    setNames(['']);
                                }}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', color: 'var(--text-muted)' }}
                            >
                                <X size={24} />
                            </button>

                            <h2 className="font-outfit" style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 800 }}>Deploy Associates</h2>

                            {enrolled.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="glass" style={{ background: 'rgba(34, 211, 238, 0.05)', padding: '1.2rem', borderRadius: 'var(--radius-md)', color: 'var(--secondary)', border: '1px solid var(--secondary-glow)' }}>
                                        Succesfully onboarded {enrolled.length} associates to the program.
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {enrolled.map(assoc => (
                                            <div key={assoc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                                                <span style={{ fontWeight: 500 }}>{assoc.name}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/associate/${assoc.id}`);
                                                    }}
                                                    className="btn btn-outline"
                                                    style={{ padding: '8px', borderRadius: '50%', minWidth: '40px', height: '40px' }}
                                                >
                                                    <LinkIcon size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn btn-premium" onClick={() => setIsOpen(false)} style={{ marginTop: '1rem' }}>Done</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                        {names.map((name, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '0.8rem' }}>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    placeholder="Full Name"
                                                    onChange={(e) => {
                                                        const newNames = [...names];
                                                        newNames[idx] = e.target.value;
                                                        setNames(newNames);
                                                    }}
                                                    className="input-premium"
                                                    style={{ flex: 1 }}
                                                />
                                                {names.length > 1 && (
                                                    <button onClick={() => removeName(idx)} style={{ background: 'none', color: 'var(--accent)', opacity: 0.6 }}>
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => setNames([...names, ''])}
                                            className="btn btn-outline"
                                            style={{ flex: 1 }}
                                        >
                                            <Plus size={18} /> Add Member
                                        </button>
                                        <button className="btn btn-premium" onClick={handleEnroll} disabled={loading} style={{ flex: 1.5 }}>
                                            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Onboarding'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EnrollBatchModal;
