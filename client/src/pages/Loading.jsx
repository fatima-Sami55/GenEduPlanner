import React, { useEffect, useState } from 'react';
import { Container } from '../components/layout/container';
import { Loader } from '../components/ui/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRecommendations, getRoadmap } from '../services/api';

const stages = [
    "Analyzing your academic profile...",
    "Scanning 1,500+ global universities...",
    "Matching eligible scholarships...",
    "Crafting your personalized roadmap...",
    "Finalizing report..."
];

const Loading = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const profileId = location.state?.profileId;

    useEffect(() => {
        // Stage cycler for visual effect
        const stageInterval = setInterval(() => {
            setCurrentStage(prev => {
                if (prev < stages.length - 1) return prev + 1;
                return prev;
            });
        }, 1500);

        // Fetch Data Logic
        const fetchData = async () => {
            // Minimum delay to show off the cool animation
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 3000));

            try {
                // Parallel data fetching
                // Note: In real app, we might wait for one before another or handle partial failures.
                // Assuming backend endpoints work or return mocks.
                // Sequential data fetching because Roadmap depends on Recommendations being generated first

                // 1. Start Minimum Delay (don't await yet)
                const minDelayPromise = new Promise(resolve => setTimeout(resolve, 3000));

                // 2. Fetch Recommendations first
                const recData = await getRecommendations(profileId);

                // 3. Fetch Roadmap (now that recommendations are likely saved in backend session/db logic)
                const roadmapData = await getRoadmap(profileId);

                // 4. Ensure min delay is met
                await minDelayPromise;

                // Navigate with data
                navigate('/results', {
                    state: {
                        results: recData,
                        roadmap: roadmapData,
                        profileId: profileId
                    }
                });

            } catch (error) {
                console.error("Error fetching AI results:", error);

                // FALLBACK FOR DEMO if API fails (e.g. backend not running)
                // Wait for min delay anyway
                await minDelayPromise;
                navigate('/results', {
                    state: {
                        error: true,
                        profileId: profileId
                    }
                });
            }
        };

        if (profileId || true) { // allow running even without ID for demo testing
            fetchData();
        }

        return () => clearInterval(stageInterval);
    }, [navigate, profileId]);

    return (
        <Container className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md text-center space-y-8">
                <Loader />

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 animate-pulse">
                        {stages[currentStage]}
                    </h2>

                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Loading;
