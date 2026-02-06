import React, { useState } from 'react';
import { Container } from '../components/layout/container';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveProfile, updateProfile, getNextQuestion } from '../services/api';

const steps = [
    {
        id: 'basics',
        title: "Let's start with the basics",
        description: "Tell us a bit about yourself so we can personalize your journey.",
        fields: [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Alex Johnson' },
            { name: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 18' },
            { name: 'currentEducation', label: 'Current Education Level', type: 'select', options: ['High School', 'Undergraduate', 'Postgraduate', 'Working Professional'] },
            { name: 'english_proficiency', label: 'English Proficiency', type: 'select', options: ['Native', 'Advanced', 'Intermediate', 'Beginner'] }
        ]
    },
    {
        id: 'interests',
        title: "What are you interested in?",
        description: "Help us find the best programs for you.",
        fields: [
            { name: 'intended_major', label: 'Preferred Major', type: 'text', placeholder: 'e.g. Computer Science' },
            { name: 'interests', label: 'Specific Interests (comma separated)', type: 'text', placeholder: 'e.g. AI, Robotics, Ethics' },
            { name: 'country_preference', label: 'Preferred Countries (comma separated)', type: 'text', placeholder: 'e.g. USA, Germany' }
        ]
    },
    {
        id: 'goals',
        title: "Your Goals & Budget",
        description: "We'll optimize recommendations based on these constraints.",
        fields: [
            { name: 'career_goal', label: 'Dream Career / Goal', type: 'text', placeholder: 'e.g. AI Researcher' },
            { name: 'budget_range', label: 'Annual Budget', type: 'select', options: ['Less than $10k', '$10k - $30k', '$30k - $50k', '$50k+'] },
            { name: 'risk_tolerance', label: 'Risk Tolerance', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
    }
];

const MAX_DYNAMIC_QUESTIONS = 3;

const Questionnaire = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Dynamic Question State
    const [isDynamicPhase, setIsDynamicPhase] = useState(false);
    const [dynamicQuestion, setDynamicQuestion] = useState(null);
    const [dynamicAnswer, setDynamicAnswer] = useState("");
    const [dynamicCount, setDynamicCount] = useState(0);
    const [profileId, setProfileId] = useState(null);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicAnswerChange = (e) => {
        setDynamicAnswer(e.target.value);
    };

    const handleNext = async () => {
        // STATIC PHASE LOGIC
        if (!isDynamicPhase) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                // Submit Initial Profile and Enter Dynamic Phase
                setLoading(true);
                try {
                    const studentId = 'student_' + Math.random().toString(36).substr(2, 9);
                    const profileData = {
                        id: studentId,
                        // gpa removed
                        intended_major: formData.intended_major,
                        career_goal: formData.career_goal,
                        country_preference: formData.country_preference,
                        budget_range: formData.budget_range,
                        english_proficiency: formData.english_proficiency || 'Intermediate',
                        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()) : [],
                        risk_tolerance: formData.risk_tolerance || 'Medium',
                        academic_strengths: [],
                        academic_weaknesses: [],
                        dynamic_answers: []
                    };

                    await saveProfile(profileData);
                    setProfileId(studentId);

                    // Fetch First Dynamic Question
                    try {
                        const aiRes = await getNextQuestion(studentId);
                        // Expecting aiRes to match Prompt Template JSON { question, reason }
                        // Note: Backend aiController returns { status: 'success', data: { question, reason } }
                        const questionData = aiRes.data;

                        setDynamicQuestion(questionData);
                        setIsDynamicPhase(true);
                        setDynamicCount(1);
                    } catch (aiError) {
                        console.error("Failed to fetch dynamic question, skipping:", aiError);
                        navigate('/loading', { state: { profileId: studentId } });
                    }

                } catch (error) {
                    console.error("Form processing error", error);
                    navigate('/loading', { state: { profileId: 'demo_id' } });
                } finally {
                    setLoading(false);
                }
            }
        }
        // DYNAMIC PHASE LOGIC
        else {
            if (!dynamicAnswer.trim()) return; // Prevent empty answers

            setLoading(true);
            try {
                // Save answer to backend
                await updateProfile(profileId, {
                    // We append the new answer. In real app we might want to store Q&A pairs.
                    // For now, simpler: just push to a list in the backend if supported, 
                    // or we accept that 'updateProfile' merges. 
                    // Since backend 'saveProfile' merges top-level keys, to append to an array we'd need to fetch-modify-save or have specific backend logic.
                    // Let's assume we send 'last_answer' or similar for the AI to see next time,
                    // or ideally we actually updated the profile. 
                    // BUT: storageService merge is shallow for top level. 
                    // Hack for prototype: We just send the answer as a field 'last_response' 
                    // or we rely on the client keeping track?
                    // Let's rely on the fact that PROMPTS don't strictly need history if we just want "another" question,
                    // but usually they do. 
                    // Let's send `dynamic_context: { q: ..., a: ... }` to backend?
                    // Given constraints, I'll send `additional_info: dynamicAnswer` to update the profile context.
                    additional_info: (formData.additional_info || "") + `\nQ: ${dynamicQuestion.question}\nA: ${dynamicAnswer}`
                });

                // Update local formdata so next append works
                setFormData(prev => ({
                    ...prev,
                    additional_info: (prev.additional_info || "") + `\nQ: ${dynamicQuestion.question}\nA: ${dynamicAnswer}`
                }));

                setDynamicAnswer(""); // Clear input

                if (dynamicCount < MAX_DYNAMIC_QUESTIONS) {
                    const aiRes = await getNextQuestion(profileId);
                    setDynamicQuestion(aiRes.data);
                    setDynamicCount(prev => prev + 1);
                } else {
                    // Finished dynamic questions
                    navigate('/loading', { state: { profileId } });
                }

            } catch (error) {
                console.error("Dynamic phase error", error);
                navigate('/loading', { state: { profileId } });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (!isDynamicPhase && currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentTitle = isDynamicPhase ? "AI Follow-up Question" : steps[currentStep].title;
    const currentDesc = isDynamicPhase ? "Our AI needs a bit more detail to perfect your roadmap." : steps[currentStep].description;
    const progress = isDynamicPhase
        ? 90 + ((dynamicCount / MAX_DYNAMIC_QUESTIONS) * 10)
        : ((currentStep + 1) / steps.length) * 90; // Scale static to 90%

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background py-12">
            <Container className="max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
                        <span>{isDynamicPhase ? `AI Analysis: Question ${dynamicCount}/${MAX_DYNAMIC_QUESTIONS}` : `Step ${currentStep + 1} of ${steps.length}`}</span>
                        <span>{Math.round(progress)}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isDynamicPhase ? `dynamic-${dynamicCount}` : currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-2 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">{dynamicQuestion ? "AI Question" : currentTitle}</CardTitle>
                                <CardDescription className="text-lg">{currentDesc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isDynamicPhase ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                            <p className="font-medium text-lg text-primary">
                                                {dynamicQuestion?.question || "Thinking..."}
                                            </p>
                                            {dynamicQuestion?.reason && (
                                                <p className="text-sm text-muted-foreground mt-2 italic">
                                                    Why we ask: {dynamicQuestion.reason}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Your Answer</label>
                                            <Input
                                                value={dynamicAnswer}
                                                onChange={handleDynamicAnswerChange}
                                                placeholder="Type your answer here..."
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    steps[currentStep].fields.map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    name={field.name}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="" disabled>Select an option</option>
                                                    {field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Input
                                                    type={field.type}
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.name] || ''}
                                                    onChange={handleInputChange}
                                                    autoFocus={true}
                                                />
                                            )}
                                        </div>
                                    )))}
                            </CardContent>
                            <CardFooter className="flex justify-between pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={currentStep === 0 || isDynamicPhase}
                                    className={currentStep === 0 || isDynamicPhase ? "invisible" : ""}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleNext} disabled={loading}>
                                    {loading ? 'Processing...' : (
                                        isDynamicPhase
                                            ? (dynamicCount < MAX_DYNAMIC_QUESTIONS ? 'Next Question' : 'View Results')
                                            : (currentStep === steps.length - 1 ? 'Begin Analysis' : 'Next')
                                    )}
                                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </Container>
        </div>
    );
};

export default Questionnaire;
