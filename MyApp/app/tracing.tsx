import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { LetterTracing } from '../components/LetterTracing';

const LETTERS = {
    'A': { name: 'Letter A', viewBox: '0 0 200 200', paths: ['M 100 40 L 50 160', 'M 100 40 L 150 160', 'M 75 100 L 125 100'] },
    'B': { name: 'Letter B', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 100 40, 100 100, 50 100', 'M 50 100 C 120 100, 120 160, 50 160'] },
    'C': { name: 'Letter C', viewBox: '0 0 200 200', paths: ['M 150 60 C 130 30, 70 30, 50 80 C 30 130, 70 170, 150 140'] },
    'D': { name: 'Letter D', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 150 40, 150 160, 50 160'] },
    'E': { name: 'Letter E', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 L 150 40', 'M 50 100 L 120 100', 'M 50 160 L 150 160'] },
    'F': { name: 'Letter F', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 L 150 40', 'M 50 100 L 120 100'] },
    'G': { name: 'Letter G', viewBox: '0 0 200 200', paths: ['M 150 60 C 130 30, 70 30, 50 80 C 30 130, 70 170, 120 160 L 120 110 L 100 110'] },
    'H': { name: 'Letter H', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 150 40 L 150 160', 'M 50 100 L 150 100'] },
    'I': { name: 'Letter I', viewBox: '0 0 200 200', paths: ['M 100 40 L 100 160', 'M 60 40 L 140 40', 'M 60 160 L 140 160'] },
    'J': { name: 'Letter J', viewBox: '0 0 200 200', paths: ['M 100 40 L 100 140 C 100 180, 50 160, 50 120', 'M 60 40 L 140 40'] },
    'K': { name: 'Letter K', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 150 40 L 50 100', 'M 50 100 L 150 160'] },
    'L': { name: 'Letter L', viewBox: '0 0 200 200', paths: ['M 70 40 L 70 160', 'M 70 160 L 150 160'] },
    'M': { name: 'Letter M', viewBox: '0 0 200 200', paths: ['M 50 160 L 50 40 L 100 100 L 150 40 L 150 160'] },
    'N': { name: 'Letter N', viewBox: '0 0 200 200', paths: ['M 50 160 L 50 40', 'M 50 40 L 150 160', 'M 150 160 L 150 40'] },
    'O': { name: 'Letter O', viewBox: '0 0 200 200', paths: ['M 100 40 C 40 40, 40 160, 100 160 C 160 160, 160 40, 100 40'] },
    'P': { name: 'Letter P', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 120 40, 120 100, 50 100'] },
    'Q': { name: 'Letter Q', viewBox: '0 0 200 200', paths: ['M 100 40 C 40 40, 40 160, 100 160 C 160 160, 160 40, 100 40', 'M 120 120 L 160 180'] },
    'R': { name: 'Letter R', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 160', 'M 50 40 C 120 40, 120 100, 50 100', 'M 50 100 L 150 160'] },
    'S': { name: 'Letter S', viewBox: '0 0 200 200', paths: ['M 150 60 C 120 20, 50 20, 50 70 C 50 120, 150 100, 150 140 C 150 190, 70 190, 40 150'] },
    'T': { name: 'Letter T', viewBox: '0 0 200 200', paths: ['M 50 40 L 150 40', 'M 100 40 L 100 160'] },
    'U': { name: 'Letter U', viewBox: '0 0 200 200', paths: ['M 50 40 L 50 120 C 50 180, 150 180, 150 120 L 150 40'] },
    'V': { name: 'Letter V', viewBox: '0 0 200 200', paths: ['M 50 40 L 100 160 L 150 40'] },
    'W': { name: 'Letter W', viewBox: '0 0 200 200', paths: ['M 40 40 L 70 160 L 100 80 L 130 160 L 160 40'] },
    'X': { name: 'Letter X', viewBox: '0 0 200 200', paths: ['M 50 40 L 150 160', 'M 150 40 L 50 160'] },
    'Y': { name: 'Letter Y', viewBox: '0 0 200 200', paths: ['M 50 40 L 100 100', 'M 150 40 L 100 100', 'M 100 100 L 100 160'] },
    'Z': { name: 'Letter Z', viewBox: '0 0 200 200', paths: ['M 50 40 L 150 40 L 50 160 L 150 160'] }
};

type LetterKey = keyof typeof LETTERS;

export default function TracingScreen() {
    const [selectedLetter, setSelectedLetter] = useState<LetterKey>('A');
    const [strokeWidth, setStrokeWidth] = useState(12);
    const [tolerance, setTolerance] = useState(15);

    const currentLetter = LETTERS[selectedLetter];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Letter Tracing</Text>
                    <Text style={styles.subtitle}>Learn to write with interactive guides</Text>
                </View>

                {/* The key prop forces full unmount/remount on letter change */}
                <LetterTracing
                    key={selectedLetter}
                    guidePaths={currentLetter.paths}
                    viewBox={currentLetter.viewBox}
                    strokeWidth={strokeWidth}
                    tolerance={tolerance}
                />

                <View style={styles.configPanel}>
                    <Text style={styles.configTitle}>Configuration</Text>

                    <Text style={styles.configLabel}>Select Letter</Text>
                    <View style={styles.letterGrid}>
                        {(Object.keys(LETTERS) as LetterKey[]).map(key => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => setSelectedLetter(key)}
                                style={[
                                    styles.letterButton,
                                    selectedLetter === key && styles.letterButtonActive
                                ]}
                            >
                                <Text style={[
                                    styles.letterText,
                                    selectedLetter === key && styles.letterTextActive
                                ]}>
                                    {key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.configRowLabel}>
                        <Text style={styles.configLabel}>Stroke Width</Text>
                        <Text style={styles.configValue}>{strokeWidth}px</Text>
                    </View>
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setStrokeWidth(Math.max(4, strokeWidth - 2))}>
                            <Text style={styles.stepperText}>-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setStrokeWidth(Math.min(24, strokeWidth + 2))}>
                            <Text style={styles.stepperText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.configRowLabel}>
                        <Text style={styles.configLabel}>Error Tolerance</Text>
                        <Text style={styles.configValue}>{tolerance} units</Text>
                    </View>
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setTolerance(Math.max(5, tolerance - 2))}>
                            <Text style={styles.stepperText}>-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stepperButton} onPress={() => setTolerance(Math.min(40, tolerance + 2))}>
                            <Text style={styles.stepperText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    configPanel: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginTop: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    configTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 12,
    },
    configLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    letterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    letterButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
    },
    letterButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    letterText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    letterTextActive: {
        color: '#FFFFFF',
    },
    configRowLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    configValue: {
        fontSize: 14,
        color: '#0F172A',
        fontWeight: '500',
    },
    stepperContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    stepperButton: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    stepperText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
    }
});
