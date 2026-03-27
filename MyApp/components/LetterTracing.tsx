import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TracingCanvas, Point } from './TracingCanvas';
import { svgPathProperties } from 'svg-path-properties';

interface LetterTracingProps {
    guidePaths: string[]; 
    viewBox?: string;
    strokeWidth?: number;
    tolerance?: number;
    completionThreshold?: number;
    onComplete?: () => void;
}

export function LetterTracing({
    guidePaths,
    viewBox = "0 0 200 200",
    strokeWidth = 12,
    tolerance = 15,
    onComplete
}: LetterTracingProps) {
    const [userStrokes, setUserStrokes] = useState<Point[][]>([]);
    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isOffTrack, setIsOffTrack] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const [sampledStrokes, setSampledStrokes] = useState<Point[][]>([]);

    // Scribble & Direction tracking refs
    const maxCoveredIndex = useRef(0);
    const consecutiveOffTrack = useRef(0);

    const handleResetAll = useCallback(() => {
        setUserStrokes(guidePaths.map(() => []));
        setCurrentStrokeIndex(0);
        setIsDrawing(false);
        setIsOffTrack(false);
        setIsCompleted(false);
        maxCoveredIndex.current = 0;
        consecutiveOffTrack.current = 0;
    }, [guidePaths]);

    useEffect(() => {
        if (guidePaths.length === 0) return;

        try {
            const strokes: Point[][] = [];
            for (const pathStr of guidePaths) {
                const properties = new svgPathProperties(pathStr);
                const length = properties.getTotalLength();
                const step = 4; // Sample every 4 units
                const points: Point[] = [];

                for (let i = 0; i <= length; i += step) {
                    const pt = properties.getPointAtLength(i);
                    points.push({ x: pt.x, y: pt.y });
                }

                // exact end point
                const endPt = properties.getPointAtLength(length);
                points.push({ x: endPt.x, y: endPt.y });
                strokes.push(points);
            }

            setSampledStrokes(strokes);
            handleResetAll();
        } catch (e) {
            console.error("Failed to sample SVG paths", e);
        }
    }, [guidePaths, handleResetAll]);

    const distance = (p1: Point, p2: Point) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const resetCurrentStroke = useCallback(() => {
        setIsDrawing(false);
        setIsOffTrack(false);
        maxCoveredIndex.current = 0;
        consecutiveOffTrack.current = 0;

        setUserStrokes(prev => {
            const copy = [...prev];
            copy[currentStrokeIndex] = [];
            return copy;
        });
    }, [currentStrokeIndex]);

    const validatePoint = useCallback((pt: Point, isStart: boolean = false) => {
        if (sampledStrokes.length === 0 || isCompleted) return false;

        const currentSampled = sampledStrokes[currentStrokeIndex];
        if (!currentSampled) return false;

        let closestIndex = -1;
        let minDistance = Infinity;

        const startIndex = isStart ? 0 : maxCoveredIndex.current;
        const endIndex = Math.min(currentSampled.length, startIndex + 20);

        for (let i = startIndex; i < endIndex; i++) {
            const d = distance(pt, currentSampled[i]);
            if (d < minDistance) {
                minDistance = d;
                closestIndex = i;
            }
        }

        if (isStart) {
            if (minDistance > tolerance * 2 || closestIndex > 8) {
                return false;
            }
            maxCoveredIndex.current = closestIndex;
            setIsOffTrack(false);
            return true;
        }

        if (minDistance > tolerance) {
            setIsOffTrack(true);
            consecutiveOffTrack.current += 1;

            if (consecutiveOffTrack.current > 15) {
                resetCurrentStroke();
                return false;
            }
        } else {
            setIsOffTrack(false);
            consecutiveOffTrack.current = 0;

            if (closestIndex > maxCoveredIndex.current) {
                maxCoveredIndex.current = closestIndex;
            }
        }

        return true;
    }, [sampledStrokes, currentStrokeIndex, tolerance, isCompleted, resetCurrentStroke]);


    const handlePointerDown = (pt: Point) => {
        if (isCompleted || guidePaths.length === 0) return;

        const success = validatePoint(pt, true);
        if (success) {
            setIsDrawing(true);
            consecutiveOffTrack.current = 0;

            setUserStrokes(prev => {
                const copy = [...prev];
                copy[currentStrokeIndex] = [pt];
                return copy;
            });
        } else {
            setIsOffTrack(true);
            setTimeout(() => setIsOffTrack(false), 300);
        }
    };

    const handlePointerMove = (pt: Point) => {
        if (!isDrawing || isCompleted) return;

        setUserStrokes(prev => {
            const copy = [...prev];
            if (copy[currentStrokeIndex]) {
                copy[currentStrokeIndex] = [...copy[currentStrokeIndex], pt];
            }
            return copy;
        });

        validatePoint(pt);
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setIsOffTrack(false);

        if (sampledStrokes.length > 0 && currentStrokeIndex < sampledStrokes.length) {
            const currentSampled = sampledStrokes[currentStrokeIndex];

            if (maxCoveredIndex.current >= currentSampled.length - 8) {
                const nextIdx = currentStrokeIndex + 1;

                if (nextIdx >= sampledStrokes.length) {
                    setIsCompleted(true);
                    if (onComplete) onComplete();
                } else {
                    setCurrentStrokeIndex(nextIdx);
                    maxCoveredIndex.current = 0;
                }
            } else {
                resetCurrentStroke();
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={[
                styles.canvasContainer,
                { borderColor: isOffTrack ? '#EF4444' : isCompleted ? '#10B981' : '#E2E8F0' }
            ]}>
                <TracingCanvas
                    guidePaths={guidePaths}
                    viewBox={viewBox}
                    strokeWidth={strokeWidth}
                    userStrokes={userStrokes}
                    currentStrokeIndex={currentStrokeIndex}
                    isOffTrack={isOffTrack}
                    isCompleted={isCompleted}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                />

                {isCompleted && (
                    <View style={styles.completionBadge}>
                        <Text style={styles.completionText}>✓ Perfect</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.strokeText}>
                    Stroke: <Text style={styles.strokeTextBold}>
                        {isCompleted ? 'Done' : `${currentStrokeIndex + 1} of ${guidePaths.length}`}
                    </Text>
                </Text>
                <TouchableOpacity onPress={handleResetAll} style={styles.resetButton}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        gap: 24,
    },
    canvasContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        position: 'relative',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    completionBadge: {
        position: 'absolute',
        top: 24,
        right: 24,
        backgroundColor: '#10B981',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    completionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    strokeText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    strokeTextBold: {
        color: '#0F172A',
        fontWeight: '700',
    },
    resetButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
    },
    resetButtonText: {
        color: '#0F172A',
        fontSize: 14,
        fontWeight: '600',
    }
});
