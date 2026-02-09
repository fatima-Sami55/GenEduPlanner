import React, { useState, useEffect } from 'react';
import { Container } from '../components/layout/container';
import { Button } from '../components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, X, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoadmap, getRecommendations } from '../services/api'; // Ensure getRecommendations is used if needed
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Results = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [roadmapData, setRoadmapData] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [selectedPhase, setSelectedPhase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const studentId = localStorage.getItem('currentStudentId');

            // Logic: Data might be passed from Loading state OR we fetch it.
            // For now, let's try to fetch if not present, but our API might not support simple GET without re-generating in some simple backends.
            // Ideally, the Loading page passed the data.

            if (location.state?.roadmap) {
                setRoadmapData(location.state.roadmap);
                setRecommendations(location.state.recommendations);
                setLoading(false);
            } else if (studentId) {
                // Try to fetch or regenerate if missing (fallback)
                try {
                    // Check if we have stored data in localStorage as a backup
                    const storedRoadmap = localStorage.getItem('roadmapData');
                    const storedRecs = localStorage.getItem('recommendationsData');

                    if (storedRoadmap && storedRecs) {
                        setRoadmapData(JSON.parse(storedRoadmap));
                        setRecommendations(JSON.parse(storedRecs));
                        setLoading(false);
                    } else {
                        // If strictly protected, we should have it. If not, maybe redirect to loading?
                        // For now, let's assume protection worked and data is available or we redirect.
                        navigate('/');
                    }
                } catch (e) {
                    console.error("Error loading data", e);
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        };

        fetchData();
    }, [navigate, location.state]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo
        doc.text("AskGem Career Plan", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated for User ID: ${localStorage.getItem('currentStudentId')?.substring(0, 8)}`, 14, 30);

        let yPos = 40;

        // Recommendations
        if (recommendations?.recommendations) {
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("University Recommendations", 14, yPos);
            yPos += 10;

            const recData = recommendations.recommendations.map(rec => [
                rec.university,
                rec.major,
                rec.country,
                rec.tuition_fees
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['University', 'Major', 'Country', 'Tuition']],
                body: recData,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });

            yPos = doc.lastAutoTable.finalY + 20;
        }

        // Roadmap
        if (roadmapData?.roadmap) {
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text("Strategic Roadmap", 14, yPos);
            yPos += 10;

            const roadmapRows = roadmapData.roadmap.map(phase => [
                phase.phase,
                phase.timeline,
                phase.cost_estimate
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Phase', 'Timeline', 'Est. Cost']],
                body: roadmapRows,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129] } // Green for roadmap
            });

            yPos = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text("Detailed actions for each phase are available in the interactive web view.", 14, yPos);
        }

        doc.save("AskGem_Career_Plan.pdf");
    };

    if (loading) return null;

    if (location.state?.error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Container className="max-w-md text-center">
                    <div className="bg-destructive/10 p-6 rounded-full inline-block mb-6">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Generation Failed</h2>
                    <p className="text-muted-foreground mb-8">
                        {location.state.errorMessage || "We couldn't generate your roadmap at this time. Please try again."}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/questionnaire')} className="w-full">
                            Retake Assessment
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                            Back to Home
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pt-20 pb-20">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <Container className="max-w-4xl">
                <div className="mb-8">
                    <Link to="/">
                        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-brand">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">Strategy</span> is Ready
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                            A personalized path designed to maximize your admission chances and minimize costs.
                        </p>
                    </motion.div>
                </div>

                {/* Recommendations Grid */}
                {recommendations?.recommendations && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="bg-brand/10 p-2 rounded-xl text-brand text-xl">🏛️</span>
                            Top Matches
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.recommendations.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-brand/30 transition-all group"
                                >
                                    <div className="mb-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-brand mb-1">{rec.country}</div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-brand transition-colors">{rec.university}</h3>
                                        <p className="text-sm text-muted-foreground">{rec.major}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-border/50">
                                        <span className="font-mono font-medium">{rec.tuition_fees}</span>
                                        <span className="text-success font-medium text-xs bg-success/10 px-2 py-1 rounded-full">
                                            {rec.admission_probability} Prob.
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Roadmap Cards */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="bg-accent/10 p-2 rounded-xl text-accent text-xl">🗺️</span>
                        Action Plan
                    </h2>
                    <div className="space-y-4">
                        {roadmapData?.roadmap?.map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                onClick={() => setSelectedPhase(phase)}
                                className="bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/60 p-6 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-card hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-brand mb-1 uppercase tracking-wider">{phase.timeline}</div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{phase.phase}</h3>
                                        <p className="text-muted-foreground line-clamp-1">{phase.description}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs text-muted-foreground">Est. Cost</div>
                                            <div className="font-bold text-success text-lg" dangerouslySetInnerHTML={{ __html: phase.cost_estimate.replace(/\*\*/g, '') }} />
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                                            <ChevronRight />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button onClick={handleDownloadPDF} size="lg" className="bg-brand hover:bg-brand/90 text-white rounded-full px-8 shadow-lg shadow-brand/20">
                        <Download className="mr-2 h-4 w-4" /> Download Full PDF
                    </Button>
                    {/* <Button variant="outline" size="lg" className="rounded-full px-8">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button> */}
                </div>
            </Container>

            {/* Bottom-Up Modal */}
            <AnimatePresence>
                {selectedPhase && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPhase(null)}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl border-t border-border max-h-[85vh] overflow-y-auto"
                        >
                            <div className="max-w-3xl mx-auto p-8 pb-20 relative">
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedPhase(null)}
                                    className="absolute top-4 right-4 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </Button>

                                <div className="mt-6">
                                    <span className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-4">
                                        {selectedPhase.timeline}
                                    </span>
                                    <h2 className="text-3xl font-bold mb-4">{selectedPhase.phase}</h2>
                                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                        {selectedPhase.description}
                                    </p>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="text-success h-5 w-5" /> Key Actions
                                            </h3>
                                            <ul className="space-y-3">
                                                {selectedPhase.actions.map((action, i) => (
                                                    <li key={i} className="flex gap-3 text-foreground/90 p-3 rounded-xl bg-secondary/30">
                                                        <span className="text-brand font-bold">•</span>
                                                        <span dangerouslySetInnerHTML={{ __html: action.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-secondary/20 p-5 rounded-2xl">
                                                <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Skills to Learn</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPhase.skills_to_learn.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-white dark:bg-secondary rounded-md text-sm font-medium border border-border/50">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/20">
                                                <h4 className="font-semibold mb-2 text-sm uppercase text-green-600 dark:text-green-400">Financial Estimate</h4>
                                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                    <span dangerouslySetInnerHTML={{ __html: selectedPhase.cost_estimate.replace(/\*\*(.*?)\*\*/g, '$1') }} />
                                                </div>
                                                <p className="text-xs text-green-600/80 dark:text-green-400/70 mt-1">Includes exam fees & applications</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-border flex justify-center">
                                        <Button onClick={() => setSelectedPhase(null)} className="rounded-full px-8 w-full sm:w-auto">
                                            Close Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Results;
