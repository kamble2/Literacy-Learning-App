import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

export interface Point {
    x: number;
    y: number;
}

interface TracingCanvasProps {
    guidePaths: string[];
    viewBox?: string;
    strokeWidth?: number;

    userStrokes: Point[][];
    currentStrokeIndex: number;
    isOffTrack: boolean;
    isCompleted: boolean;

    onPointerDown: (point: Point) => void;
    onPointerMove: (point: Point) => void;
    onPointerUp: () => void;
}

export function TracingCanvas({
    guidePaths,
    viewBox = "0 0 200 200",
    strokeWidth = 12,
    userStrokes,
    currentStrokeIndex,
    isOffTrack,
    isCompleted,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}: TracingCanvasProps) {
    const [layoutDimensions, setLayoutDimensions] = useState({ width: 0, height: 0 });

    const viewBoxParts = viewBox.split(' ').map(Number);
    const vbWidth = viewBoxParts[2] || 200;
    const vbHeight = viewBoxParts[3] || 200;

    const getSVGPoint = (locationX: number, locationY: number): Point | null => {
        if (layoutDimensions.width === 0 || layoutDimensions.height === 0) return null;
        
        // Map native View coordinates to SVG viewBox coordinates
        const scaleX = vbWidth / layoutDimensions.width;
        const scaleY = vbHeight / layoutDimensions.height;
        
        return {
            x: locationX * scaleX,
            y: locationY * scaleY
        };
    };

    const handlePointerDown = (evt: any) => {
        // Fallback for Web where locationX might be offsetX
        const x = evt.nativeEvent.locationX ?? evt.nativeEvent.offsetX;
        const y = evt.nativeEvent.locationY ?? evt.nativeEvent.offsetY;
        const point = getSVGPoint(x, y);
        if (point) onPointerDown(point);
    };

    const handlePointerMove = (evt: any) => {
        const x = evt.nativeEvent.locationX ?? evt.nativeEvent.offsetX;
        const y = evt.nativeEvent.locationY ?? evt.nativeEvent.offsetY;
        const point = getSVGPoint(x, y);
        if (point) onPointerMove(point);
    };

    const handlePointerUp = () => {
        onPointerUp();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setLayoutDimensions({ width, height });
    };

    return (
        <View 
            style={styles.container} 
            onLayout={onLayout}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <Svg viewBox={viewBox} style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Guide Paths */}
                {guidePaths.map((pathStr, index) => {
                    const isCurrent = index === currentStrokeIndex;
                    const isPast = index < currentStrokeIndex;
                    
                    let strokeColor = "#E2E8F0"; // Default guide path color
                    let opacity = 0.3;

                    if (isPast || isCompleted) {
                        strokeColor = "#A7F3D0"; // Success dimmed
                        opacity = 0.3;
                    } else if (isCurrent) {
                        opacity = 1.0;
                    }

                    return (
                        <Path
                            key={`guide-${index}`}
                            d={pathStr}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            opacity={opacity}
                        />
                    );
                })}

                {/* User Strokes */}
                {userStrokes.map((strokePoints, index) => {
                    if (strokePoints.length === 0) return null;

                    const pointsString = strokePoints.map(p => `${p.x},${p.y}`).join(' ');

                    let strokeColor = "#10B981"; // Success (tailwind emerald-500)

                    if (index === currentStrokeIndex) {
                        strokeColor = isOffTrack ? "#EF4444" : "#3B82F6"; // Error red or Primary blue
                    }

                    return (
                        <Polyline
                            key={`user-stroke-${index}`}
                            points={pointsString}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth * 0.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
    }
});
