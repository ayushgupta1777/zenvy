import React from 'react';
import { TouchableOpacity, Text, Linking, StyleSheet, View } from 'react-native';

/**
 * Reusable Footer component to display "Made by Adsngrow" with a clickable link.
 * 
 * @param {Object} props
 * @param {string} props.color - Custom color for the text (optional)
 * @param {number} props.marginTop - Custom top margin (optional, default: 30)
 * @param {number} props.paddingBottom - Custom bottom padding (optional, default: 20)
 */
const AdsngrowFooter = ({ color, marginTop = 30, paddingBottom = 20 }) => {
    const handlePress = () => {
        Linking.openURL('https://adsngrow.in').catch((err) =>
            console.error("Couldn't load page", err)
        );
    };

    return (
        <View style={[styles.container, { marginTop, paddingBottom }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
                <Text style={[styles.text, color ? { color } : null]}>
                    Made by <Text style={styles.linkText}>Adsngrow</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text: {
        fontSize: 13,
        color: '#6B7280', // Default grey for visibility
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    linkText: {
        color: '#4F46E5', // Primary indigo color for the link part
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});

export default AdsngrowFooter;
